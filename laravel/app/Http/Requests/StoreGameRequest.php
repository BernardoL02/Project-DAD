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
            'created_user_id' => 'required|exists:users,id',  // User ID who created the game must exist in the `users` table
            'winner_user_id' => 'nullable|exists:users,id',  // Winner's user ID (can be null)
            'type' => 'required|string|in:S,E',  // Game type, only 'S' or 'E' are allowed
            'status' => 'required|string|in:E,S',  // Game status, only 'E' or 'S' are allowed
            'began_at' => 'required|date',  // Game start date must be a valid date
            'ended_at' => 'nullable|date|after_or_equal:began_at',  // Game end date (must be after or equal to `began_at`)
            'total_time' => 'required|numeric|min:0',  // Total time must be a numeric value greater than or equal to 0
            'board_id' => 'required|exists:boards,id',  // Board ID must exist in the `boards` table
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
            'created_user_id.required' => 'The creator user ID is required.',
            'created_user_id.exists' => 'The creator user ID does not exist.',
            'winner_user_id.exists' => 'The winner user ID does not exist.',
            'type.required' => 'The game type is required.',
            'type.in' => 'The game type must be either "S" or "E".',
            'status.required' => 'The game status is required.',
            'status.in' => 'The game status must be either "E" or "S".',
            'began_at.required' => 'The start date is required.',
            'began_at.date' => 'The start date must be a valid date.',
            'ended_at.date' => 'The end date must be a valid date.',
            'ended_at.after_or_equal' => 'The end date must be after or equal to the start date.',
            'total_time.required' => 'Total time is required.',
            'total_time.numeric' => 'Total time must be a number.',
            'total_time.min' => 'Total time cannot be less than 0.',
            'board_id.required' => 'The board ID is required.',
            'board_id.exists' => 'The board ID does not exist.',
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
