<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use App\Support\Locales;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    /** The people on the About page, in their set order. Query: locale. */
    public function index(Request $request): JsonResponse
    {
        $locale = Locales::fromRequest($request);

        return response()->json([
            'data' => TeamMember::shown()->with('photo')->get()->map(fn (TeamMember $m) => $m->toPublicArray($locale))->values(),
        ]);
    }
}
