<?php

namespace App\Providers;

use App\Support\R2\R2Adapter;
use Illuminate\Filesystem\FilesystemAdapter;
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
