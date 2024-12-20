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
use App\Models\Transaction;
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
    Route::delete('/users/me', [UserController::class, 'destroy'])->can("deleteMyAccount", User::class);
    Route::get('/users/me/notifications', [UserController::class , 'getNotifications'])->can("view", User::class);
    Route::delete('/users/me/notifications', [UserController::class , 'deleteAllNotifications'])->can("deleteNotifications", User::class);
    Route::get('/users/me/statistics', [UserController::class, 'Statistics'])->can("view", User::class);

    //------Administrator -----
    Route::get('/admin/users', [AdministratorController::class, 'index'])->can("viewAny", User::class);
    Route::post('/admin/register', [AdministratorController::class, 'store'])->can("create", User::class);
    Route::patch('/admin/block/{user}', [AdministratorController::class, 'blockUser'])->can('block', 'user');
    Route::patch('/admin/unblock/{user}', [AdministratorController::class, 'unblockUser'])->can('unblock', 'user');
    Route::delete('/admin/delete/{user}', [AdministratorController::class, 'destroy'])->can('delete', 'user');
    Route::post('/admin/transactions', [AdministratorController::class, 'viewTransactions'])->can("viewAll", Transaction::class);
    Route::get('/admin/transactions', [AdministratorController::class, 'viewTransactionsStatistics'])->can("viewAll", Transaction::class);

    // ----- Games -----
    Route::get('/games', [GameController::class, 'viewAll'])->can('viewAny', Game::class);
    Route::post('/games/all', [GameController::class, 'index'])->can('viewAny', Game::class);
    Route::get('/games/single', [GameController::class, 'mySinglePlayerGames'])->can("view", Game::class);
    Route::get('/games/multi', [GameController::class, 'myMultiPlayerGames'])->can("view", Game::class);
    Route::get('/games/{game}', [GameController::class, 'show'])->can("show", "game");
    Route::post('/games', [GameController::class, 'store']); //Protegida na função do controlador
    Route::patch('/games/{game}', [GameController::class, 'updateGameStatus'])->can("update", "game");
    Route::patch('/games/{game}/owner', [GameController::class, 'updateOwner'])->can("update", "game");
    Route::post('/games/{game}', [GameController::class, 'storePlayers'])->can("update", "game");
    Route::patch('/games/{game}/players', [GameController::class, 'updatePlayers'])->can("update", "game");


    // ----- Transactions -----
    Route::get('/transactions', [TransactionController::class, 'index'])->can("viewAny", Transaction::class);
    Route::post('/transactions', [TransactionController::class, 'store'])->can("create", Transaction::class);
    Route::patch('/transactions/{transaction}', [TransactionController::class, 'changeTransactionStatus'])->can("update","transaction");
});

// ----- Boards -----
Route::get('/boards', [BoardController::class, 'index']);

// ------ Score Boards ----
Route::get('/scoreboard/single', [ScoreBoardController::class, 'globalSinglePlayerScoreboard']);
Route::get('/scoreboard/multiplayer', [ScoreBoardController::class, 'multiplayerScoreboard']);
Route::get('/users/{nickname}', [UserController::class , 'profileUser']);

// ------ Anonymous Statistics ------
Route::get('/anonymous/games', [GameController::class, 'viewAllStatisticsAnonymous']);





