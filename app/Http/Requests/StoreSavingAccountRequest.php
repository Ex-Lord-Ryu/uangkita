<?php

namespace App\Http\Requests;

use App\Enums\SavingInterestPeriod;
use App\Support\Money;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreSavingAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'principal_amount' => Money::normalizeRupiahInput($this->input('principal_amount')),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'bank_name' => ['required', 'string', 'max:100'],
            'name' => ['nullable', 'string', 'max:100'],
            'principal_amount' => ['required', 'integer', 'min:0'],
            'has_interest' => ['required', 'boolean'],
            'annual_interest_rate' => [
                'nullable',
                Rule::requiredIf(fn (): bool => $this->boolean('has_interest')),
                'numeric',
                'min:0',
                'max:100',
            ],
            'interest_period' => [
                'nullable',
                Rule::requiredIf(fn (): bool => $this->boolean('has_interest')),
                new Enum(SavingInterestPeriod::class),
            ],
            'interest_started_at' => [
                'nullable',
                Rule::requiredIf(fn (): bool => $this->boolean('has_interest')),
                'date',
                'before_or_equal:today',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'bank_name' => 'bank',
            'name' => 'nama tabungan',
            'principal_amount' => 'jumlah tabungan',
            'has_interest' => 'status bunga',
            'annual_interest_rate' => 'bunga per tahun',
            'interest_period' => 'periode bunga',
            'interest_started_at' => 'tanggal mulai bunga',
        ];
    }
}
