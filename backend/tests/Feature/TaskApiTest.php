<?php

namespace Tests\Feature;

use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_returns_ok_with_cors(): void
    {
        $response = $this->getJson('/api/health', [
            'Origin' => 'http://localhost:8081',
        ]);

        $response->assertStatus(200)
            ->assertHeader('Access-Control-Allow-Origin', '*')
            ->assertJson([
                'status' => 'ok',
                'service' => 'MyTasks Laravel API',
            ]);
    }

    public function test_crud_tasks_workflow_across_devices(): void
    {
        // Appareil X crée une tâche
        $createResponse = $this->postJson('/api/tasks', [
            'titre' => 'Tâche depuis Appareil X',
            'description' => 'Vérifier synchronisation vers Appareil Y',
            'priorite' => 'Élevée',
            'statut' => 'À faire',
            'observers' => [
                ['id' => 'obs_1', 'name' => 'Appareil Y', 'addedAt' => '2026-11-26T10:00:00Z'],
            ],
        ]);

        $createResponse->assertStatus(201)
            ->assertJsonFragment([
                'titre' => 'Tâche depuis Appareil X',
                'priorite' => 'Élevée',
                'statut' => 'À faire',
            ]);

        $taskId = $createResponse->json('id');

        // Appareil Y liste les tâches et voit celle de l'Appareil X
        $listResponse = $this->getJson('/api/tasks');
        $listResponse->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $taskId, 'titre' => 'Tâche depuis Appareil X']);

        // Appareil Y met à jour le statut et ajoute un commentaire
        $updateResponse = $this->patchJson("/api/tasks/{$taskId}", [
            'statut' => 'Terminée',
            'comments' => [
                ['id' => 'cmt_1', 'author' => 'Appareil Y', 'text' => 'Bien reçu !', 'createdAt' => '2026-11-26T10:05:00Z'],
            ],
        ]);

        $updateResponse->assertStatus(200)
            ->assertJson([
                'id' => $taskId,
                'statut' => 'Terminée',
            ]);

        // Suppression de la tâche
        $deleteResponse = $this->deleteJson("/api/tasks/{$taskId}");
        $deleteResponse->assertStatus(200)
            ->assertJson(['deleted' => true, 'id' => $taskId]);

        $this->assertDatabaseCount('tasks', 0);
    }

    public function test_validation_returns_json_error_when_titre_missing(): void
    {
        $response = $this->postJson('/api/tasks', [
            'description' => 'Sans titre',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['titre']);
    }

    public function test_reset_demo_seeds_five_tasks(): void
    {
        $response = $this->postJson('/api/tasks/reset-demo');

        $response->assertStatus(200)
            ->assertJsonCount(5);

        $this->assertEquals(5, Task::count());
    }

    public function test_file_upload_and_retrieval(): void
    {
        Storage::fake('public');

        $minimalPng = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
        );
        $file = UploadedFile::fake()->createWithContent('photo_test.png', $minimalPng);

        $uploadResponse = $this->postJson('/api/upload', [
            'file' => $file,
        ]);

        $uploadResponse->assertStatus(201)
            ->assertJsonStructure(['id', 'name', 'type', 'mimeType', 'size', 'uri', 'source'])
            ->assertJson([
                'name' => 'photo_test.png',
                'type' => 'image',
                'source' => 'api',
            ]);

        $uri = $uploadResponse->json('uri');
        $path = parse_url($uri, PHP_URL_PATH);

        $fileResponse = $this->get($path);
        $fileResponse->assertStatus(200);
    }
}
