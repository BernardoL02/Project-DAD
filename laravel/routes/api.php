<?php

use App\Http\Controllers\AdministratorController;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\ScoreBoardController;
use App\Http\Controllers\TransactionController;
use App\Models\User;

Route::post('/auth/register',[UserController::class, 'store']);
Route::post('/auth/login', [AuthController::class, "login"]);

Route::middleware(['auth:sanctum'])->group(function () {

    // ----- Auntenticação -----
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refreshtoken', [AuthController::class, 'refreshToken']);
    Route::get('/users/me', [UserController::class , 'showMe']);
    Route::post('/users/me', [UserController::class, 'update']);
    Route::patch('/users/me', [UserController::class, 'updatePassword']);
    Route::delete('/users/me', [UserController::class, 'destroy']);
    Route::get('/users/me/notifications', [UserController::class , 'getNotifications']);

    //------Administrator -----
    Route::get('/admin/users', [AdministratorController::class, 'index'])->can("viewAny", User::class);
    Route::post('/admin/register', [AdministratorController::class, 'store'])->can("create", User::class);
    Route::patch('/admin/block/{id}', [AdministratorController::class, 'blockUser'])->can('block', User::class);
    Route::patch('/admin/unblock/{id}', [AdministratorController::class, 'unblockUser'])->can('unblock', User::class);
    Route::delete('/admin/delete/{id}', [AdministratorController::class, 'destroy'])->can('delete', User::class);
    Route::get('/admin/transactions', [AdministratorController::class, 'viewTransactions']);

    // ----- Games -----
    Route::get('/games', [GameController::class, 'index'])->can("viewAny", Game::class);
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
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::patch('/transactions/{transaction}', [TransactionController::class, 'changeTransactionStatus']);

});

// ------ Score Boards ----
Route::get('/scoreboard/single', [ScoreBoardController::class, 'globalSinglePlayerScoreboard']);
Route::get('/scoreboard/multiplayer', [ScoreBoardController::class, 'multiplayerScoreboard']);
Route::get('/users/{nickname}', [UserController::class , 'profileUser']);







