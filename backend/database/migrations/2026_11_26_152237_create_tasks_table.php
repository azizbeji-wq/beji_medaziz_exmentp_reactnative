<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description')->nullable();
            $table->string('priorite', 20)->default('Moyenne');
            $table->string('statut', 20)->default('À faire');
            $table->string('date_creation', 30)->nullable();
            $table->json('attachments')->nullable();
            $table->json('reminder')->nullable();
            $table->json('location')->nullable();
            $table->json('observers')->nullable();
            $table->json('comments')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
