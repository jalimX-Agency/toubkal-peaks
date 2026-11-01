<?php

namespace App\Support;

use App\Models\BlogPost;
use Illuminate\Validation\Rule;

/** Validation rules and clean-up shared by the admin and the publishing API, for {en, fr, es, de} texts. */
final class BlogPostInput
{
    public const TRANSLATED = ['title', 'excerpt', 'content', 'image_alt'];

    public static function rules(?BlogPost $post = null, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return [
            'slug' => [$required, 'string', 'max:120', 'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/', Rule::unique('blog_posts', 'slug')->ignore($post?->id)],
            'title' => [$required, 'array'],
            'title.en' => [$required, 'string', 'max:160'],
            'title.*' => ['nullable', 'string', 'max:160'],
            'excerpt' => ['sometimes', 'nullable', 'array'],
            'excerpt.*' => ['nullable', 'string', 'max:400'],
            'content' => [$required, 'array'],
            'content.en' => [$required, 'string', 'max:200000'],
            'content.*' => ['nullable', 'string', 'max:200000'],
            // https only: a plain http image is blocked by browsers as mixed content
            'image_url' => ['sometimes', 'nullable', 'url:https', 'max:500'],
            'image_alt' => ['sometimes', 'nullable', 'array'],
            'image_alt.*' => ['nullable', 'string', 'max:200'],
            'category' => ['sometimes', 'nullable', Rule::in(BlogPost::CATEGORIES)],
            'author' => ['sometimes', 'nullable', 'string', 'max:80'],
            'is_featured' => ['sometimes', 'boolean'],
            'published_at' => ['sometimes', 'nullable', 'date'],
        ];
    }

    public const NAMES = ['title.en' => 'title (English)', 'content.en' => 'text (English)', 'image_url' => 'image'];

    /** Only the site's languages are kept and the HTML is filtered to the blog vocabulary. */
    public static function clean(array $data): array
    {
        foreach (self::TRANSLATED as $field) {
            if (array_key_exists($field, $data) && is_array($data[$field])) {
                $data[$field] = array_map(fn ($v) => trim((string) $v), array_intersect_key($data[$field], array_flip(config('locales.supported'))));
            }
        }
        if (isset($data['content'])) {
            $data['content'] = array_map(fn (string $html) => BlogHtml::clean($html), $data['content']);
        }

        return $data;
    }
}
