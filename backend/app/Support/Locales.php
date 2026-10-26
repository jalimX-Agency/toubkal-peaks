<?php

namespace App\Support;

use Illuminate\Http\Request;

final class Locales
{
    /** Requested locale if supported, otherwise the default one (English). */
    public static function resolve(?string $locale): string
    {
        return in_array($locale, config('locales.supported'), true) ? $locale : config('locales.default');
    }

    public static function fromRequest(Request $request): string
    {
        return self::resolve($request->query('locale'));
    }
}
