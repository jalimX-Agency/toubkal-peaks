<?php

namespace App\Support;

use NumberFormatter;

/** Prices written the way a reader of that language expects ("€1,318" / "1 318 €"). */
class Money
{
    public static function format(float|int|string|null $amount, string $currency = 'EUR', string $locale = 'en'): string
    {
        $amount = (float) $amount;
        if (class_exists(NumberFormatter::class)) {
            $fmt = new NumberFormatter($locale, NumberFormatter::CURRENCY);
            $fmt->setAttribute(NumberFormatter::FRACTION_DIGITS, fmod($amount, 1.0) == 0.0 ? 0 : 2);
            $out = $fmt->formatCurrency($amount, $currency);
            if ($out !== false) {
                return $out;
            }
        }
        $number = number_format($amount, fmod($amount, 1.0) == 0.0 ? 0 : 2, $locale === 'en' ? '.' : ',', $locale === 'en' ? ',' : ' ');

        return $currency === 'EUR' ? ($locale === 'en' ? "€{$number}" : "{$number} €") : "{$number} {$currency}";
    }
}
