<?php

namespace Tests\Feature;

use App\Enums\BookingStatus;
use App\Mail\AdminAccountCreated;
use App\Mail\BookingConfirmed;
use App\Mail\BookingReceived;
use App\Mail\NewBookingNotification;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmailsTest extends TestCase
{
    use RefreshDatabase;

    private function booking(array $overrides = []): Booking
    {
        return Booking::create($overrides + [
            'locale' => 'fr', 'first_name' => 'Ana', 'last_name' => 'Silva', 'email' => 'ana@example.com', 'phone' => '+351 912 345 678',
            'country' => 'Portugal', 'tour_title' => 'Ascension du Toubkal', 'start_date' => '2027-05-10', 'adults' => 2, 'children' => 1,
            'price_per_person' => 659, 'total_price' => 1977, 'currency' => 'EUR', 'special_requests' => "Accommodation: superior\nVegetarian", 'status' => 'pending',
        ]);
    }

    public function test_the_customer_receipt_is_branded_and_written_in_the_booking_language(): void
    {
        $mail = new BookingReceived($this->booking());

        $mail->assertHasSubject("Nous avons bien reçu votre demande {$mail->booking->reference} · Toubkal Peaks");
        $mail->assertSeeInHtml('logo-horizontal-on-dark.png', false);
        $mail->assertSeeInHtml('Merci, Ana');
        $mail->assertSeeInHtml('2 adultes, 1 enfant');
        $mail->assertSeeInHtml('10 mai 2027');
        // the deposit is explained, but its amount and link only come with the team's confirmation
        $mail->assertSeeInHtml('acompte par PayPal');
        $mail->assertDontSeeInHtml('paypal.me', false);
    }

    public function test_the_availability_email_asks_for_this_customers_deposit(): void
    {
        $mail = new BookingConfirmed($this->booking(['locale' => 'en', 'deposit_amount' => 120]));

        $mail->assertHasSubject("Your trip is available: {$mail->booking->reference} · Toubkal Peaks");
        $mail->assertSeeInOrderInHtml(['Good news, Ana', 'Pay the €120 deposit with PayPal', $mail->booking->reference]);
        $mail->assertSeeInHtml('href="https://paypal.me/OmarAitlmouden/120EUR"', false);

        $other = new BookingConfirmed($this->booking(['locale' => 'de', 'deposit_amount' => 75.5]));
        $other->assertSeeInHtml('https://paypal.me/OmarAitlmouden/75.5EUR', false);
        $other->assertSeeInHtml('Anzahlung von 75,50');
    }

    public function test_without_a_deposit_the_availability_email_only_confirms(): void
    {
        $mail = new BookingConfirmed($this->booking(['locale' => 'en', 'deposit_amount' => 0]));

        $mail->assertSeeInHtml('We will be in touch shortly with the next steps.');
        $mail->assertDontSeeInHtml('paypal.me', false);
    }

    public function test_team_and_admin_emails_render_with_the_new_design(): void
    {
        config(['services.frontend.url' => 'https://site.test']);
        $booking = $this->booking();
        $team = new NewBookingNotification($booking);
        $team->assertSeeInHtml('https://site.test/admin/bookings/'.$booking->reference, false);
        $team->assertSeeInHtml('https://wa.me/351912345678', false);
        $team->assertSeeInHtml('Vegetarian');

        $user = User::factory()->create(['name' => 'Said']);
        $admin = new AdminAccountCreated($user, 'temp-Pass-1234');
        $admin->assertSeeInHtml('temp-Pass-1234');
        $admin->assertSeeInHtml('https://site.test/admin/login', false);
    }

    public function test_confirming_a_request_in_the_admin_emails_the_deposit_link(): void
    {
        Mail::fake();
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $booking = $this->booking();

        // the deposit is required when confirming
        $this->postJson("/api/v1/admin/bookings/{$booking->reference}/status", ['status' => 'confirmed'])
            ->assertUnprocessable()->assertJsonValidationErrors('deposit_amount');

        $this->postJson("/api/v1/admin/bookings/{$booking->reference}/status", ['status' => 'confirmed', 'deposit_amount' => 150])
            ->assertOk()->assertJsonPath('customer_emailed', true)->assertJsonPath('data.deposit_amount', 150);

        Mail::assertSent(BookingConfirmed::class, fn ($m) => $m->hasTo('ana@example.com') && str_contains($m->render(), 'paypal.me/OmarAitlmouden/150EUR'));
        $this->assertSame(BookingStatus::Confirmed, $booking->fresh()->status);
    }

    public function test_cancelling_sends_no_deposit_email(): void
    {
        Mail::fake();
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $booking = $this->booking();

        $this->postJson("/api/v1/admin/bookings/{$booking->reference}/status", ['status' => 'cancelled'])->assertOk()->assertJsonPath('customer_emailed', null);
        Mail::assertNotSent(BookingConfirmed::class);
    }
}
