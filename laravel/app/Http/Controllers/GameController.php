<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Board;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Http\Resources\GameResource;
use App\Http\Requests\StoreGameRequest;
use App\Http\Resources\MultiPlayerGameResource;

class GameController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $games = Game::orderBy('began_at', 'desc')->get();

        return GameResource::collection($games);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGameRequest $request)
    {
        $gameData = $request->validated();
        $gameData['created_user_id'] = $request->user()->id;

        $customData = [];
        if ($request->has('difficulty')) {
            $customData['difficulty'] = $request->input('difficulty');
        }

        $gameData['custom'] = json_encode($customData);

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

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreGameRequest $request, Game $game)
    {
        $game->fill($request->validated());

        $game->save();

        return new GameResource($game);
    }

    public function destroy(Game $game)
    {
        $game->delete();

        return response()->json(null, 204);
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

   public function updateGameStatus(Request $request, Game $game)
    {
        $gameData = $request->validate([
            'status' => 'required|string|in:E,I',
            'ended_at' => 'nullable|date|after_or_equal:began_at',
            'total_time' => 'nullable|numeric|min:0',
            'total_turns_winner' => 'nullable|integer|min:0',
        ]);

        if ($game->type === 'S' && $gameData['status'] === 'E') {
            $user = $request->user();

            $bestGame = Game::where('created_user_id', $user->id)
                ->where('status', 'E')
                ->where('type', 'S')
                ->where('board_id', $game->board_id)
                ->orderBy('total_time')
                ->first();

            if ($bestGame && isset($gameData['total_time']) && $gameData['total_time'] < $bestGame->total_time) {

                $board = Board::find($game->board_id);
                $boardSize = $board ? "{$board->board_cols}x{$board->board_rows}" : "unknown size";

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

                $transaction = Transaction::create($transactionData);

                $user->brain_coins_balance += 5;
                $user->save();
            }
        }

        $game->update($gameData);

        if (isset($transaction)) {
            $transaction->update(['game_id' => $game->id]);
        }

        return new GameResource($game);
    }


}
