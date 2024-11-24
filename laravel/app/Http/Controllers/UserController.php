<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegistrationRequest;
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
        $user = User::create($request->validated());

        return new UserResource($user);
    }
}

