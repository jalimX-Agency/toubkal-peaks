<?php

use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\RedirectController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\TourController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['ok' => true]));

Route::prefix('v1')->group(function () {
    Route::get('/health', fn () => response()->json(['status' => 'ok', 'time' => now()->toIso8601String()]));

    // Public read API (the Next.js site). Short shared-cache lifetime; Next.js adds its own revalidation.
    Route::middleware('cache.headers:public;max_age=60;stale_while_revalidate=300')->group(function () {
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/tours', [TourController::class, 'index']);
        Route::get('/tours/{slug}', [TourController::class, 'show']);
        Route::get('/reviews', [ReviewController::class, 'index']);
        Route::get('/redirects', [RedirectController::class, 'index']);
    });

    // Reservation requests from the website (rate limited, never cached).
    Route::post('/bookings', [BookingController::class, 'store'])->middleware('throttle:bookings');

    Route::middleware('auth:sanctum')->get('/me', fn (Request $request) => $request->user());
});
