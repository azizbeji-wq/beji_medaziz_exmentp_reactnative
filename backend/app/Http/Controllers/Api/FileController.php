<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FileController extends Controller
{
    /**
     * Uploader une pièce jointe (photo, PDF, document) et renvoyer son URL publique.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:20480', // Max 20 Mo
        ]);

        $uploadedFile = $request->file('file');
        $originalName = $uploadedFile->getClientOriginalName() ?: 'fichier';
        $mimeType = $uploadedFile->getMimeType() ?: $uploadedFile->getClientMimeType() ?: 'application/octet-stream';
        $extension = $uploadedFile->getClientOriginalExtension() ?: $uploadedFile->guessExtension() ?: 'bin';
        $safeBase = Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) ?: 'fichier';
        $storedName = $safeBase . '_' . time() . '_' . Str::random(6) . '.' . $extension;

        Storage::disk('public')->putFileAs('attachments', $uploadedFile, $storedName);

        $type = 'file';
        if (str_starts_with($mimeType, 'image/')) {
            $type = 'image';
        } elseif ($mimeType === 'application/pdf' || str_ends_with(strtolower($originalName), '.pdf')) {
            $type = 'pdf';
        }

        $publicUrl = $request->getSchemeAndHttpHost() . '/api/files/' . $storedName;

        return response()->json([
            'id' => 'api_' . time() . '_' . Str::random(5),
            'name' => $originalName,
            'type' => $type,
            'mimeType' => $mimeType,
            'size' => $uploadedFile->getSize() ?: 0,
            'uri' => $publicUrl,
            'source' => 'api',
            'dateAdded' => now()->toIso8601String(),
        ], 201);
    }

    /**
     * Servir un fichier uploadé avec son type MIME.
     */
    public function show(string $filename): BinaryFileResponse
    {
        $safeName = basename($filename);
        if (!preg_match('/^[A-Za-z0-9._-]+$/', $safeName)) {
            abort(404);
        }

        $relativePath = 'attachments/' . $safeName;
        if (!Storage::disk('public')->exists($relativePath)) {
            abort(404);
        }

        $fullPath = Storage::disk('public')->path($relativePath);
        return response()->file($fullPath);
    }
}
