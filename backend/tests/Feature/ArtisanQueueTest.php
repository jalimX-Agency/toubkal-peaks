<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Support\ArtisanQueue;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class ArtisanQueueTest extends TestCase
{
    use RefreshDatabase;

    private string $dir;

    private string $file;

    protected function setUp(): void
    {
        parent::setUp();
        $this->dir = sys_get_temp_dir().DIRECTORY_SEPARATOR.'tp-queue-'.uniqid();
        File::makeDirectory($this->dir);
        $this->file = $this->dir.'/artisan-queue.txt';
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->dir);
        parent::tearDown();
    }

    private function queue(array $allowed = ArtisanQueue::ALLOWED): ArtisanQueue
    {
        return new ArtisanQueue($this->file, $allowed);
    }

    public function test_parse_accepts_allowed_commands_with_plain_options_only(): void
    {
        $q = $this->queue();

        $this->assertSame(['toubkal:import', []], $q->parse('toubkal:import'));
        $this->assertSame(['toubkal:import', ['--publish' => true, '--disk' => 'r2']], $q->parse('toubkal:import --publish --disk=r2'));
        $this->assertSame(['db:seed', ['--force' => true]], $q->parse('db:seed --force'));

        $this->assertNull($q->parse('migrate:fresh'));                          // not allow-listed
        $this->assertNull($q->parse('db:wipe --force'));
        $this->assertNull($q->parse('toubkal:import; rm -rf /'));               // shell-ish garbage
        $this->assertNull($q->parse('toubkal:import --tours=../../etc/passwd')); // path traversal
        $this->assertNull($q->parse('toubkal:import positional'));              // only options are accepted
        $this->assertNull($q->parse('TOUBKAL:IMPORT'));
    }

    public function test_a_missing_file_does_nothing(): void
    {
        $this->assertSame([], $this->queue()->process(app(Kernel::class)));
    }

    public function test_commands_run_once_and_are_removed_but_comments_stay(): void
    {
        File::put($this->file, "# my notes\ncache:clear\n\nmigrate:fresh\n");

        $results = $this->queue(['cache:clear'])->process(app(Kernel::class));

        $this->assertSame(['ok', 'rejected'], array_column($results, 'status'));
        $this->assertSame(['cache:clear', 'migrate:fresh'], array_column($results, 'line'));
        $this->assertNotSame('', $results[0]['output']);
        $this->assertSame("# my notes\n\n", str_replace("\r\n", "\n", File::get($this->file)));   // only comment + blank line remain
        $this->assertSame([], $this->queue(['cache:clear'])->process(app(Kernel::class)));             // nothing left to run
    }

    public function test_a_failing_command_is_reported_and_not_retried(): void
    {
        File::put($this->file, "toubkal:import --tours=/does/not/exist.json\n");

        $results = $this->queue()->process(app(Kernel::class));

        $this->assertSame('failed', $results[0]['status']);
        $this->assertStringContainsString('File not found', $results[0]['output']);
        $this->assertSame('', File::get($this->file));
    }

    public function test_it_can_run_the_real_tour_import(): void
    {
        File::put($this->file, "toubkal:import\n");

        $results = $this->queue()->process(app(Kernel::class));

        $this->assertSame('ok', $results[0]['status']);
        $this->assertSame(59, Tour::count());
        $this->assertSame(0, Tour::where('status', 'published')->count());     // imported as drafts
    }
}
