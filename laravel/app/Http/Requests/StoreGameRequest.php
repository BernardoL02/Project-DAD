<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGameRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        // If you need any authorization logic, it can be defined here.
        // For now, we return `true` to allow any user to make this request.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'winner_user_id' => 'nullable|exists:users,id',  // Pode ser nulo
            'type' => 'required|string|in:S,M',  // 'S' para single-player, 'M' para multiplayer
            'status' => 'required|string|in:PL,E,I',  // 'PL' (In Progress), 'E' (Ended), 'I' (Interrupted)
            'began_at' => 'required|date',  // Data de início obrigatória
            'ended_at' => 'nullable|date|after_or_equal:began_at',  // Data de término opcional
            'total_time' => 'nullable|numeric|min:0',  // Total time opcional
            'board_id' => 'required|exists:boards,id',  // ID do tabuleiro obrigatório
        ];
    }    

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'winner_user_id.exists' => 'The specified winner user ID does not exist in the system.',
            'type.required' => 'The game type field is mandatory.',
            'type.in' => 'The game type must be one of the following: "S" (Single-player) or "M" (Multiplayer).',
            'status.required' => 'The game status field is mandatory.',
            'status.in' => 'The game status must be one of the following: "PL" (In Progress), "E" (Ended), or "I" (Interrupted).',
            'began_at.required' => 'The start date (began_at) is required.',
            'began_at.date' => 'The start date (began_at) must be a valid date in the format YYYY-MM-DD HH:MM:SS.',
            'ended_at.date' => 'The end date (ended_at) must be a valid date in the format YYYY-MM-DD HH:MM:SS.',
            'ended_at.after_or_equal' => 'The end date (ended_at) must be on or after the start date (began_at).',
            'total_time.numeric' => 'The total time (total_time) must be a numeric value.',
            'total_time.min' => 'The total time (total_time) must be at least 0.',
            'board_id.required' => 'The board ID (board_id) field is mandatory.',
            'board_id.exists' => 'The specified board ID (board_id) does not exist in the system.',
        ];
    }


    /**
     * Get custom attributes for validator errors.
     *
     * @return array
     */
    public function attributes()
    {
        return [
            'created_user_id' => 'Creator User ID',
            'winner_user_id' => 'Winner User ID',
            'type' => 'Game Type',
            'status' => 'Game Status',
            'began_at' => 'Start Date',
            'ended_at' => 'End Date',
            'total_time' => 'Total Time',
            'board_id' => 'Board ID',
        ];
    }
}
