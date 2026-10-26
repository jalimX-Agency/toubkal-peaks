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
$repo = dirname($backend);
$home = dirname($repo);

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
    foreach ([$home . '/composer.phar', $repo . '/composer.phar', $backend . '/composer.phar'] as $candidate) {
        if (is_file($candidate)) {
            $phar = $candidate;
            break;
        }
    }
    if ($phar === null) {
        logLine('ERROR: composer.phar not found (looked in ' . $home . ', ' . $repo . ', ' . $backend . ').');
        exit(1);
    }

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
    logLine('composer install finished');
}

// ── 2. Artisan (in-process) ────────────────────────────────────────────
require $backend . '/vendor/autoload.php';
$app = require $backend . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$run = function (string $command, array $args = []) use ($kernel): void {
    $code = $kernel->call($command, $args);
    logLine("artisan $command => $code");
    $output = trim($kernel->output());
    if ($output !== '') {
        logLine($output);
    }
};

if ($needsInstall) {
    $run('package:discover');
}

$env = is_file($backend . '/.env') ? file_get_contents($backend . '/.env') : '';
if (! preg_match('/^APP_KEY=base64:\S+/m', $env)) {
    logLine('Skipping migrate/cache: backend/.env missing or APP_KEY not set.');
    exit(0);
}

$run('config:clear');
$run('migrate', ['--force' => true]);
$run('config:cache');
logLine('done');
