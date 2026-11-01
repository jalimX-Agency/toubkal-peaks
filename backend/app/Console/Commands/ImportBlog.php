<?php

namespace App\Console\Commands;

use App\Models\BlogPost;
use App\Support\BlogHtml;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class ImportBlog extends Command
{
    protected $signature = 'toubkal:import-blog
        {--file= : One data file (default: every database/data/blog/*.json)}
        {--draft : Save the articles as drafts instead of publishing them}';

    protected $description = 'Add the articles of database/data/blog (four languages each); an article whose address already exists is left as it is, so edits made in the admin are kept';

    public function handle(): int
    {
        $files = $this->option('file') ? [$this->option('file')] : glob(database_path('data/blog/*.json'));
        $created = $skipped = 0;
        foreach ($files as $file) {
            $posts = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR)['posts'];
            foreach ($posts as $post) {
                if (BlogPost::where('slug', $post['slug'])->exists()) {
                    $this->line("kept (already there): {$post['slug']}");
                    $skipped++;

                    continue;
                }
                $check = Validator::make($post, [
                    'slug' => ['required', 'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/', 'max:120'],
                    'title.en' => ['required', 'string', 'max:160'],
                    'content.en' => ['required', 'string'],
                    'image_url' => ['nullable', 'url:https'],
                    'category' => ['nullable', 'in:'.implode(',', BlogPost::CATEGORIES)],
                ]);
                if ($check->fails()) {
                    $this->error("{$post['slug']}: ".$check->errors()->first());

                    return self::FAILURE;
                }
                BlogPost::create([
                    'slug' => $post['slug'],
                    'title' => $post['title'],
                    'excerpt' => $post['excerpt'] ?? [],
                    'content' => array_map(fn (string $html) => BlogHtml::clean($html), $post['content']),
                    'image_url' => $post['image_url'] ?? null,
                    'image_alt' => $post['image_alt'] ?? [],
                    'category' => $post['category'] ?? null,
                    'is_featured' => (bool) ($post['is_featured'] ?? false),
                    'published_at' => $this->option('draft') ? null : ($post['published_at'] ?? now()),
                ]);
                $this->info("created: {$post['slug']}");
                $created++;
            }
        }
        $this->info("{$created} created, {$skipped} kept.");

        return self::SUCCESS;
    }
}
