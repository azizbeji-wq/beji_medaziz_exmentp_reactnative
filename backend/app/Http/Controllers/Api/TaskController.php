<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Database\Seeders\TaskSeeder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Vérifier l'état de l'API.
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'service' => 'MyTasks Laravel API',
            'tasks_count' => Task::count(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Lister toutes les tâches (plus récentes en premier).
     */
    public function index(): JsonResponse
    {
        $tasks = Task::orderByDesc('id')->get();
        return response()->json($tasks);
    }

    /**
     * Créer une nouvelle tâche.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priorite' => 'nullable|in:Faible,Moyenne,Élevée',
            'statut' => 'nullable|in:À faire,Terminée,terminee',
            'date_creation' => 'nullable|string|max:30',
            'attachments' => 'nullable|array',
            'reminder' => 'nullable|array',
            'location' => 'nullable|array',
            'observers' => 'nullable|array',
            'comments' => 'nullable|array',
        ]);

        if (empty($validated['date_creation'])) {
            $validated['date_creation'] = now()->format('d/m/Y');
        }

        $validated['priorite'] = $validated['priorite'] ?? 'Moyenne';
        $validated['statut'] = $validated['statut'] ?? 'À faire';

        $task = Task::create($validated);

        return response()->json($task, 201);
    }

    /**
     * Afficher une tâche par ID.
     */
    public function show(string $id): JsonResponse
    {
        $task = Task::findOrFail($id);
        return response()->json($task);
    }

    /**
     * Mettre à jour une tâche existante (partielle ou complète).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priorite' => 'sometimes|in:Faible,Moyenne,Élevée',
            'statut' => 'sometimes|in:À faire,Terminée,terminee',
            'date_creation' => 'nullable|string|max:30',
            'attachments' => 'nullable|array',
            'reminder' => 'nullable|array',
            'location' => 'nullable|array',
            'observers' => 'nullable|array',
            'comments' => 'nullable|array',
        ]);

        $task->update($validated);

        return response()->json($task->fresh());
    }

    /**
     * Supprimer une tâche.
     */
    public function destroy(string $id): JsonResponse
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json([
            'deleted' => true,
            'id' => (string) $id,
        ]);
    }

    /**
     * Réinitialiser la base avec les 5 tâches de démonstration du TP.
     */
    public function resetDemo(): JsonResponse
    {
        Task::truncate();

        foreach (array_reverse(TaskSeeder::demoTasks()) as $taskData) {
            Task::create($taskData);
        }

        return response()->json(Task::orderByDesc('id')->get());
    }
}
