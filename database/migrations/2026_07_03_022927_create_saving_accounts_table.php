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
        Schema::create('saving_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('bank_name');
            $table->string('name');
            $table->unsignedBigInteger('principal_amount');
            $table->boolean('has_interest')->default(false);
            $table->decimal('annual_interest_rate', 8, 4)->nullable();
            $table->date('interest_started_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'bank_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saving_accounts');
    }
};
