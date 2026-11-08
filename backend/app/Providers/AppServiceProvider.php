<?php

namespace App\Providers;

use App\Models\BlogPost;
use App\Models\Category;
use App\Models\CategoryTranslation;
use App\Models\Media;
use App\Models\Redirect;
use App\Models\Review;
use App\Models\Setting;
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
        // The website sends the form from its own server, so the visitor's address comes in X-Client-IP
        // (without it, every visitor would share the server's address and the limit would mean nothing).
        RateLimiter::for('bookings', function (Request $request) {
            $ip = filter_var($request->header('X-Client-IP'), FILTER_VALIDATE_IP) ?: $request->ip();

            return [Limit::perMinute(3)->by($ip), Limit::perDay(20)->by($ip)];
        });

        RateLimiter::for('events', function (Request $request) {
            $ip = filter_var($request->header('X-Client-IP'), FILTER_VALIDATE_IP) ?: $request->ip();

            return Limit::perMinute(40)->by($ip);
        });

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
            Setting::class => ['settings'],
            Redirect::class => ['redirects'],
            BlogPost::class => ['blog'],
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
