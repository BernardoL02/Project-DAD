<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGameRequest extends FormRequest
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
    public function rules()
    {
        return [
            'status' => 'nullable|string|in:PL,E,I',
            'began_at' => 'nullable|date', 
            'ended_at' => 'nullable|date|after_or_equal:began_at',
            'winner_user_id' => 'nullable|numeric',
            'total_time' => 'nullable|numeric|min:0',
            'total_turns_winner' => 'nullable|integer|min:0',
            'custom' => 'nullable|json',
        ];
    }

}
