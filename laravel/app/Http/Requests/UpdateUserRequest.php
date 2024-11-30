<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
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
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,' . $this->user()->id,
            'nickname' => 'nullable|string|max:255|unique:users,nickname,' . $this->user()->id,
            'photo_filename' => 'nullable|string|max:1024',
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
            'name.string' => 'The name must be a valid string.',
            'name.max' => 'The name must not exceed 255 characters.',
            'email.email' => 'The email must be a valid email address.',
            'email.max' => 'The email must not exceed 255 characters.',
            'email.unique' => 'This email address is already taken.',
            'nickname.string' => 'The nickname must be a valid string.',
            'nickname.max' => 'The nickname must not exceed 255 characters.',
            'photo_filename.string' => 'The photo filename must be a valid string.',
            'photo_filename.max' => 'The photo filename must not exceed 1024 characters.',
        ];
    }
}
