<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\TeamMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/** The people on the website's About page: text in every language, photo, order and visibility. */
class TeamMemberController extends Controller
{
    public function index(): JsonResponse
    {
        $members = TeamMember::with('photo')->orderBy('sort_order')->orderBy('id')->get();

        return response()->json(['data' => $members->map(fn (TeamMember $m) => $this->present($m))->values()]);
    }

    public function store(Request $request): JsonResponse
    {
        $member = TeamMember::create($this->validated($request) + ['sort_order' => (int) TeamMember::max('sort_order') + 1]);

        return response()->json(['data' => $this->present($member)], 201);
    }

    public function update(Request $request, TeamMember $member): JsonResponse
    {
        $member->update($this->validated($request, partial: true));

        return response()->json(['data' => $this->present($member->fresh('photo'))]);
    }

    public function destroy(TeamMember $member): JsonResponse
    {
        $member->delete();

        return response()->json(['message' => 'Removed from the team page.']);
    }

    /** New photo (JPEG, PNG or WebP, up to 2 MB), stored on the media disk; the old file stays for history. */
    public function photo(Request $request, TeamMember $member): JsonResponse
    {
        $request->validate(['photo' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:min_width=400,min_height=400']]);
        $file = $request->file('photo');
        $disk = config('filesystems.media_disk');
        $path = 'site/team/'.Str::slug($member->name).'-'.Str::lower(Str::random(8)).'.'.$file->extension();

        Storage::disk($disk)->put($path, file_get_contents($file->getRealPath()));
        [$width, $height] = getimagesize($file->getRealPath()) ?: [null, null];
        $media = Media::create([
            'disk' => $disk, 'path' => $path, 'mime' => $file->getMimeType(), 'size' => $file->getSize(),
            'width' => $width, 'height' => $height, 'alt' => $member->photo_alt,
        ]);
        $member->update(['photo_media_id' => $media->id]);

        return response()->json(['data' => $this->present($member->fresh('photo'))]);
    }

    /** Body: { ids: [3, 1, 2] }, the new order of everyone on the page. */
    public function reorder(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => ['required', 'array', 'max:100'], 'ids.*' => ['integer', 'exists:team_members,id']])['ids'];
        DB::transaction(function () use ($ids) {
            foreach (array_values($ids) as $i => $id) {
                TeamMember::whereKey($id)->first()?->update(['sort_order' => $i]);
            }
        });

        return $this->index();
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';
        $rules = [
            'name' => [$required, 'string', 'max:80'],
            'role' => [$required, 'array'],
            'role.en' => [$required, 'string', 'max:120'],
            'role.*' => ['nullable', 'string', 'max:120'],
            'bio' => [$required, 'array'],
            'bio.en' => [$required, 'array', 'min:1', 'max:12'],
            'bio.*' => ['nullable', 'array', 'max:12'],
            'bio.*.*' => ['nullable', 'string', 'max:2000'],
            'photo_alt' => ['nullable', 'array'],
            'photo_alt.*' => ['nullable', 'string', 'max:200'],
            'is_active' => ['sometimes', 'boolean'],
        ];
        $data = $request->validate($rules, [], ['role.en' => 'role (English)', 'bio.en' => 'biography (English)']);

        // only the site's languages are kept
        foreach (['role', 'bio', 'photo_alt'] as $field) {
            if (isset($data[$field])) {
                $data[$field] = array_intersect_key($data[$field], array_flip(config('locales.supported')));
            }
        }

        return $data;
    }

    private function present(TeamMember $m): array
    {
        return [
            'id' => $m->id,
            'name' => $m->name,
            'role' => (object) ($m->role ?? []),
            'bio' => (object) ($m->bio ?? []),
            'photo_alt' => (object) ($m->photo_alt ?? []),
            'photo' => $m->photo ? ['url' => $m->photo->url(), 'width' => $m->photo->width, 'height' => $m->photo->height] : null,
            'sort_order' => $m->sort_order,
            'is_active' => $m->is_active,
            'updated_at' => $m->updated_at?->toIso8601String(),
        ];
    }
}
