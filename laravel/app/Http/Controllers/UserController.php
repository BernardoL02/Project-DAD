<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use App\Http\Requests\UserRequest;

class UserController extends Controller
{
    public function showMe(Request $request)
    {
        return new UserResource($request->user());
    }
}
