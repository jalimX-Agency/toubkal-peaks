<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\CategoryTranslation;
use App\Models\Media;
use App\Models\Review;
use App\Models\TeamMember;
use App\Models\Tour;
use App\Models\TourPrice;
use App\Models\TourTranslation;
use App\Support\FrontendCache;
use App\Support\R2\R2Adapter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use League\Flysystem\Filesystem;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(FrontendCache::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Booking form: a few requests per minute and a daily cap per IP (spam protection).
        RateLimiter::for('bookings', fn (Request $request) => [
            Limit::perMinute(3)->by($request->ip()),
            Limit::perDay(20)->by($request->ip()),
        ]);

        // Any change to what the website shows refreshes its cache for that kind of data.
        $affects = [
            Tour::class => ['tours'],
            TourTranslation::class => ['tours'],
            TourPrice::class => ['tours'],
            Media::class => ['tours'],
            Category::class => ['categories', 'tours'],
            CategoryTranslation::class => ['categories', 'tours'],
            Review::class => ['reviews'],
            TeamMember::class => ['team'],
        ];
        foreach ($affects as $model => $tags) {
            $refresh = fn () => app(FrontendCache::class)->revalidate(...$tags);
            $model::saved($refresh);
            $model::deleted($refresh);
        }

        // Cloudflare R2 disk (see config/filesystems.php): `Storage::disk('r2')`
        Storage::extend('r2', function ($app, array $config) {
            $adapter = new R2Adapter(
                $config['endpoint'],
                $config['bucket'],
                $config['key'],
                $config['secret'],
                $config['cache_control'] ?? 'public, max-age=31536000, immutable',
                $config['url'] ?? null,
            );

            return new FilesystemAdapter(new Filesystem($adapter, $config), $adapter, $config);
        });
    }
}
