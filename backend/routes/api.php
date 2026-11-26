<?php

use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/health', [TaskController::class, 'health']);

Route::post('/tasks/reset-demo', [TaskController::class, 'resetDemo']);
Route::apiResource('tasks', TaskController::class);

Route::post('/upload', [FileController::class, 'upload']);
Route::get('/files/{filename}', [FileController::class, 'show']);
