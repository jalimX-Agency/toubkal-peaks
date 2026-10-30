<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\Tour;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/** A trip's photos: upload, order (the first is the main photo), remove, describe; and the photo library. */
class TourImageController extends Controller
{
    /** Photos are uploaded one at a time (the website's server limits a request's size). */
    public function store(Request $request, Tour $tour): JsonResponse
    {
        $request->validate(['photo' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:min_width=800']]);
        $file = $request->file('photo');
        $disk = config('filesystems.media_disk');
        $slug = Str::limit((string) $tour->translate(config('locales.fallback'))?->slug, 60, '') ?: "trip-{$tour->id}";
        $path = 'site/trips/'.$slug.'-'.Str::lower(Str::random(8)).'.'.$file->extension();

        Storage::disk($disk)->put($path, file_get_contents($file->getRealPath()));
        [$width, $height] = getimagesize($file->getRealPath()) ?: [null, null];
        $title = $tour->translate(config('locales.fallback'))?->title;
        $media = Media::create([
            'disk' => $disk, 'path' => $path, 'mime' => $file->getMimeType(), 'size' => $file->getSize(),
            'width' => $width, 'height' => $height, 'alt' => $title ? ['en' => $title] : null,
        ]);

        $ids = $tour->media()->pluck('media.id')->all();
        $this->apply($tour, [...$ids, $media->id]);

        return response()->json(['data' => $this->images($tour->fresh())], 201);
    }

    /**
     * Body: { ids: [12, 4, 9] }, the trip's photos in order, the first being the main photo. Photos left
     * out are removed from the trip (the files stay in the library); ids of library photos add them.
     */
    public function order(Request $request, Tour $tour): JsonResponse
    {
        $ids = $request->validate(['ids' => ['present', 'array', 'max:30'], 'ids.*' => ['integer', 'distinct', 'exists:media,id']])['ids'];
        $this->apply($tour, $ids);

        return response()->json(['data' => $this->images($tour->fresh())]);
    }

    /** Body: { alt: { en: "...", fr: "..." } }, what the photo shows, per language. */
    public function describe(Request $request, Tour $tour, Media $media): JsonResponse
    {
        abort_unless($tour->media()->whereKey($media->id)->exists(), 404);
        $alt = $request->validate(['alt' => ['required', 'array'], 'alt.en' => ['required', 'string', 'max:200'], 'alt.*' => ['nullable', 'string', 'max:200']])['alt'];
        $media->update(['alt' => array_filter(array_intersect_key($alt, array_flip(config('locales.supported'))), fn ($v) => $v !== null && $v !== '')]);
        $tour->touch();

        return response()->json(['data' => $this->images($tour->fresh())]);
    }

    /** The photo library (every trip photo), newest first, searchable by description. Query: q, page. */
    public function library(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        $page = Media::query()
            ->where('path', 'like', 'site/trips/%')
            ->when($q !== '', fn ($query) => $query->where(fn ($w) => $w->where('alt', 'like', '%'.str_replace(['%', '_'], ['\%', '\_'], $q).'%')->orWhere('path', 'like', '%'.Str::slug($q).'%')))
            ->latest('id')
            ->paginate(24);

        return response()->json([
            'data' => $page->getCollection()->map(fn (Media $m) => $this->present($m))->values(),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()],
        ]);
    }

    /** @param list<int> $ids */
    private function apply(Tour $tour, array $ids): void
    {
        DB::transaction(function () use ($tour, $ids) {
            $sync = [];
            foreach (array_values($ids) as $i => $id) {
                $sync[$id] = ['role' => $i === 0 ? 'hero' : 'gallery', 'sort_order' => $i];
            }
            $tour->media()->sync($sync);
            // saving the trip also refreshes the website's pages
            $tour->forceFill(['hero_media_id' => $ids[0] ?? null])->save();
            $tour->touch();
        });
    }

    /** @return list<array> */
    public function images(Tour $tour): array
    {
        return $tour->media()->get()->map(fn (Media $m) => $this->present($m) + ['is_main' => $m->id === $tour->hero_media_id])->values()->all();
    }

    private function present(Media $m): array
    {
        return ['id' => $m->id, 'url' => $m->url(), 'width' => $m->width, 'height' => $m->height, 'size' => $m->size, 'alt' => (object) ($m->alt ?? [])];
    }
}
