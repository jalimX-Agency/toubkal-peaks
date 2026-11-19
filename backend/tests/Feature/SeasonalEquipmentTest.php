<?php

namespace Tests\Feature;

use App\Models\Tour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\ImportsRealTours;
use Tests\TestCase;

class SeasonalEquipmentTest extends TestCase
{
    use ImportsRealTours, RefreshDatabase;

    private const TOUBKAL = [992, 1001, 1007, 1016, 1017, 1018, 1024];

    public function test_every_toubkal_trip_lists_crampons_ice_axe_and_helmet_with_their_price_in_english(): void
    {
        $this->importRealTours();
        $this->artisan('toubkal:apply-corrections')->assertSuccessful();

        $this->assertSame(self::TOUBKAL, Tour::whereHas('category', fn ($c) => $c->where('key', Tour::TOUBKAL_CATEGORY))->orderBy('legacy_wp_id')->pluck('legacy_wp_id')->map(fn ($i) => (int) $i)->all());

        foreach (self::TOUBKAL as $legacy) {
            $packing = Tour::where('legacy_wp_id', $legacy)->firstOrFail()->translate('en')->packing;
            $seasonal = collect($packing)->where('group', 'Seasonal Equipment');
            $this->assertCount(1, $seasonal, "trip {$legacy}: one Seasonal Equipment group");
            $items = $seasonal->first()['items'];
            $this->assertCount(4, $items);
            $this->assertStringContainsString('Crampons', $items[0]);
            $this->assertStringContainsString('Ice axe', $items[1]);
            $this->assertStringContainsString('Helmet', $items[2]);
            $this->assertStringContainsString('€17', $items[3]);
        }

        // what was in the lists before is kept, and a second run changes nothing
        $first = Tour::where('legacy_wp_id', 992)->first()->translate('en')->packing;
        $this->assertSame('Travel Documents', $first[0]['group']);
        $this->artisan('toubkal:apply-corrections')->assertSuccessful();
        $this->assertSame($first, Tour::where('legacy_wp_id', 992)->first()->translate('en')->packing);
    }

    public function test_french_spanish_and_german_get_the_same_four_lines_with_the_price(): void
    {
        $this->importRealTours();
        $this->artisan('toubkal:import-translations')->assertSuccessful();

        $names = ['fr' => ['Équipement saisonnier', 'Piolet', 'Casque'], 'es' => ['Equipo de temporada', 'Piolet', 'Casco'], 'de' => ['Saisonale Ausrüstung', 'Eispickel', 'Helm']];
        foreach ($names as $locale => [$group, $axe, $helmet]) {
            $this->artisan('toubkal:apply-corrections', ['--locale' => $locale])->assertSuccessful();
            foreach (self::TOUBKAL as $legacy) {
                $packing = Tour::where('legacy_wp_id', $legacy)->firstOrFail()->translate($locale)->packing;
                $seasonal = collect($packing)->where('group', $group);
                $this->assertCount(1, $seasonal, "{$locale} trip {$legacy}");
                $items = $seasonal->first()['items'];
                $this->assertCount(4, $items);
                $this->assertStringContainsString($axe, $items[1]);
                $this->assertStringContainsString($helmet, $items[2]);
                $this->assertStringContainsString('17 €', $items[3]);
            }
        }
    }
}
