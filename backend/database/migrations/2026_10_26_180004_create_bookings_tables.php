<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 20)->unique();
            $table->foreignId('tour_id')->nullable()->constrained('tours')->nullOnDelete();
            $table->string('tour_title', 255)->nullable();      // snapshot, survives tour edits/deletes
            $table->char('locale', 2)->default('en');
            $table->string('status', 20)->default('pending')->index();

            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email', 190)->index();
            $table->string('phone', 40)->nullable();
            $table->string('country', 80)->nullable();

            $table->date('start_date')->nullable()->index();
            $table->date('end_date')->nullable();
            $table->unsignedTinyInteger('adults')->default(1);
            $table->unsignedTinyInteger('children')->default(0);

            $table->decimal('price_per_person', 10, 2)->nullable();
            $table->decimal('total_price', 10, 2)->nullable();
            $table->decimal('deposit_amount', 10, 2)->nullable();
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->char('currency', 3)->default('EUR');

            $table->text('special_requests')->nullable();
            $table->text('admin_notes')->nullable();
            $table->string('source', 30)->default('website');   // website | admin | whatsapp | email | phone

            $table->timestamp('consent_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('booking_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->string('from_status', 20)->nullable();
            $table->string('to_status', 20);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('note', 500)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_status_logs');
        Schema::dropIfExists('bookings');
    }
};
