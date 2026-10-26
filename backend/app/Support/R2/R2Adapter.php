<?php

namespace App\Support\R2;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use League\Flysystem\Config;
use League\Flysystem\DirectoryAttributes;
use League\Flysystem\FileAttributes;
use League\Flysystem\FilesystemAdapter;
use League\Flysystem\UnableToCheckDirectoryExistence;
use League\Flysystem\UnableToCheckFileExistence;
use League\Flysystem\UnableToCopyFile;
use League\Flysystem\UnableToDeleteFile;
use League\Flysystem\UnableToListContents;
use League\Flysystem\UnableToMoveFile;
use League\Flysystem\UnableToReadFile;
use League\Flysystem\UnableToRetrieveMetadata;
use League\Flysystem\UnableToWriteFile;
use League\MimeTypeDetection\ExtensionMimeTypeDetector;

/**
 * Flysystem adapter for Cloudflare R2 (S3 API, path-style) built on Laravel's HTTP client.
 * It replaces the heavy aws-sdk-php package: shared hosting only has to install a few small files.
 * R2 has no ACLs, so visibility calls are no-ops; public access comes from the bucket's public URL.
 */
class R2Adapter implements FilesystemAdapter
{
    private SigV4 $signer;

    private ExtensionMimeTypeDetector $mime;

    public function __construct(
        private readonly string $endpoint,
        private readonly string $bucket,
        string $accessKey,
        string $secretKey,
        private readonly string $cacheControl = 'public, max-age=31536000, immutable',
        private readonly ?string $publicUrl = null,
    ) {
        $this->signer = new SigV4($accessKey, $secretKey);
        $this->mime = new ExtensionMimeTypeDetector;
    }

    /** Public URL of an object (used by Storage::url()); needs the bucket's public domain in R2_PUBLIC_URL. */
    public function getUrl(string $path): string
    {
        if (! $this->publicUrl) {
            throw new \RuntimeException('R2_PUBLIC_URL is not set, cannot build public URLs.');
        }

        return rtrim($this->publicUrl, '/').'/'.implode('/', array_map('rawurlencode', explode('/', ltrim($path, '/'))));
    }

    // ── reads ───────────────────────────────────────────────────────────────

    public function fileExists(string $path): bool
    {
        $response = $this->send('HEAD', $path);
        if ($response->status() === 404) {
            return false;
        }
        if (! $response->successful()) {
            throw UnableToCheckFileExistence::forLocation($path, new \RuntimeException($this->error($response)));
        }

        return true;
    }

    public function directoryExists(string $path): bool
    {
        try {
            $page = $this->listPage(rtrim($path, '/').'/', false, null, 1);
        } catch (\Throwable $e) {
            throw UnableToCheckDirectoryExistence::forLocation($path, $e);
        }

        return $page['files'] !== [] || $page['directories'] !== [];
    }

    public function read(string $path): string
    {
        $response = $this->send('GET', $path);
        if (! $response->successful()) {
            throw UnableToReadFile::fromLocation($path, $this->error($response));
        }

        return $response->body();
    }

    public function readStream(string $path)
    {
        $stream = fopen('php://temp', 'w+b');
        fwrite($stream, $this->read($path));
        rewind($stream);

        return $stream;
    }

    public function fileSize(string $path): FileAttributes
    {
        return new FileAttributes($path, (int) $this->head($path, 'size')->header('Content-Length'));
    }

    public function mimeType(string $path): FileAttributes
    {
        return new FileAttributes($path, null, null, null, $this->head($path, 'mime_type')->header('Content-Type'));
    }

    public function lastModified(string $path): FileAttributes
    {
        $value = $this->head($path, 'last_modified')->header('Last-Modified');

        return new FileAttributes($path, null, null, $value ? strtotime($value) : null);
    }

    public function visibility(string $path): FileAttributes
    {
        return new FileAttributes($path, null, 'public');
    }

    public function listContents(string $path, bool $deep): iterable
    {
        $prefix = $path === '' ? '' : rtrim($path, '/').'/';
        $token = null;
        do {
            try {
                $page = $this->listPage($prefix, $deep, $token, 1000);
            } catch (\Throwable $e) {
                throw UnableToListContents::atLocation($path, $deep, $e);
            }
            foreach ($page['directories'] as $dir) {
                yield new DirectoryAttributes(rtrim($dir, '/'));
            }
            foreach ($page['files'] as $file) {
                yield new FileAttributes($file['key'], $file['size'], null, $file['modified']);
            }
            $token = $page['next'];
        } while ($token !== null);
    }

    // ── writes ──────────────────────────────────────────────────────────────

    public function write(string $path, string $contents, Config $config): void
    {
        $response = $this->send('PUT', $path, [], $contents, [
            'content-type' => (string) ($config->get('ContentType') ?? $this->mime->detectMimeTypeFromPath($path) ?? 'application/octet-stream'),
            'cache-control' => (string) ($config->get('CacheControl') ?? $this->cacheControl),
        ]);
        if (! $response->successful()) {
            throw UnableToWriteFile::atLocation($path, $this->error($response));
        }
    }

