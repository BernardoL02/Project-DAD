<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'brain_coins_balance' => 'required|integer|min:0',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'brain_coins_balance.required' => 'O campo brain_coins_balance é obrigatório.',
            'brain_coins_balance.integer' => 'O valor de brain_coins_balance deve ser um número inteiro.',
            'brain_coins_balance.min' => 'O valor de brain_coins_balance não pode ser negativo.',
        ];
    }
}
