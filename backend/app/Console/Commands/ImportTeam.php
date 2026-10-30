<?php

namespace App\Console\Commands;

use App\Models\Media;
use App\Models\TeamMember;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportTeam extends Command
{
    protected $signature = 'toubkal:import-team
        {--file= : Team file (default: database/data/team.json)}
        {--disk= : Disk holding the photos (default: MEDIA_DISK)}
        {--force : Replace the team even if it was already set up (edits made in the admin are lost)}';

    protected $description = 'Put the first About page team in the database (photos already on the media disk); afterwards the team is managed in the admin';

    public function handle(): int
    {
        if (TeamMember::exists() && ! $this->option('force')) {
            $this->info('The team is already set up: nothing imported (it is managed in the admin; --force replaces it).');

            return self::SUCCESS;
        }
        $file = $this->option('file') ?: database_path('data/team.json');
        $members = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR)['members'];
        $disk = $this->option('disk') ?: config('filesystems.media_disk');

        DB::transaction(function () use ($members, $disk) {
            TeamMember::query()->delete();
            foreach (array_values($members) as $i => $m) {
                $photo = Media::updateOrCreate(['path' => $m['photo']], [
                    'disk' => $disk, 'mime' => 'image/jpeg', 'width' => $m['width'], 'height' => $m['height'], 'alt' => $m['photo_alt'],
                ]);
                TeamMember::create([
                    'name' => $m['name'], 'role' => $m['role'], 'bio' => $m['bio'], 'photo_alt' => $m['photo_alt'],
                    'photo_media_id' => $photo->id, 'sort_order' => $i, 'is_active' => true,
                ]);
            }
        });
        $this->info(count($members).' team members imported.');

        return self::SUCCESS;
    }
}
