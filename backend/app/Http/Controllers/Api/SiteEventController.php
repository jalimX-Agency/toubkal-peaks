<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

/** Anonymous counts of visits and contact clicks (see the site_events migration). Always answers "no content". */
class SiteEventController extends Controller
{
    public function store(Request $request): Response
    {
        $data = $request->validate([
            'event' => ['required', Rule::in(SiteEvent::EVENTS)],
            'page' => ['required', 'string', 'max:255', 'regex:#^/[A-Za-z0-9/_\-.%]*$#'],
            'tour_slug' => ['nullable', 'string', 'max:190', 'regex:/^[a-z0-9-]+$/'],
            'locale' => ['nullable', Rule::in(config('locales.supported'))],
            'channel' => ['nullable', Rule::in(SiteEvent::CHANNELS)],
            'device' => ['nullable', Rule::in(SiteEvent::DEVICES)],
            'country' => ['nullable', 'string', 'size:2', 'alpha'],
        ]);

        // the admin is not counted
        if (! str_starts_with($data['page'], '/admin')) {
            SiteEvent::create([...$data, 'country' => isset($data['country']) ? strtoupper($data['country']) : null]);
        }

        return response()->noContent();
    }
}
