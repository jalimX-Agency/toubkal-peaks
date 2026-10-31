<?php

namespace Tests\Feature;

use App\Enums\BookingStatus;
use App\Mail\AdminAccountCreated;
use App\Models\Booking;
use App\Models\Redirect;
use App\Models\Review;
use App\Models\Tour;
use App\Models\User;
use App\Support\ArtisanQueue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\ImportsRealTours;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    use ImportsRealTours, RefreshDatabase;

    private function booking(array $overrides = []): Booking
    {
        return Booking::create($overrides + [
            'first_name' => 'Ana', 'last_name' => 'Lopez', 'email' => 'ana@example.test', 'adults' => 2, 'children' => 0,
            'start_date' => now()->addDays(10)->toDateString(), 'total_price' => 900, 'currency' => 'EUR', 'locale' => 'es',
        ]);
    }

    public function test_sign_in_returns_a_token_and_wrong_or_disabled_accounts_are_refused(): void
    {
        $user = User::factory()->create(['email' => 'team@example.test']);
        User::factory()->inactive()->create(['email' => 'old@example.test']);

        $this->postJson('/api/v1/admin/auth/login', ['email' => 'team@example.test', 'password' => 'wrong'])->assertStatus(422);
        $this->postJson('/api/v1/admin/auth/login', ['email' => 'old@example.test', 'password' => 'password'])->assertStatus(422);

        $token = $this->postJson('/api/v1/admin/auth/login', ['email' => 'team@example.test', 'password' => 'password'])
            ->assertOk()->assertJsonPath('user.role', 'staff')->json('token');
        $this->assertNotNull($user->fresh()->last_login_at);

        $this->withToken($token)->getJson('/api/v1/admin/auth/me')->assertOk()->assertJsonPath('user.email', 'team@example.test');
        $this->withToken($token)->postJson('/api/v1/admin/auth/logout')->assertOk();
        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_sign_in_is_rate_limited(): void
    {
        User::factory()->create(['email' => 'team@example.test']);
        foreach (range(1, 5) as $_) {
            $this->postJson('/api/v1/admin/auth/login', ['email' => 'team@example.test', 'password' => 'nope']);
        }
        $this->postJson('/api/v1/admin/auth/login', ['email' => 'team@example.test', 'password' => 'password'])
            ->assertStatus(422)->assertJsonPath('errors.email.0', fn ($m) => str_starts_with($m, 'Too many attempts'));
    }

    public function test_the_admin_api_needs_an_active_signed_in_member(): void
    {
        $this->getJson('/api/v1/admin/bookings')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->inactive()->create());
        $this->getJson('/api/v1/admin/bookings')->assertUnauthorized();
    }

    public function test_bookings_list_filters_and_counts(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $this->booking(['first_name' => 'Ana']);
        $this->booking(['first_name' => 'Ben', 'email' => 'ben@example.test'])->transitionTo(BookingStatus::Confirmed);

        $this->getJson('/api/v1/admin/bookings')->assertOk()
            ->assertJsonCount(2, 'data')->assertJsonPath('counts.pending', 1)->assertJsonPath('counts.confirmed', 1);
        $this->getJson('/api/v1/admin/bookings?status=confirmed')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Ben Lopez');
        $this->getJson('/api/v1/admin/bookings?q=ben@')->assertJsonCount(1, 'data');
    }

    public function test_a_booking_can_be_edited_and_moved_through_the_workflow(): void
    {
        $user = User::factory()->create(['name' => 'Hassan']);
        Sanctum::actingAs($user);
        $ref = $this->booking()->reference;

        $this->patchJson("/api/v1/admin/bookings/{$ref}", ['admin_notes' => 'Vegetarian', 'total_price' => 1000, 'paid_amount' => 300])
            ->assertOk()->assertJsonPath('data.admin_notes', 'Vegetarian')->assertJsonPath('data.balance_due', 700);

        $this->postJson("/api/v1/admin/bookings/{$ref}/status", ['status' => 'completed'])->assertStatus(422);
        $this->postJson("/api/v1/admin/bookings/{$ref}/status", ['status' => 'confirmed', 'deposit_amount' => 100, 'note' => 'Guide booked'])
            ->assertOk()->assertJsonPath('data.status', 'confirmed')
            ->assertJsonPath('data.history.1.user', 'Hassan')->assertJsonPath('data.history.1.note', 'Guide booked')
            ->assertJsonPath('data.next_statuses', ['paid', 'completed', 'cancelled']);
    }

    public function test_tours_settings_content_and_prices_can_be_edited(): void
    {
        $this->importRealTours();
        Sanctum::actingAs(User::factory()->create());
        $tour = Tour::with('translations')->first();
        $en = $tour->translate('en');

        $this->getJson('/api/v1/admin/tours')->assertOk()->assertJsonCount(Tour::count(), 'data');
        $this->getJson("/api/v1/admin/tours/{$tour->id}")->assertOk()->assertJsonPath('data.translations.en.slug', $en->slug);

        $this->patchJson("/api/v1/admin/tours/{$tour->id}", ['is_featured' => true, 'duration_days' => 3])
            ->assertOk()->assertJsonPath('data.is_featured', true)->assertJsonPath('data.duration_days', 3);

        $payload = ['title' => 'Nouveau titre', 'slug' => 'nouveau-titre', 'summary' => 'Résumé', 'highlights' => ['A'],
            'itinerary' => [['day' => 1, 'title' => 'Jour 1', 'body' => ['Texte']]]];
        $this->putJson("/api/v1/admin/tours/{$tour->id}/translations/fr", $payload)
            ->assertOk()->assertJsonPath('data.translations.fr.title', 'Nouveau titre')
            ->assertJsonPath('data.translations.fr.translation_status', 'reviewed');

        // a new English slug keeps the old address working
        $this->putJson("/api/v1/admin/tours/{$tour->id}/translations/en", ['title' => $en->title, 'slug' => 'renamed-trip'])
            ->assertOk()->assertJsonPath('data.translations.en.translation_status', 'source');
        $this->assertTrue(Redirect::where('from_path', 'like', "%/{$en->slug}/")->where('to_path', 'like', '%/renamed-trip')->exists());

        $this->putJson("/api/v1/admin/tours/{$tour->id}/prices", ['tiers' => [
            ['min_pax' => 3, 'max_pax' => null, 'price_per_person' => 400], ['min_pax' => 1, 'max_pax' => 2, 'price_per_person' => 550],
        ]])->assertOk()->assertJsonPath('data.prices.0.min_pax', 1)->assertJsonPath('data.prices.1.price_per_person', 400);
        $this->assertNotNull($tour->fresh()->price_reviewed_at);

        $this->putJson("/api/v1/admin/tours/{$tour->id}/translations/fr", ['title' => 'X', 'slug' => 'Bad Slug'])->assertStatus(422);
    }

    public function test_reviews_can_be_added_moderated_and_deleted(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $id = $this->postJson('/api/v1/admin/reviews', ['source' => 'tripadvisor', 'author_name' => 'Emma', 'rating' => 5, 'body' => 'Wonderful trek'])
            ->assertCreated()->assertJsonPath('data.status', 'published')->json('data.id');
        $this->patchJson("/api/v1/admin/reviews/{$id}", ['status' => 'hidden'])->assertOk()->assertJsonPath('data.status', 'hidden');
        $this->getJson('/api/v1/admin/reviews?status=hidden')->assertJsonCount(1, 'data')->assertJsonPath('counts.hidden', 1);
        $this->deleteJson("/api/v1/admin/reviews/{$id}")->assertOk();
        $this->assertSame(0, Review::count());
    }

    public function test_only_administrators_manage_accounts_and_new_members_get_a_temporary_password(): void
    {
        Mail::fake();
        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/v1/admin/users')->assertForbidden();

        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        $this->postJson('/api/v1/admin/users', ['name' => 'Said', 'email' => 'said@example.test', 'role' => 'staff'])
            ->assertCreated()->assertJsonPath('data.must_change_password', true);
        Mail::assertSent(AdminAccountCreated::class, fn ($m) => $m->hasTo('said@example.test') && strlen($m->password) === 14);

        $this->patchJson("/api/v1/admin/users/{$admin->id}", ['is_active' => false])->assertStatus(422);
    }

    public function test_a_temporary_password_must_be_replaced(): void
    {
        $user = User::factory()->create(['must_change_password' => true]);
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/admin/auth/password', ['current_password' => 'password', 'password' => 'short', 'password_confirmation' => 'short'])->assertStatus(422);
        $this->putJson('/api/v1/admin/auth/password', ['current_password' => 'password', 'password' => 'Atlas2026peaks', 'password_confirmation' => 'Atlas2026peaks'])
            ->assertOk()->assertJsonPath('user.must_change_password', false);
    }

    public function test_the_dashboard_summarises_what_needs_attention(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $this->booking();

        $this->getJson('/api/v1/admin/dashboard')->assertOk()
            ->assertJsonPath('stats.pending_bookings', 1)->assertJsonPath('stats.new_this_week', 1)->assertJsonCount(1, 'recent');
    }

    public function test_the_first_admin_is_created_from_the_command_line(): void
    {
        Mail::fake();

        $this->artisan('toubkal:create-admin', ['--email' => 'owner@example.test'])->assertExitCode(0);

        $this->assertTrue(User::where('email', 'owner@example.test')->first()->isAdmin());
        Mail::assertSent(AdminAccountCreated::class);
        $this->assertSame(['toubkal:create-admin', ['--email' => 'owner+1@example.test']], (new ArtisanQueue('x'))->parse('toubkal:create-admin --email=owner+1@example.test'));
    }
}
