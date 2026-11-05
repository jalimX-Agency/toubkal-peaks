<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Tour;
use App\Models\TourTranslation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class OrderDayTrips extends Command
{
    /** English addresses of the day trips that come first on the Day trips page, in this order (the owner's list). */
    public const FIRST = [
        'toubkal-national-park-day-trip-hike-picnic',
        'ouirgane-valley-day-trip-guided-hike-berber-lunch',
        'atlas-mountains-imlil-day-trip',
        'atlas-mountains-3-valleys-day-trip-ourika-valley',
    ];

    protected $signature = 'toubkal:order-day-trips';

    protected $description = 'Put the owner\'s four day trips first on the Day trips page; the other trips of the category keep their order after them (the order stays editable in the admin: "Order in lists")';

    public function handle(): int
    {
        $category = Category::where('key', 'day-trips-from-marrakech')->first();
        if (! $category) {
            $this->error('Category day-trips-from-marrakech not found.');

            return self::FAILURE;
        }

        $ids = [];
        foreach (self::FIRST as $slug) {
            $id = TourTranslation::where('locale', 'en')->where('slug', $slug)->value('tour_id');
            if (! $id || ! Tour::whereKey($id)->where('category_id', $category->id)->exists()) {
                $this->error("Trip not found in the category: {$slug}");

                return self::FAILURE;
            }
            $ids[] = $id;
        }

        DB::transaction(function () use ($category, $ids) {
            $base = (int) Tour::where('category_id', $category->id)->min('sort_order');
            // make room: every other trip of the category moves behind the four
            Tour::where('category_id', $category->id)->whereNotIn('id', $ids)->increment('sort_order', count($ids));
            foreach ($ids as $i => $id) {
                Tour::whereKey($id)->update(['sort_order' => $base + $i]);
            }
        });

        $this->info('Day trips ordered: '.count($ids).' trips first.');

        return self::SUCCESS;
    }
}
