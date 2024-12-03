<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Validation\Rules\Password;
use App\Http\Requests\RegistrationRequest;
use App\Http\Requests\UpdatePasswordRequest;
use App\Htpp\Request\ProfileUserResource;
use App\Http\Resources\ProfileUserResource as ResourcesProfileUserResource;

class UserController extends Controller
{
    public function showMe(Request $request)
    {
        return new UserResource($request->user());
    }

    public function store(RegistrationRequest $request)
    {
        $validated = $request->validated();

        $user = User::create($validated);
        $user->brain_coins_balance = 0;
        $user->type = 'P';

        return new UserResource($user);
    }


    public function update(UpdateUserRequest $request)
    {
        $user = $request->user();

        $user->update($request->validated());

        if ($request->hasFile('photo_filename')) {
            $request->validate([
                'photo_filename' => 'max:4096',
            ]);

            $path = $request->file('photo_filename')->store('photos', 'public');

            $user->photo_filename = 'storage/photos/' . basename($path);
        }

        $user->save();

        return new UserResource($user);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'password' => 'required|min:3',
            'confirm_password' => 'required|min:3',
        ]);

        if ($request->password !== $request->confirm_password) {
            return response()->json(['message' => 'Passwords do not match!.'], 400);
        }

        $user = $request->user();

        if (Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'New password cannot be the same as the current password!'], 400);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully!',
            'title' => 'Success'
        ],200);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'password' => 'required'
        ]);

        $user = $request->user();

        if ($user->isAdmin()) {
            return response()->json(['message' => 'Administrators cannot delete their own accounts.'], 403);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password.'], 400);
        }

        $authController = new AuthController();
        $authController->logout($request);

        if ($user->transactions()->exists() || $user->games()->exists()) {
            $user->delete();
        } else {
            $user->forceDelete();
        }

        return response()->json([
            'message' => 'Your account was permanently deleted.'
        ], 200);
    }

     public function profileUser(Request $request, String $nickname){


        $user = User::where('nickname',$nickname)->first();

        if(!$user){
        return response()->json([
                    'message' => 'User not found.',
                ], 404);
        }

        return new ResourcesProfileUserResource($user);
     }
}

