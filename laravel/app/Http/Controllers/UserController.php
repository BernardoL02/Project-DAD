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
    
    public function updateCoins(UserRequest $request)
    {
        $user = $request->user();
        $user->update([
            'brain_coins_balance' => $request->input('brain_coins_balance'),
        ]);
        return new UserResource($user);
    }
}
