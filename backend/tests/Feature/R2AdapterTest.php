<?php

namespace Tests\Feature;

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Sleep;
use League\Flysystem\FileAttributes;
use Tests\TestCase;

class R2AdapterTest extends TestCase
{
    private const BASE = 'https://acct123.r2.cloudflarestorage.com/media-bucket';

    protected function setUp(): void
    {
        parent::setUp();
        config(['filesystems.disks.r2test' => [
            'driver' => 'r2',
            'key' => 'KEYID',
            'secret' => 'SECRET',
            'bucket' => 'media-bucket',
            'endpoint' => 'https://acct123.r2.cloudflarestorage.com',
            'url' => 'https://cdn.example.com',
            'throw' => true,
        ]]);
        Storage::forgetDisk('r2test');
    }

    public function test_write_sends_a_signed_put_with_content_type_and_cache_headers(): void
    {
        Http::fake([self::BASE.'/*' => Http::response('', 200)]);

        Storage::disk('r2test')->put('2019/09/my photo.jpg', 'BINARY');

        Http::assertSent(function (Request $request) {
            $h = collect($request->headers())->mapWithKeys(fn ($v, $k) => [strtolower($k) => $v[0]]);

            return $request->method() === 'PUT'
                && $request->url() === self::BASE.'/2019/09/my%20photo.jpg'
                && $request->body() === 'BINARY'
                && str_starts_with($h['authorization'], 'AWS4-HMAC-SHA256 Credential=KEYID/')
                && str_contains($h['authorization'], '/auto/s3/aws4_request')
                && $h['content-type'] === 'image/jpeg'
                && str_contains($h['cache-control'], 'immutable')
                && $h['x-amz-content-sha256'] === hash('sha256', 'BINARY');
        });
    }

    public function test_exists_delete_and_public_url(): void
    {
        Http::fake([
            self::BASE.'/there.jpg' => Http::sequence()->push('', 200)->push('', 204),
            self::BASE.'/gone.jpg' => Http::response('', 404),
            self::BASE.'?*' => Http::response('<ListBucketResult><IsTruncated>false</IsTruncated></ListBucketResult>', 200),
        ]);
        $disk = Storage::disk('r2test');

        $this->assertTrue($disk->exists('there.jpg'));
        $this->assertFalse($disk->getDriver()->fileExists('gone.jpg'));   // one HEAD request, no directory listing
        $this->assertFalse($disk->exists('gone.jpg'));                    // Laravel also checks "directory gone.jpg/"
        $disk->delete('there.jpg');
        $this->assertSame('https://cdn.example.com/2019/09/a.jpg', $disk->url('2019/09/a.jpg'));
    }

    public function test_transient_failures_are_retried_but_client_errors_are_not(): void
    {
        Sleep::fake();
        Http::fake([
            self::BASE.'/flaky.jpg' => Http::sequence()->pushFailedConnection()->push('', 503)->push('', 200),
            self::BASE.'/denied.jpg' => Http::response('', 403),
        ]);
        $driver = Storage::disk('r2test')->getDriver();

        $this->assertTrue($driver->fileExists('flaky.jpg'));            // connection error, 503, then success
        Http::assertSentCount(3);

        Http::fake([self::BASE.'/denied.jpg' => Http::response('', 403)]);
        try {
            $driver->fileExists('denied.jpg');
            $this->fail('403 must raise an exception');
        } catch (\League\Flysystem\UnableToCheckFileExistence) {
            Http::assertSentCount(1);                                    // no retry on a 4xx
        }
    }

    public function test_errors_surface_as_exceptions_with_the_r2_error_code(): void
    {
        Http::fake([self::BASE.'/*' => Http::response('<Error><Code>AccessDenied</Code></Error>', 403)]);

        $this->expectException(\League\Flysystem\UnableToWriteFile::class);
        $this->expectExceptionMessage('AccessDenied');
        Storage::disk('r2test')->put('x.jpg', 'data');
    }

    public function test_listing_parses_files_and_directories(): void
    {
        $xml = '<?xml version="1.0"?><ListBucketResult><IsTruncated>false</IsTruncated>'
            .'<Contents><Key>2019/a.jpg</Key><Size>10</Size><LastModified>2026-01-01T00:00:00.000Z</LastModified></Contents>'
            .'<Contents><Key>2019/b.jpg</Key><Size>20</Size><LastModified>2026-01-02T00:00:00.000Z</LastModified></Contents>'
            .'<CommonPrefixes><Prefix>2019/09/</Prefix></CommonPrefixes></ListBucketResult>';
        Http::fake([self::BASE.'?*' => Http::response($xml, 200)]);

        $disk = Storage::disk('r2test');

        $this->assertSame(['2019/a.jpg', '2019/b.jpg'], $disk->files('2019'));
        $this->assertSame(['2019/09'], $disk->directories('2019'));
        Http::assertSent(fn (Request $r) => str_contains($r->url(), 'list-type=2')
            && str_contains($r->url(), 'prefix=2019%2F') && str_contains($r->url(), 'delimiter=%2F'));
    }

    public function test_metadata_comes_from_head_headers(): void
    {
        Http::fake([self::BASE.'/a.jpg' => Http::response('', 200, [
            'Content-Length' => '1234', 'Content-Type' => 'image/jpeg', 'Last-Modified' => 'Wed, 21 Oct 2026 07:28:00 GMT',
        ])]);
        $disk = Storage::disk('r2test');

        $this->assertSame(1234, $disk->size('a.jpg'));
        $this->assertSame('image/jpeg', $disk->mimeType('a.jpg'));
        $this->assertSame(strtotime('Wed, 21 Oct 2026 07:28:00 GMT'), $disk->lastModified('a.jpg'));
        $this->assertInstanceOf(FileAttributes::class, $disk->getAdapter()->visibility('a.jpg'));
    }
}
