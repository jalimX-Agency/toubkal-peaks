<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    /** Site options the website needs (copy protection...). */
    public function index(): JsonResponse
    {
        return response()->json(['data' => Setting::current()]);
    }
}
