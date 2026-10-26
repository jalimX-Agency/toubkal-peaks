<?php

namespace App\Console\Commands;

use App\Models\Media;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use League\MimeTypeDetection\ExtensionMimeTypeDetector;

class UploadMedia extends Command
{
    protected $signature = 'media:upload
        {--source= : Folder holding the original image files (default: MEDIA_SOURCE_DIR)}
        {--disk= : Target disk (default: MEDIA_DISK, normally r2)}
        {--force : Upload again even if the file already exists on the disk}
        {--dry-run : Only report what would be uploaded}';

    protected $description = 'Upload the images referenced in the media table to the media disk (Cloudflare R2)';

    public function handle(): int
    {
        $source = rtrim((string) ($this->option('source') ?: env('MEDIA_SOURCE_DIR')), '/\\');
        $diskName = $this->option('disk') ?: config('filesystems.media_disk');
        if ($source === '' || ! is_dir($source)) {
            $this->error('Give the images folder with --source=... (or set MEDIA_SOURCE_DIR).');

            return self::FAILURE;
        }

        $disk = Storage::disk($diskName);
        $mime = new ExtensionMimeTypeDetector;
        $dry = (bool) $this->option('dry-run');
        $stats = ['uploaded' => 0, 'already there' => 0, 'missing locally' => 0, 'failed' => 0];
        $problems = [];

        $total = Media::count();
        $bar = $this->output->createProgressBar($total);
        foreach (Media::orderBy('id')->cursor() as $media) {
            $bar->advance();
            $local = $source.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $media->path);
            try {
                if (! $this->option('force') && $disk->getDriver()->fileExists($media->path)) {
                    $stats['already there']++;
                    $dry || $media->update(['disk' => $diskName]);

                    continue;
                }
                if (! is_file($local)) {
                    $stats['missing locally']++;
                    $problems[] = "missing: {$media->path}";

                    continue;
                }
                if (! $dry) {
                    $disk->put($media->path, file_get_contents($local));
                    $media->update([
                        'disk' => $diskName,
                        'size' => filesize($local),
                        'mime' => $mime->detectMimeTypeFromPath($media->path),
                    ]);
                }
                $stats['uploaded']++;
            } catch (\Throwable $e) {
                $stats['failed']++;
                $problems[] = "failed: {$media->path} ({$e->getMessage()})";
            }
        }
        $bar->finish();
        $this->newLine(2);

        $this->table(array_keys($stats), [array_values($stats)]);
        foreach (array_slice($problems, 0, 20) as $line) {
            $this->warn($line);
        }
        $dry && $this->comment('Dry run: nothing was uploaded.');

        return $stats['failed'] || $stats['missing locally'] ? self::FAILURE : self::SUCCESS;
    }
}
