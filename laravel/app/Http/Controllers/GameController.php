<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Board;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Http\Resources\GameResource;
use App\Http\Requests\StoreGameRequest;
use App\Http\Resources\MultiPlayerGameResource;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\UpdateGameRequest;

class GameController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
       $games = Game::with([
        'createdUser' => function ($query) {
            $query->withTrashed();
        },
        'winnerUser' => function ($query) {
            $query->withTrashed();
        },
        ])->orderBy('began_at', 'desc')->get();

        return GameResource::collection($games);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGameRequest $request)
    {
        $gameData = $request->validated();
        $gameData['created_user_id'] = $request->user()->id;

        if ($request->has('custom')) {
            $customData = json_decode($request->input('custom'), true);

            $customData = array_filter($customData, function ($value) {
                return $value !== null;
            });

            if (!empty($customData)) {
                $gameData['custom'] = json_encode($customData);
            }
        }

        $game = Game::create($gameData);

        return new GameResource($game);
    }


    /**
     * Display the specified resource.
     */
    public function show(Game $game)
    {
        return new GameResource($game);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    public function mySinglePlayerGames(Request $request)
    {
        $user = $request->user();

        $singlePlayerGames = $user->games()
            ->where('type', 'S')
            ->orderBy('began_at', 'desc')
            ->get();

        return GameResource::collection($singlePlayerGames);
    }

    public function myMultiPlayerGames(Request $request)
    {
        $user = $request->user();

        $multiPlayerGames = Game::with([
                'createdUser' => function ($query) {
                    $query->withTrashed();
                },
                'winnerUser' => function ($query) {
                    $query->withTrashed();
                },
                'multiplayerGamesPlayed' => function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                }
            ])
            ->withCount('multiplayerGamesPlayed')
            ->whereHas('multiplayerGamesPlayed', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->where('type', 'M')
            ->orderBy('began_at', 'asc')
            ->get();

        $multiPlayerGames->each(function ($game) use ($user) {
            $playerStats = $game->multiplayerGamesPlayed->firstWhere('user_id', $user->id);
            $game->pairs_discovered = $playerStats ? (int)$playerStats->pairs_discovered : 0;
        });

        return MultiPlayerGameResource::collection($multiPlayerGames);
    }

public function updateGameStatus(UpdateGameRequest $request, Game $game)
{
    // Validate the request data
    $gameData = $request->validate([
        'status' => 'required|string|in:E,I',
        'ended_at' => 'nullable|date|after_or_equal:began_at',
        'total_time' => 'nullable|numeric|min:0',
        'total_turns_winner' => 'nullable|integer|min:0',
    ]);

    // Retrieve and merge any custom data
    $customData = json_decode($game->custom, true) ?? [];

    if ($request->has('custom')) {
        $newCustomData = json_decode($request->input('custom'), true);
        $customData = array_merge($customData, $newCustomData);
    }

    // Prepare the validated data with merged custom data
    $validated = $request->validated();
    $validated['custom'] = json_encode($customData);

    // Check if the game type is 'S' and if status is 'E' (Ended)
    if ($game->type === 'S' && $gameData['status'] === 'E') {
        $user = $request->user();

        // Find the best completed game of the user on the same board
        $bestGame = Game::where('created_user_id', $user->id)
            ->where('status', 'E')
            ->where('type', 'S')
            ->where('board_id', $game->board_id)
            ->orderBy('total_time')
            ->first();

        // If a previous best game exists and this game has a better time
        if ($bestGame && isset($gameData['total_time']) && $gameData['total_time'] < $bestGame->total_time) {
            $board = Board::find($game->board_id);
            $boardSize = $board ? "{$board->board_cols}x{$board->board_rows}" : "unknown size";

            // Create a transaction for awarding brain coins
            $transactionData = [
                'type' => 'B',
                'user_id' => $user->id,
                'brain_coins' => 5,
                'game_id' => null,
                'transaction_datetime' => now(),
                'custom' => json_encode([
                    'notificationRead' => 1,
                    'msg' => "You received 5 brain coins for beating your previous record on a $boardSize board.",
                ]),
            ];

            // Create the transaction and update the user's brain coin balance
            $transaction = Transaction::create($transactionData);

            $user->brain_coins_balance += 5;
            $user->save();
        }
    }

    // Update the game with the validated data
    $game->update($validated);

    // If a transaction was created, associate it with the current game
    if (isset($transaction)) {
        $transaction->update(['game_id' => $game->id]);
    }

    // Return the updated game as a resource
    return new GameResource($game);
}


}
