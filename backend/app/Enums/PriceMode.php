<?php

namespace App\Enums;

enum PriceMode: string
{
    /** Per-person price by group size (rows in tour_prices). */
    case Tiers = 'tiers';
    /** No public price: customers send an inquiry. */
    case OnRequest = 'on_request';
}
