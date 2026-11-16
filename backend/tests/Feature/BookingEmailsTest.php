<?php

namespace Tests\Feature;

use App\Mail\NewBookingNotification;
use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Mail\PendingMail;
use Illuminate\Support\Facades\Mail;
use Mockery;
use Tests\TestCase;

class BookingEmailsTest extends TestCase
{
    use RefreshDatabase;

    private function request(): array
    {
        return ['first_name' => 'Ana', 'last_name' => 'Lopez', 'email' => 'ana@example.com', 'adults' => 2, 'consent' => true, 'locale' => 'en'];
    }

    public function test_the_team_is_alerted_even_when_the_customers_address_is_refused_and_the_failure_is_written_in_the_history(): void
    {
        config(['mail.booking_notify' => 'team@toubkal-peaks.com']);

        $team = Mockery::mock(PendingMail::class);
        $team->shouldReceive('send')->once()->withArgs(fn ($mail) => $mail instanceof NewBookingNotification);
        $customer = Mockery::mock(PendingMail::class);
        $customer->shouldReceive('send')->once()->andThrow(new \RuntimeException('550 Mailbox unavailable'));
        Mail::shouldReceive('to')->with(['team@toubkal-peaks.com'])->once()->andReturn($team);
        Mail::shouldReceive('to')->with('ana@example.com')->once()->andReturn($customer);

        $this->postJson('/api/v1/bookings', $this->request())->assertCreated();

        $notes = Booking::first()->statusLogs->pluck('note')->all();
        $this->assertContains('The confirmation email to the customer could not be sent: 550 Mailbox unavailable', $notes);
        $this->assertSame(2, count($notes));
    }

    public function test_when_the_team_alert_fails_the_booking_is_kept_and_the_reason_is_visible(): void
    {
        config(['mail.booking_notify' => 'team@toubkal-peaks.com']);

        $team = Mockery::mock(PendingMail::class);
        $team->shouldReceive('send')->once()->andThrow(new \RuntimeException('Connection refused'));
        $customer = Mockery::mock(PendingMail::class);
        $customer->shouldReceive('send')->once();
        Mail::shouldReceive('to')->with(['team@toubkal-peaks.com'])->once()->andReturn($team);
        Mail::shouldReceive('to')->with('ana@example.com')->once()->andReturn($customer);

        $this->postJson('/api/v1/bookings', $this->request())->assertCreated();

        $this->assertContains('The alert email to the team could not be sent: Connection refused', Booking::first()->statusLogs->pluck('note')->all());
    }

    public function test_the_mail_test_command_tells_what_is_wrong_and_sends_a_message(): void
    {
        Mail::fake();
        config(['mail.default' => 'log', 'mail.booking_notify' => 'a@toubkal-peaks.com, b@toubkal-peaks.com', 'mail.from.address' => 'hello@example.com']);

        $this->artisan('toubkal:mail-test')
            ->expectsOutputToContain('Team recipients: a@toubkal-peaks.com, b@toubkal-peaks.com')
            ->expectsOutputToContain('NEVER sent')
            ->expectsOutputToContain('still the example one')
            ->assertSuccessful();
    }
}
