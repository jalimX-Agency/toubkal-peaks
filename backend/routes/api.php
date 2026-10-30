<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\RedirectController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\TeamController;
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
        Route::get('/team', [TeamController::class, 'index']);
        Route::get('/redirects', [RedirectController::class, 'index']);
    });

    // Reservation requests from the website (rate limited, never cached).
    Route::post('/bookings', [BookingController::class, 'store'])->middleware('throttle:bookings');

    Route::middleware('auth:sanctum')->get('/me', fn (Request $request) => $request->user());

    // Admin API, called only by the website's server with the team member's token (never cached).
    Route::prefix('admin')->middleware('cache.headers:no_store;private')->group(function () {
        Route::post('/auth/login', [Admin\AuthController::class, 'login'])->middleware('throttle:20,1');

        Route::middleware(['auth:sanctum', 'admin.access'])->group(function () {
            Route::get('/auth/me', [Admin\AuthController::class, 'me']);
            Route::post('/auth/logout', [Admin\AuthController::class, 'logout']);
            Route::put('/auth/password', [Admin\AuthController::class, 'password']);

            Route::get('/dashboard', Admin\DashboardController::class);

            Route::get('/bookings', [Admin\BookingController::class, 'index']);
            Route::get('/bookings/{reference}', [Admin\BookingController::class, 'show']);
            Route::patch('/bookings/{reference}', [Admin\BookingController::class, 'update']);
            Route::post('/bookings/{reference}/status', [Admin\BookingController::class, 'status']);

            Route::get('/tours', [Admin\TourController::class, 'index']);
            Route::get('/tours/{tour}', [Admin\TourController::class, 'show']);
            Route::patch('/tours/{tour}', [Admin\TourController::class, 'update']);
            Route::put('/tours/{tour}/translations/{locale}', [Admin\TourController::class, 'translation']);
            Route::put('/tours/{tour}/prices', [Admin\TourController::class, 'prices']);

            Route::get('/reviews', [Admin\ReviewController::class, 'index']);
            Route::post('/reviews', [Admin\ReviewController::class, 'store']);
            Route::patch('/reviews/{review}', [Admin\ReviewController::class, 'update']);
            Route::delete('/reviews/{review}', [Admin\ReviewController::class, 'destroy']);

            Route::get('/team-members', [Admin\TeamMemberController::class, 'index']);
            Route::post('/team-members', [Admin\TeamMemberController::class, 'store']);
            Route::put('/team-members/order', [Admin\TeamMemberController::class, 'reorder']);
            Route::patch('/team-members/{member}', [Admin\TeamMemberController::class, 'update']);
            Route::delete('/team-members/{member}', [Admin\TeamMemberController::class, 'destroy']);
            Route::post('/team-members/{member}/photo', [Admin\TeamMemberController::class, 'photo']);

            Route::middleware('admin.access:admin')->group(function () {
                Route::get('/users', [Admin\UserController::class, 'index']);
                Route::post('/users', [Admin\UserController::class, 'store']);
                Route::patch('/users/{user}', [Admin\UserController::class, 'update']);
            });
        });
    });
});
