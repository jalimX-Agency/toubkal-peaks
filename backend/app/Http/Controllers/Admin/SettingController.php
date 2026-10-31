<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Site options switched by the team; saving one refreshes the website (cache tag "settings"). */
class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Setting::current()]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate(['copy_protection' => ['sometimes', 'boolean']]);
        foreach ($data as $key => $value) {
            Setting::put($key, $value);
        }

        return response()->json(['data' => Setting::current()]);
    }
}
