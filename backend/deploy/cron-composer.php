<?php

/*
 * Post-deploy task for cPanel hosting without shell access. Run from cron:
 *
 *   /usr/bin/php82 /home/sites/1a/d/da0eb72dbb/toubkal-peaks/backend/deploy/cron-composer.php
 *
 * 1. Installs vendor/ with composer.phar when composer.lock changed (or vendor is missing).
 * 2. Runs migrations and caches config through Artisan, in-process.
 *
 * No shell_exec / exec / proc_open is used. Needs composer.phar uploaded to the
 * home folder (or next to the repo), and a server-side backend/.env.
 */

use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\StreamOutput;

set_time_limit(0);
ini_set('memory_limit', '-1');

$backend = dirname(__DIR__);

$stateDir = $backend . '/storage/framework';
$logFile = $backend . '/storage/logs/deploy.log';
foreach ([$stateDir, dirname($logFile)] as $dir) {
    if (! is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
}

function logLine(string $message): void
{
    global $logFile;
    $line = '[' . date('c') . '] ' . $message . PHP_EOL;
    file_put_contents($logFile, $line, FILE_APPEND);
    echo $line;
}

// Never run two instances at once
$lock = fopen($stateDir . '/deploy.lock', 'c');
if (! $lock || ! flock($lock, LOCK_EX | LOCK_NB)) {
    exit("Another run is in progress.\n");
}

// ── 1. Composer ────────────────────────────────────────────────────────
$hashFile = $stateDir . '/composer-lock.sha1';
$currentHash = is_file($backend . '/composer.lock') ? sha1_file($backend . '/composer.lock') : '';
$savedHash = is_file($hashFile) ? trim(file_get_contents($hashFile)) : '';
$needsInstall = ! is_file($backend . '/vendor/autoload.php') || $currentHash !== $savedHash;

if ($needsInstall) {
    $phar = null;
    // Works whether this folder is the app root (FTP deploy) or backend/ inside a git clone
    $searchDirs = [dirname($backend), dirname($backend, 2), $backend];
    foreach ($searchDirs as $dir) {
        if (is_file($dir . '/composer.phar')) {
            $phar = $dir . '/composer.phar';
            break;
        }
    }
    if ($phar === null) {
        logLine('ERROR: composer.phar not found (looked in ' . implode(', ', $searchDirs) . ').');
        exit(1);
    }
    $home = dirname($phar);

    logLine('composer install started');
    putenv('COMPOSER_HOME=' . $home . '/.composer');
    putenv('COMPOSER_CACHE_DIR=' . $home . '/.composer/cache');
    putenv('COMPOSER_ALLOW_SUPERUSER=1');
    putenv('COMPOSER_NO_INTERACTION=1');
    putenv('HOME=' . $home);
    $_SERVER['HOME'] = $home;
    chdir($backend);

    require 'phar://' . $phar . '/src/bootstrap.php';

    $composer = new Composer\Console\Application();
    $composer->setAutoExit(false);
    $out = new StreamOutput(fopen($logFile, 'a'));
    // --no-scripts: package:discover is run below through Artisan instead of a spawned process
    $code = $composer->run(new ArrayInput([
        'command' => 'install',
        '--no-dev' => true,
        '--optimize-autoloader' => true,
        '--no-interaction' => true,
        '--no-scripts' => true,
        '--working-dir' => $backend,
    ]), $out);

    if ($code !== 0) {
        logLine("ERROR: composer install exited with code $code (see log above).");
        exit(1);
    }
    file_put_contents($hashFile, $currentHash);
    logLine('composer install finished; Artisan steps run on the next cron tick');
    // composer.phar bundles its own symfony/console, which clashes with vendor/'s copy
    // if both load in one process, so the Artisan phase happens on the next run.
    exit(0);
}

// ── 2. Artisan (in-process) ────────────────────────────────────────────
require $backend . '/vendor/autoload.php';
$app = require $backend . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$run = function (string $command, array $args = []) use ($kernel): int {
    $code = $kernel->call($command, $args);
    logLine("artisan $command => $code");
    $output = trim($kernel->output());
    if ($output !== '') {
        logLine($output);
    }

    return $code;
};

if (! is_file($backend . '/bootstrap/cache/packages.php')) {
    $run('package:discover');
}

$env = is_file($backend . '/.env') ? file_get_contents($backend . '/.env') : '';
if (! preg_match('/^APP_KEY=base64:\S+/m', $env)) {
    logLine('Skipping migrate/cache: backend/.env missing or APP_KEY not set.');
    exit(0);
}

// Rebuild the config cache from the current .env at once (config:clear here left the site without a
// cache for the whole run, and requests arriving meanwhile failed on the missing bootstrap/cache/config.php).
$run('config:cache');
$migrated = $run('migrate', ['--force' => true]) === 0;

// One-time commands from storage/app/artisan-queue.txt (allow-listed, see App\Support\ArtisanQueue).
// They run only after a successful migration and are removed from the file whatever the result.
if ($migrated) {
    // deploy/artisan-queue.txt ships with the code (a push triggers it once: the file is only
    // re-uploaded when its content changes); storage/app/artisan-queue.txt is for manual use.
    foreach (['/deploy/artisan-queue.txt', '/storage/app/artisan-queue.txt'] as $queueFile) {
        foreach ((new App\Support\ArtisanQueue($backend . $queueFile))->process($kernel) as $result) {
            logLine(sprintf('queue [%s] %s', $result['status'], $result['line']));
            if ($result['output'] !== '') {
                logLine(mb_substr($result['output'], 0, 4000));
            }
        }
    }
    // Content changed by the queued commands: tell the website (this script never "terminates" Laravel).
    foreach ($app->make(App\Support\FrontendCache::class)->flush() as $tag => $ok) {
        logLine(sprintf('website cache [%s] %s', $ok ? 'refreshed' : 'failed', $tag));
    }
} else {
    logLine('Skipping artisan queue: migrate failed.');
}

$run('config:cache');
logLine('done');
