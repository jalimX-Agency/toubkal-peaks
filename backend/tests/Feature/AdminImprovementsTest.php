<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Setting;
use App\Models\User;
use App\Support\FrontendCache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\ImportsRealTours;
use Tests\TestCase;

class AdminImprovementsTest extends TestCase
{
    use ImportsRealTours, RefreshDatabase;

    public function test_copy_protection_is_on_by_default_and_switched_from_the_admin(): void
    {
        $this->getJson('/api/v1/settings')->assertOk()->assertJsonPath('data.copy_protection', true);
        $this->putJson('/api/v1/admin/settings', ['copy_protection' => false])->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        config(['services.frontend.url' => 'https://site.test', 'services.frontend.revalidate_secret' => 'shh']);
        Http::fake(['site.test/*' => Http::response(['revalidated' => true])]);

        $this->putJson('/api/v1/admin/settings', ['copy_protection' => false])->assertOk()->assertJsonPath('data.copy_protection', false);
        $this->putJson('/api/v1/admin/settings', ['copy_protection' => 'maybe'])->assertUnprocessable();
        $this->getJson('/api/v1/settings')->assertJsonPath('data.copy_protection', false);

        // the website is told to refresh its "settings" cache
        app(FrontendCache::class)->flush();
        Http::assertSent(fn (Request $r) => $r['tag'] === 'settings');
        $this->assertFalse(Setting::current()['copy_protection']);
    }

    public function test_a_booking_can_be_deleted_from_the_admin(): void
    {
        $user = User::factory()->create(['role' => 'staff', 'name' => 'Omar']);
        Sanctum::actingAs($user);
        $booking = Booking::create(['locale' => 'en', 'first_name' => 'Spam', 'last_name' => 'Bot', 'email' => 'x@example.com', 'adults' => 1, 'children' => 0, 'currency' => 'EUR', 'status' => 'pending']);

        $this->deleteJson("/api/v1/admin/bookings/{$booking->reference}")->assertOk();

        $this->getJson("/api/v1/admin/bookings/{$booking->reference}")->assertNotFound();
        $this->assertSame(0, $this->getJson('/api/v1/admin/bookings')->json('meta.total'));
        $this->assertSoftDeleted($booking);
        $this->assertStringContainsString('Deleted by Omar', Booking::withTrashed()->find($booking->id)->admin_notes);
    }

    public function test_the_trip_list_gives_what_the_filters_need(): void
    {
        $this->importRealTours();
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));

        $row = $this->getJson('/api/v1/admin/tours')->assertOk()->json('data.0');
        foreach (['photos', 'difficulty', 'sort_order', 'duration_days', 'price_mode', 'is_featured'] as $key) {
            $this->assertArrayHasKey($key, $row);
        }
    }
}
