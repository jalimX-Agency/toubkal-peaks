<?php

namespace App\Support;

use Illuminate\Contracts\Console\Kernel;
use Throwable;

/**
 * One-time Artisan commands for hosting without a terminal.
 *
 * Put commands, one per line, in storage/app/artisan-queue.txt (File Manager). The cron script
 * runs them once after the migrations and removes them from the file, whatever the outcome, so a
 * failing command is never retried in a loop. Only allow-listed commands and plain `--option` /
 * `--option=value` arguments are accepted; anything else is rejected and logged.
 *
 *   # lines starting with # are comments and stay in the file
 *   toubkal:import
 */
class ArtisanQueue
{
    /** Commands that may be queued. Destructive ones (migrate:fresh, db:wipe...) are deliberately absent. */
    public const ALLOWED = ['toubkal:import', 'toubkal:import-translations', 'toubkal:publish', 'db:seed', 'cache:clear'];

    /** @param list<string> $allowed */
    public function __construct(
        private readonly string $file,
        private readonly array $allowed = self::ALLOWED,
    ) {}

    /**
     * @return array{0:string,1:array<string,string|bool>}|null [command, arguments] or null if the line is not acceptable
     */
    public function parse(string $line): ?array
    {
        if (! preg_match('/^([a-z]+:[a-z-]+)((?:\s+--[a-z-]+(?:=[A-Za-z0-9_\-.\/:]+)?)*)$/', trim($line), $m)) {
            return null;
        }
        if (! in_array($m[1], $this->allowed, true)) {
            return null;
        }
        $args = [];
        foreach (preg_split('/\s+/', trim($m[2]), -1, PREG_SPLIT_NO_EMPTY) as $token) {
            [$key, $value] = array_pad(explode('=', $token, 2), 2, true);
            if (is_string($value) && str_contains($value, '..')) {
                return null;                // no path traversal in option values
            }
            $args[$key] = $value;
        }

        return [$m[1], $args];
    }

    /**
     * Run every pending command once and remove it from the file.
     *
     * @return list<array{line:string, status:string, output:string}> status: ok | failed | rejected
     */
    public function process(Kernel $kernel): array
    {
        if (! is_file($this->file)) {
            return [];
        }

        $keep = $results = [];
        foreach (file($this->file, FILE_IGNORE_NEW_LINES) ?: [] as $raw) {
            $line = trim($raw);
            if ($line === '' || str_starts_with($line, '#')) {
                $keep[] = $raw;

                continue;
            }
            $parsed = $this->parse($line);
            if ($parsed === null) {
                $results[] = ['line' => $line, 'status' => 'rejected', 'output' => 'Not an allowed command or invalid arguments.'];

                continue;
            }
            try {
                $code = $kernel->call($parsed[0], $parsed[1]);
                $results[] = ['line' => $line, 'status' => $code === 0 ? 'ok' : 'failed', 'output' => trim($kernel->output())];
            } catch (Throwable $e) {
                $results[] = ['line' => $line, 'status' => 'failed', 'output' => get_class($e).': '.$e->getMessage()];
            }
        }

        // processed lines are gone even when they failed: no retry loop
        file_put_contents($this->file, $keep ? implode(PHP_EOL, $keep).PHP_EOL : '');

        return $results;
    }
}
