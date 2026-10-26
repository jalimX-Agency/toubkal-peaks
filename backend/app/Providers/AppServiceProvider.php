<?php

namespace App\Providers;

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
        //
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
