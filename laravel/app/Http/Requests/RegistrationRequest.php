<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'nickname' => 'required|string|max:255|unique:users,nickname',
            'password' => 'required|string|min:3',
            'photo_filename' => 'nullable|image|max:4096',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'The name field is required.',
            'email.required' => 'The email address is required.',
            'email.email' => 'The email address must be a valid email address.',
            'email.unique' => 'The email address is already in use.',
            'nickname.required' => 'The nickname field is required.',
            'nickname.unique' => 'The nickname is already taken.',
            'password' => 'The password field is required.',
            'password.min' => 'The password must be at least 3 characters.',
            'photo_filename.max' => 'The photo file may not be greater than 1MB.',
        ];
    }
}
