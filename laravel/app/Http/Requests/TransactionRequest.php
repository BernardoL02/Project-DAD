<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionRequest extends FormRequest
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
            'brain_coins' => 'required|integer|not_in:0', // Valor não pode ser zero
            'game_id' => 'nullable|exists:games,id', // ID do jogo é opcional
            'type' => 'required|in:B,P,I', // Tipos permitidos: B (bônus), P (pagamento), I (interno)
            'euros' => 'nullable|numeric|min:0', // Valor em euros (opcional)
            'payment_type' => 'nullable|in:MBWAY,IBAN,MB,VISA', // Formas de pagamento permitidas
            'payment_reference' => 'nullable|string', // Referência do pagamento (opcional)
        ];
    }

    /**
     * Custom error messages for validation rules.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'brain_coins.required' => 'The brain coins value is required.',
            'brain_coins.not_in' => 'The brain coins value cannot be zero.',
            'type.required' => 'The type of transaction is required.',
            'type.in' => 'The type must be one of the following: B (bonus), P (payment), or I (internal).',
            'game_id.exists' => 'The specified game does not exist.',
            'euros.numeric' => 'The euros value must be a number.',
            'payment_type.in' => 'The payment type must be one of the following: MBWAY, IBAN, MB, VISA.',
        ];
    }
}
