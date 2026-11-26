<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public static function demoTasks(): array
    {
        return [
            [
                'titre' => 'Préparer la présentation',
                'description' => 'Réaliser les diapositives pour la présentation du projet.',
                'priorite' => 'Élevée',
                'statut' => 'À faire',
                'date_creation' => '12/04/2025',
                'attachments' => [
                    [
                        'id' => 'demo_att_1',
                        'name' => 'plan_presentation.pdf',
                        'type' => 'pdf',
                        'mimeType' => 'application/pdf',
                        'size' => 245000,
                        'uri' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                        'source' => 'document',
                    ],
                ],
                'reminder' => [
                    'datetime' => '2026-11-20T14:30:00.000Z',
                    'note' => 'Répéter les diapositives avec l’équipe',
                ],
                'location' => null,
                'observers' => [
                    ['id' => 'obs_1', 'name' => 'Professeur', 'addedAt' => '2026-11-12T10:00:00.000Z'],
                ],
                'comments' => [
                    [
                        'id' => 'cmt_1',
                        'author' => 'Aziz Beji',
                        'text' => 'Structure du projet et diapositives prêtes pour la revue.',
                        'createdAt' => '2026-11-13T09:15:00.000Z',
                    ],
                ],
            ],
            [
                'titre' => 'Répondre aux emails',
                'description' => 'Traiter les messages urgents des clients et partenaires.',
                'priorite' => 'Moyenne',
                'statut' => 'À faire',
                'date_creation' => '11/04/2025',
                'attachments' => [
                    [
                        'id' => 'demo_att_2',
                        'name' => 'capture_reunion.jpg',
                        'type' => 'image',
                        'mimeType' => 'image/jpeg',
                        'size' => 154000,
                        'uri' => 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&q=80',
                        'source' => 'camera',
                    ],
                ],
                'reminder' => null,
                'location' => [
                    'latitude' => 36.8065,
                    'longitude' => 10.1815,
                    'address' => 'Avenue Habib Bourguiba, Tunis, Tunisie',
                ],
                'observers' => [],
                'comments' => [],
            ],
            [
                'titre' => 'Lire la documentation',
                'description' => 'Étudier les fonctionnalités avancées de React Native et AsyncStorage.',
                'priorite' => 'Faible',
                'statut' => 'Terminée',
                'date_creation' => '10/04/2025',
                'attachments' => [],
                'reminder' => null,
                'location' => null,
                'observers' => [],
                'comments' => [],
            ],
            [
                'titre' => 'Développer la fonctionnalité',
                'description' => 'Implémenter la persistance locale et la navigation multi-écrans.',
                'priorite' => 'Élevée',
                'statut' => 'À faire',
                'date_creation' => '09/04/2025',
                'attachments' => [],
                'reminder' => null,
                'location' => null,
                'observers' => [],
                'comments' => [],
            ],
            [
                'titre' => 'Tester sur mobile & web',
                'description' => 'Vérifier la fluidité sur Expo Go et le navigateur web.',
                'priorite' => 'Faible',
                'statut' => 'Terminée',
                'date_creation' => '08/04/2025',
                'attachments' => [],
                'reminder' => null,
                'location' => null,
                'observers' => [],
                'comments' => [],
            ],
        ];
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Task::count() > 0) {
            return;
        }

        // Insertion inversée pour que l'id le plus élevé corresponde à la 1ère tâche récente
        foreach (array_reverse(self::demoTasks()) as $taskData) {
            Task::create($taskData);
        }
    }
}