    public function writeStream(string $path, $contents, Config $config): void
    {
        $this->write($path, (string) stream_get_contents($contents), $config);
    }

    public function delete(string $path): void
    {
        $response = $this->send('DELETE', $path);
        if (! $response->successful() && $response->status() !== 404) {
            throw UnableToDeleteFile::atLocation($path, $this->error($response));
        }
    }

    public function deleteDirectory(string $path): void
    {
        foreach ($this->listContents($path, true) as $item) {
            if ($item instanceof FileAttributes) {
                $this->delete($item->path());
            }
        }
    }

    public function createDirectory(string $path, Config $config): void
    {
        // object stores have no real directories
    }

    public function setVisibility(string $path, string $visibility): void
    {
        // R2 has no ACLs
    }

    public function move(string $source, string $destination, Config $config): void
    {
        try {
            $this->copy($source, $destination, $config);
            $this->delete($source);
        } catch (\Throwable $e) {
            throw UnableToMoveFile::fromLocationTo($source, $destination, $e);
        }
    }

    public function copy(string $source, string $destination, Config $config): void
    {
        $response = $this->send('PUT', $destination, [], '', [
            'x-amz-copy-source' => $this->uri($source),
        ]);
        if (! $response->successful()) {
            throw UnableToCopyFile::fromLocationTo($source, $destination, new \RuntimeException($this->error($response)));
        }
    }

    // ── internals ───────────────────────────────────────────────────────────

    private function head(string $path, string $attribute): Response
    {
        $response = $this->send('HEAD', $path);
        if (! $response->successful()) {
            throw match ($attribute) {
                'size' => UnableToRetrieveMetadata::fileSize($path, $this->error($response)),
                'mime_type' => UnableToRetrieveMetadata::mimeType($path, $this->error($response)),
                default => UnableToRetrieveMetadata::lastModified($path, $this->error($response)),
            };
        }

        return $response;
    }

    /** @return array{files:list<array{key:string,size:int,modified:int|null}>, directories:list<string>, next:?string} */
    private function listPage(string $prefix, bool $deep, ?string $token, int $max): array
    {
        $query = ['list-type' => '2', 'max-keys' => (string) $max];
        if ($prefix !== '') {
            $query['prefix'] = $prefix;
        }
        if (! $deep) {
            $query['delimiter'] = '/';
        }
        if ($token !== null) {
            $query['continuation-token'] = $token;
        }
        $response = $this->send('GET', '', $query);
        if (! $response->successful()) {
            throw new \RuntimeException($this->error($response));
        }

        $xml = simplexml_load_string($response->body());
        $files = $directories = [];
        foreach ($xml->Contents ?? [] as $c) {
            if (str_ends_with((string) $c->Key, '/')) {
                continue;   // "folder" placeholder objects
            }
            $files[] = ['key' => (string) $c->Key, 'size' => (int) $c->Size, 'modified' => strtotime((string) $c->LastModified) ?: null];
        }
        foreach ($xml->CommonPrefixes ?? [] as $p) {
            $directories[] = (string) $p->Prefix;
        }
        $truncated = strtolower((string) $xml->IsTruncated) === 'true';

        return ['files' => $files, 'directories' => $directories, 'next' => $truncated ? (string) $xml->NextContinuationToken : null];
    }

    private function uri(string $key = ''): string
    {
        $encoded = $key === '' ? '' : '/'.implode('/', array_map('rawurlencode', explode('/', ltrim($key, '/'))));

        return '/'.$this->bucket.$encoded;
    }

    /**
     * @param  array<string,string>  $query
     * @param  array<string,string>  $headers
     */
    private function send(string $method, string $key = '', array $query = [], string $body = '', array $headers = []): Response
    {
        $uri = $this->uri($key);
        $host = parse_url($this->endpoint, PHP_URL_HOST);
        if ($port = parse_url($this->endpoint, PHP_URL_PORT)) {
            $host .= ':'.$port;
        }
        $signed = $this->signer->sign($method, $uri, $query, $headers + ['host' => $host], hash('sha256', $body), now());
        unset($signed['host']);

        $url = rtrim($this->endpoint, '/').$uri.($query ? '?'.http_build_query($query, '', '&', PHP_QUERY_RFC3986) : '');
        $contentType = $signed['content-type'] ?? 'application/octet-stream';
        unset($signed['content-type']);

        // Retry transient network errors and 5xx answers; 4xx (404 for missing files, 403...) are returned as they are.
        return Http::withHeaders($signed)
            ->connectTimeout(15)
            ->timeout(60)
            ->retry(3, 400, fn ($e) => $e instanceof ConnectionException
                || ($e instanceof RequestException && $e->response->serverError()), throw: false)
            ->withBody($body, $contentType)
            ->send($method, $url);
    }

    private function error(Response $response): string
    {
        $code = '';
        if (preg_match('#<Code>(.*?)</Code>#', $response->body(), $m)) {
            $code = ' '.$m[1];
        }

        return 'R2 responded HTTP '.$response->status().$code;
    }
}
