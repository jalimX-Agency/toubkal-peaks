<?php

namespace Tests\Feature;

use App\Models\Media;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UploadMediaTest extends TestCase
{
    use RefreshDatabase;

    private string $source;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('r2test');
        $this->source = sys_get_temp_dir().DIRECTORY_SEPARATOR.'tp-media-'.uniqid();
        File::makeDirectory($this->source.'/2019/09', 0777, true);
        File::put($this->source.'/2019/09/a.jpg', 'AAA');
        File::put($this->source.'/2019/09/b.png', 'BBBB');
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->source);
        parent::tearDown();
    }

    private function run_(array $extra = []): \Illuminate\Testing\PendingCommand
    {
        return $this->artisan('media:upload', ['--source' => $this->source, '--disk' => 'r2test'] + $extra);
    }

    public function test_it_uploads_files_updates_the_media_rows_and_skips_existing_ones(): void
    {
        Media::create(['path' => '2019/09/a.jpg']);
        Media::create(['path' => '2019/09/b.png']);

        $this->run_()->assertExitCode(0);
        Storage::disk('r2test')->assertExists(['2019/09/a.jpg', '2019/09/b.png']);
        $this->assertSame(['r2test', 'r2test'], Media::orderBy('id')->pluck('disk')->all());
        $this->assertSame(3, (int) Media::where('path', '2019/09/a.jpg')->value('size'));
        $this->assertSame('image/png', Media::where('path', '2019/09/b.png')->value('mime'));

        File::put($this->source.'/2019/09/a.jpg', 'CHANGED');
        $this->run_()->assertExitCode(0);                                    // already there -> untouched
        $this->assertSame('AAA', Storage::disk('r2test')->get('2019/09/a.jpg'));
        $this->run_(['--force' => true])->assertExitCode(0);                 // forced -> replaced
        $this->assertSame('CHANGED', Storage::disk('r2test')->get('2019/09/a.jpg'));
    }

    public function test_dry_run_uploads_nothing(): void
    {
        Media::create(['path' => '2019/09/a.jpg']);

        $this->run_(['--dry-run' => true])->assertExitCode(0);

        Storage::disk('r2test')->assertMissing('2019/09/a.jpg');
        $this->assertSame('public', Media::first()->disk);
    }

    public function test_missing_local_files_make_the_command_fail(): void
    {
        Media::create(['path' => '2019/09/nope.jpg']);

        $this->run_()->assertExitCode(1);
        Storage::disk('r2test')->assertMissing('2019/09/nope.jpg');
    }

    public function test_it_needs_a_source_folder(): void
    {
        $this->artisan('media:upload', ['--source' => $this->source.'/does-not-exist'])->assertExitCode(1);
    }
}
