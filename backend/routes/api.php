<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['ok' => true]));

Route::prefix('v1')->group(function () {
    Route::get('/health', fn () => response()->json(['status' => 'ok', 'time' => now()->toIso8601String()]));

    Route::middleware('auth:sanctum')->get('/me', fn (Request $request) => $request->user());
});
