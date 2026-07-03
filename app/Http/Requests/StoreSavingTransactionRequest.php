<?php

namespace App\Http\Requests;

use App\Enums\SavingTransactionType;
use App\Models\SavingAccount;
use App\Support\Money;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreSavingTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $savingAccount = $this->route('savingAccount');

        return $savingAccount instanceof SavingAccount
            && $savingAccount->user_id === $this->user()?->id;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'amount' => Money::normalizeRupiahInput($this->input('amount')),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', new Enum(SavingTransactionType::class)],
            'description' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'integer', 'min:1'],
            'occurred_at' => ['required', 'date', 'before_or_equal:today'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'type' => 'tipe mutasi',
            'description' => 'catatan',
            'amount' => 'jumlah',
            'occurred_at' => 'tanggal',
        ];
    }
}
