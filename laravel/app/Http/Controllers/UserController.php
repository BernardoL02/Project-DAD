<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegistrationRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UserRequest;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use App\Models\User;

class UserController extends Controller
{
    public function showMe(Request $request)
    {
        return new UserResource($request->user());
    }

    public function store(RegistrationRequest $request)
    {
        // Validate the request data, this will return errors if validation fails
        $validated = $request->validated();

        // Proceed with creating the user only if validation passes
        $user = User::create($validated);

        $user->brain_coins_balance = 0;
        $user->type = 'P';

        return new UserResource($user);
    }


    public function update(UpdateUserRequest $request)
    {
        $user = $request->user();

        $user->update($request->validated());

        return new UserResource($user);
    }

}

