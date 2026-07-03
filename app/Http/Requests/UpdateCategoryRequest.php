<?php

namespace App\Http\Requests;

use App\Enums\TransactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required', 'string', 'max:100',
                Rule::unique('categories')
                    ->ignore($this->route('category'))
                    ->where(fn ($q) => $q
                        ->where('user_id', $this->user()->id)
                        ->where('type', $this->input('type'))
                    ),
            ],
            'type' => ['required', new Enum(TransactionType::class)],
            'icon' => ['nullable', 'string', 'max:16'],
            'color' => ['nullable', 'string', 'max:9'],
            'keywords' => ['nullable', 'array'],
            'keywords.*' => ['string', 'max:40'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama kategori',
            'type' => 'tipe',
            'color' => 'warna',
        ];
    }
}
