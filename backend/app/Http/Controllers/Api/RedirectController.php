<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Redirect;
use Illuminate\Support\Facades\Cache;

class RedirectController extends Controller
{
    /** All active redirects, consumed by the Next.js site (redirects() in next.config / middleware). */
    public function index()
    {
        $redirects = Cache::remember('api.redirects.v1', 300, fn () => Redirect::where('is_active', true)
            ->orderBy('id')->get(['from_path', 'to_path', 'status_code'])
            ->map(fn ($r) => ['from' => $r->from_path, 'to' => $r->to_path, 'status' => $r->status_code])
            ->all());

        return response()->json(['data' => $redirects]);
    }
}
