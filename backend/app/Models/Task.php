<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'titre',
        'description',
        'priorite',
        'statut',
        'date_creation',
        'attachments',
        'reminder',
        'location',
        'observers',
        'comments',
    ];

    protected $casts = [
        'attachments' => 'array',
        'reminder' => 'array',
        'location' => 'array',
        'observers' => 'array',
        'comments' => 'array',
    ];

    /**
     * Garantit un format JSON cohérent avec l'application React Native.
     */
    public function toArray(): array
    {
        $data = parent::toArray();
        $data['id'] = (string) $this->id;
        $data['description'] = $this->description ?? '';
        $data['attachments'] = $this->attachments ?? [];
        $data['observers'] = $this->observers ?? [];
        $data['comments'] = $this->comments ?? [];
        return $data;
    }
}
