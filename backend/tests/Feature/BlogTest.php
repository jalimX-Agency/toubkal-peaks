<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\User;
use App\Support\BlogHtml;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BlogTest extends TestCase
{
    use RefreshDatabase;

    private const KEY = 'test-key-that-is-long-enough-0123456789abcdef';

    private function article(array $attributes = []): BlogPost
    {
        return BlogPost::create($attributes + [
            'slug' => 'best-time-to-climb-toubkal',
            'title' => ['en' => 'Best time to climb Toubkal', 'fr' => 'Quand gravir le Toubkal'],
            'excerpt' => ['en' => 'Month by month.'],
            'content' => ['en' => '<p>English text.</p>', 'fr' => '<p>Texte français.</p>'],
            'published_at' => now()->subDay(),
        ]);
    }

    private function body(array $overrides = []): array
    {
        return $overrides + [
            'slug' => 'toubkal-in-winter',
            'title' => 'Toubkal in winter',
            'titleFr' => 'Le Toubkal en hiver',
            'excerpt' => 'Snow, crampons and short days.',
            'content' => '<div class="gx-answer"><p class="gx-label">In short</p><p><strong>Yes, with crampons.</strong></p></div><script>alert(1)</script>',
            'contentFr' => '<p>Oui, avec des crampons.</p>',
            'image' => 'https://cdn.toubkal-peaks.com/site/blog/winter.jpg',
            'category' => 'toubkal',
        ];
    }

    public function test_the_public_api_lists_published_articles_in_the_visitor_language_with_english_fallback(): void
    {
        $this->article();
        $this->article(['slug' => 'draft', 'published_at' => null]);
        $this->article(['slug' => 'later', 'published_at' => now()->addWeek()]);

        $fr = $this->getJson('/api/v1/blog-posts?locale=fr')->assertOk();
        $this->assertSame(['best-time-to-climb-toubkal'], array_column($fr->json('data'), 'slug'));
        $this->assertSame('Quand gravir le Toubkal', $fr->json('data.0.title'));
        $this->assertSame('fr', $fr->json('data.0.locale'));
        $this->assertSame('Month by month.', $fr->json('data.0.excerpt')); // not translated: English

        $de = $this->getJson('/api/v1/blog-posts/best-time-to-climb-toubkal?locale=de')->assertOk();
        $this->assertSame('en', $de->json('data.locale'));
        $this->assertSame('<p>English text.</p>', $de->json('data.content'));
        $this->assertSame(['en', 'fr'], $de->json('data.locales'));

        $this->getJson('/api/v1/blog-posts/draft')->assertNotFound();
    }

    public function test_the_html_keeps_the_blog_vocabulary_only(): void
    {
        $html = BlogHtml::clean('<h1 onclick="x()">Title</h1><p class="gx-tip other" style="color:red">Hi <a href="javascript:alert(1)">bad</a> '
            .'<a href="https://example.com/page">out</a> <a href="/fr/trips">in</a></p><img src="x.jpg"><script>alert(1)</script><!-- note -->');

        $this->assertSame('Title<p class="gx-tip">Hi <a>bad</a> <a href="https://example.com/page" rel="noopener noreferrer" target="_blank">out</a> <a href="/fr/trips">in</a></p>', $html);
    }

    public function test_the_admin_creates_edits_and_deletes_an_article(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));

        $id = $this->postJson('/api/v1/admin/blog-posts', [
            'slug' => 'imlil-guide', 'title' => ['en' => 'Imlil guide', 'it' => 'ignored'],
            'content' => ['en' => '<p>Text</p><iframe src="x"></iframe>'], 'category' => 'atlas',
        ])->assertCreated()->assertJsonPath('data.published_at', null)->json('data.id');
        $this->assertSame(['en' => '<p>Text</p>'], BlogPost::find($id)->content);
        $this->assertSame(['en' => 'Imlil guide'], BlogPost::find($id)->title);

        $this->postJson('/api/v1/admin/blog-posts', ['slug' => 'imlil-guide', 'title' => ['en' => 'x'], 'content' => ['en' => 'x']])
            ->assertUnprocessable()->assertJsonValidationErrors(['slug']);
        $this->postJson('/api/v1/admin/blog-posts', ['slug' => 'Bad Slug'])->assertUnprocessable()->assertJsonValidationErrors(['slug', 'title.en', 'content.en']);

        $this->patchJson("/api/v1/admin/blog-posts/{$id}", ['published_at' => now()->toIso8601String(), 'title' => ['en' => 'Imlil guide', 'fr' => 'Guide d’Imlil']])
            ->assertOk()->assertJsonPath('data.title.fr', 'Guide d’Imlil');
        $this->getJson('/api/v1/blog-posts/imlil-guide')->assertOk();

        $this->getJson('/api/v1/admin/blog-posts')->assertOk()->assertJsonPath('data.0.slug', 'imlil-guide');
        $this->deleteJson("/api/v1/admin/blog-posts/{$id}")->assertOk();
        $this->assertDatabaseCount('blog_posts', 0);
    }

    public function test_the_publishing_api_is_off_without_a_key_and_refuses_a_wrong_one(): void
    {
        config(['services.blog.key' => null]);
        $this->postJson('/api/blog-posts', $this->body(), ['Authorization' => 'Bearer '.self::KEY])->assertNotFound();

        config(['services.blog.key' => 'short']);
        $this->postJson('/api/blog-posts', $this->body(), ['Authorization' => 'Bearer short'])->assertNotFound();

        config(['services.blog.key' => self::KEY]);
        $this->postJson('/api/blog-posts', $this->body(), ['Authorization' => 'Bearer wrong'])->assertUnauthorized();
        $this->postJson('/api/blog-posts', $this->body())->assertUnauthorized();
        $this->assertDatabaseCount('blog_posts', 0);
    }

    public function test_the_publishing_api_validates_creates_and_never_overwrites(): void
    {
        config(['services.blog.key' => self::KEY, 'services.frontend.url' => 'https://toubkal-peaks.com']);
        $auth = ['Authorization' => 'Bearer '.self::KEY];

        $this->call('POST', '/api/blog-posts', [], [], [], ['HTTP_AUTHORIZATION' => 'Bearer '.self::KEY, 'CONTENT_TYPE' => 'text/plain'], 'not json')
            ->assertStatus(400)->assertJsonPath('error', 'Body must be JSON');

        $this->postJson('/api/blog-posts', $this->body(['title' => '', 'image' => 'http://example.com/a.jpg', 'category' => 'beach']), $auth)
            ->assertStatus(400)->assertJsonPath('error', 'Invalid blog post')
            ->assertJsonStructure(['issues' => ['title.en', 'image_url', 'category']]);

        $this->postJson('/api/blog-posts', $this->body(), $auth)->assertCreated()
            ->assertJson(['slug' => 'toubkal-in-winter', 'url' => 'https://toubkal-peaks.com/blog/toubkal-in-winter']);
        $post = BlogPost::firstWhere('slug', 'toubkal-in-winter');
        $this->assertStringNotContainsString('<script', $post->content['en']);
        $this->assertStringContainsString('class="gx-answer"', $post->content['en']);
        $this->assertSame('Le Toubkal en hiver', $post->title['fr']);
        $this->assertNotNull($post->published_at);

        $this->postJson('/api/blog-posts', $this->body(['title' => 'Changed']), $auth)->assertStatus(409);
        $this->assertSame('Toubkal in winter', $post->fresh()->title['en']);

        $this->postJson('/api/blog-posts', $this->body(['slug' => 'a-draft', 'published' => false]), $auth)->assertCreated();
        $this->assertNull(BlogPost::firstWhere('slug', 'a-draft')->published_at);
    }

    public function test_the_import_adds_the_first_article_once_and_keeps_admin_edits(): void
    {
        $this->artisan('toubkal:import-blog')->assertSuccessful();
        $post = BlogPost::firstWhere('slug', 'best-time-to-climb-mount-toubkal');
        $this->assertNotNull($post);
        $this->assertSame(['en', 'fr', 'es', 'de'], $post->locales());
        $this->assertStringContainsString('class="gx-months"', $post->content['fr']);
        $this->assertSame(12, substr_count($post->content['de'], '<li class="is-'));
        $this->assertSame('toubkal', $post->category);
        $this->getJson('/api/v1/blog-posts/best-time-to-climb-mount-toubkal?locale=es')->assertOk()->assertJsonPath('data.locale', 'es');

        $post->update(['title' => ['en' => 'Edited in the admin'] + $post->title]);
        $this->artisan('toubkal:import-blog')->assertSuccessful();
        $this->assertSame('Edited in the admin', $post->fresh()->title['en']);
        $this->assertDatabaseCount('blog_posts', 1);
    }

    public function test_the_review_import_validates_dedupes_and_publishes(): void
    {
        $file = tempnam(sys_get_temp_dir(), 'rev');
        $review = ['source' => 'tripadvisor', 'external_id' => 'r1', 'author_name' => 'Anna K', 'rating' => 5, 'body' => 'A long enough review text for the test.', 'language' => 'en', 'reviewed_at' => '2026-10-01'];
        file_put_contents($file, json_encode(['reviews' => [$review, ['source' => 'google', 'author_name' => 'Luc', 'rating' => 4, 'body' => 'Another honest review of the trip.']]]));

        $this->artisan('toubkal:import-reviews', ['--file' => $file])->assertSuccessful();
        $this->artisan('toubkal:import-reviews', ['--file' => $file])->assertSuccessful(); // same file again: nothing added
        $this->assertDatabaseCount('reviews', 2);
        $this->assertSame(2, count($this->getJson('/api/v1/reviews')->json('data')));

        file_put_contents($file, json_encode(['reviews' => [['source' => 'tripadvisor', 'author_name' => 'X', 'rating' => 9, 'body' => 'too short']]]));
        $this->artisan('toubkal:import-reviews', ['--file' => $file])->assertFailed();
        $this->assertDatabaseCount('reviews', 2);
        unlink($file);
    }
}
