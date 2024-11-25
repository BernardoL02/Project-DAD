<?php

use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\ScoreBoardController;
use App\Http\Controllers\TransactionController;

Route::post('/auth/login', [AuthController::class, "login"]);


Route::middleware(['auth:sanctum'])->group(function () {

    // ----- Auntenticação -----
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refreshtoken', [AuthController::class, 'refreshToken']);
    Route::get('/users/me', [UserController::class , 'showMe']);

    // ----- Games -----
    Route::get('/games', [GameController::class, 'index']);
    Route::get('/games/single', [GameController::class, 'mySinglePlayerGames']);
    Route::get('/games/multi', [GameController::class, 'myMultiPlayerGames']);
    Route::get('/games/{game}', [GameController::class, 'show']);
    Route::post('/games', [GameController::class, 'store']);
    Route::put('/games/{game}', [GameController::class, 'update']);
    Route::delete('/games/{game}', [GameController::class, 'destroy']);
    Route::patch('/games/{game}', [GameController::class, 'updateGameStatus']);

    // ----- Boards -----
    Route::get('/boards', [BoardController::class, 'index']);

    // ----- Transactions -----
    Route::get('/transactions', [TransactionController::class, 'index']); //Get All Transactions
    Route::post('/transactions', [TransactionController::class, 'store']);

});

// ------ Score Boards ----

Route::get('/scoreboard/single/{boardSize}', [ScoreBoardController::class, 'globalSinglePlayerScoreboard']);
Route::get('/scoreboard/multiplayer', [ScoreBoardController::class, 'multiplayerScoreboard']);

// ------Create User ------

Route::post('/users',[UserController::class, 'store']);





