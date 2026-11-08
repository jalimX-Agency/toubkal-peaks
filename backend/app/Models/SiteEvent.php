<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** One anonymous event of the website (a visit, or a click on WhatsApp, phone or email). */
class SiteEvent extends Model
{
    public const EVENTS = ['visit', 'whatsapp', 'phone', 'email'];

    public const CHANNELS = ['google_ads', 'google_organic', 'search', 'social', 'referral', 'direct'];

    public const DEVICES = ['mobile', 'tablet', 'desktop'];

    public $timestamps = false;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }
}
