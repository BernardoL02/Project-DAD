<?php

use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\UserController;

Route::post('/auth/login', [AuthController::class, "login"]);


Route::middleware(['auth:sanctum'])->group(function () {

        // ----- Auntenticação -----
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refreshtoken', [AuthController::class, 'refreshToken']);
    Route::get('/users/me', [UserController::class , 'showMe']);

    // ----- Games -----
    Route::get('/games', [GameController::class, 'index']);
    Route::get('/projects/{project}', [GameController::class, 'show']);

});





