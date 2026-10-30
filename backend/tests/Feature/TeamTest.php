<?php

namespace Tests\Feature;

use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TeamTest extends TestCase
{
    use RefreshDatabase;

    private function signIn(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
    }

    public function test_import_fills_the_team_once_and_the_public_api_lists_it_in_order(): void
    {
        $this->artisan('toubkal:import-team', ['--disk' => 'public'])->assertSuccessful();
        TeamMember::first()->update(['name' => 'Edited in the admin']);
        $this->artisan('toubkal:import-team', ['--disk' => 'public'])->assertSuccessful(); // already set up: kept

        $res = $this->getJson('/api/v1/team?locale=fr')->assertOk();
        $this->assertCount(6, $res->json('data'));
        $this->assertSame('Edited in the admin', $res->json('data.0.name'));
        $this->assertStringStartsWith('Fort de plus de 25 ans', $res->json('data.0.bio.0'));
        $this->assertStringEndsWith('site/team/omar-jellah.jpg', $res->json('data.0.photo.url'));
    }

    public function test_a_missing_translation_falls_back_to_english_and_hidden_members_are_not_shown(): void
    {
        TeamMember::create(['name' => 'Aziz', 'role' => ['en' => 'Cook'], 'bio' => ['en' => ['Cooks for our treks.'], 'de' => []]]);
        TeamMember::create(['name' => 'Hidden', 'role' => ['en' => 'x'], 'bio' => ['en' => ['x']], 'is_active' => false]);

        $res = $this->getJson('/api/v1/team?locale=de')->assertOk();
        $this->assertSame(['Aziz'], array_column($res->json('data'), 'name'));
        $this->assertSame('Cook', $res->json('data.0.role'));
        $this->assertSame(['Cooks for our treks.'], $res->json('data.0.bio'));
    }

    public function test_the_admin_creates_edits_orders_uploads_a_photo_and_deletes(): void
    {
        Storage::fake('public');
        config(['filesystems.media_disk' => 'public']);
        $this->signIn();

        $a = $this->postJson('/api/v1/admin/team-members', [
            'name' => 'Aziz', 'role' => ['en' => 'Cook', 'fr' => 'Cuisinier', 'it' => 'ignored'], 'bio' => ['en' => ['Cooks.'], 'fr' => ['Cuisine.']],
        ])->assertCreated()->json('data.id');
        $b = $this->postJson('/api/v1/admin/team-members', ['name' => 'Said', 'role' => ['en' => 'Muleteer'], 'bio' => ['en' => ['Mules.']]])->json('data.id');
        $this->assertSame(['en' => 'Cook', 'fr' => 'Cuisinier'], TeamMember::find($a)->role);

        $this->postJson('/api/v1/admin/team-members', ['name' => 'No role'])->assertUnprocessable()->assertJsonValidationErrors(['role.en', 'bio.en']);

        $this->patchJson("/api/v1/admin/team-members/{$a}", ['is_active' => false])->assertOk()->assertJsonPath('data.is_active', false);
        $this->putJson('/api/v1/admin/team-members/order', ['ids' => [$b, $a]])->assertOk()->assertJsonPath('data.0.id', $b);

        $this->post("/api/v1/admin/team-members/{$b}/photo", ['photo' => UploadedFile::fake()->image('said.jpg', 800, 1000)], ['Accept' => 'application/json'])
            ->assertOk()->assertJsonPath('data.photo.width', 800);
        $path = TeamMember::find($b)->photo->path;
        $this->assertStringStartsWith('site/team/said-', $path);
        Storage::disk('public')->assertExists($path);

        $this->post("/api/v1/admin/team-members/{$b}/photo", ['photo' => UploadedFile::fake()->create('cv.pdf', 10, 'application/pdf')], ['Accept' => 'application/json'])
            ->assertUnprocessable();

        $this->deleteJson("/api/v1/admin/team-members/{$a}")->assertOk();
        $this->assertSame(['Said'], TeamMember::pluck('name')->all());
    }

    public function test_the_team_admin_needs_a_signed_in_member(): void
    {
        $this->getJson('/api/v1/admin/team-members')->assertUnauthorized();
    }
}
