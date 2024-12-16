<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Game;
use App\Models\User;
use App\Models\Board;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Models\MultiplayerGame;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\GameResource;
use Illuminate\Support\Facades\Gate;
use App\Http\Requests\StoreGameRequest;
use App\Http\Requests\UpdateGameRequest;
use App\Http\Resources\MultiPlayerGameResource;
use App\Http\Resources\MyMultiPlayerGameResource;
use App\Http\Resources\ShowMultiplayerGameResource;

class GameController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function viewAll()
    {
        $totalGamesByYearMoth = DB::table('games')
            ->selectRaw('YEAR(began_at) as year, MONTH(began_at) as month, COUNT(*) as total')
            ->where('status', 'E')
            ->groupByRaw('YEAR(began_at), MONTH(began_at)')
            ->orderByRaw('YEAR(began_at), MONTH(began_at)')
            ->get();

        $gamesByBoardSize = DB::table('games')
            ->selectRaw('board_id as board,COUNT(*) as total')
            ->where('status', 'E')
            ->groupByRaw('board_id')
            ->get();

        $gamesByType = DB::table('games')
        ->selectRaw('type,COUNT(*) as total')
        ->where('status', 'E')
        ->groupByRaw('type')
        ->get();

        return [
            'totalGamesByYearMoth' => $totalGamesByYearMoth,
            'gamesByBoardSize' => $gamesByBoardSize,
            'gamesByType' => $gamesByType
        ];
    }


    public function index(Request $request)
    {
        $boardSize = $request->input('board_size');
        $gameType = $request->input('game_type');
        $gameStatus = $request->input('game_status');

        $startDate = $request->input('date_range')[0] ?? null;
        $endDate = $request->input('date_range')[1] ?? null;

        $gamesQuery = Game::with([
            'createdUser' => function ($query) {
                $query->withTrashed();
            },
            'winnerUser' => function ($query) {
                $query->withTrashed();
            },
        ]);

        if ($boardSize !== 'All') {
            $gamesQuery->where('board_id', $boardSize);
        }

        if ($gameType !== 'All') {
            $gamesQuery->where('type', $gameType);
        }

        if ($gameStatus !== 'All') {
            $gamesQuery->where('status', $gameStatus);
        }

        if ($startDate && $endDate) {
            $gamesQuery->whereBetween('began_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ]);
        }

        $gamesQuery->orderBy('began_at', 'desc');

        $games = $gamesQuery->paginate(10);

        return [
            'data' => GameResource::collection($games)->response()->getData(true)['data'],
            'meta' => [
                'last_page' => $games->lastPage(),
            ],
        ];
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGameRequest $request)
    {
        $gameData = $request->validated();
        $gameData['created_user_id'] = $request->user()->id;

        $game = new Game($gameData);

        if (Gate::denies('create', $game)) {
            return response()->json([
                'message' => 'You do not have permission to create this game.'
            ], 403);
        }

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
        if ($game->type == "S") {
            return response()->json([
                'message' => 'This game is single-player. The operation is only allowed for multiplayer games.',
            ], 400);
        }

        $gameDetails = Game::with([
            'createdUser',
            'winnerUser',
            'multiplayerGamesPlayed' => function ($query) {
                $query->select('user_id', 'game_id', 'player_won', 'pairs_discovered')->with('user');
            }
        ])
        ->find($game->id);

        if (!$gameDetails) {
            return response()->json(['error' => 'Game not found'], 404);
        }

        return new MultiPlayerGameResource($gameDetails);
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
            ->orderBy('id', 'desc')
            ->get();

        $multiPlayerGames->each(function ($game) use ($user) {
            $playerStats = $game->multiplayerGamesPlayed->firstWhere('user_id', $user->id);
            $game->pairs_discovered = $playerStats ? (int)$playerStats->pairs_discovered : 0;
        });

        return MyMultiPlayerGameResource::collection($multiPlayerGames);
    }

    public function updateGameStatus(UpdateGameRequest $request, Game $game)
    {
        $gameData = $request->validate([
            'status' => 'required|string|in:PL,E,I',
            'began_at' => 'nullable|date',
            'ended_at' => 'nullable|date|after_or_equal:began_at',
            'winner_user_id' => 'nullable|numeric',
            'total_time' => 'nullable|numeric|min:0',
            'total_turns_winner' => 'nullable|integer|min:0',
        ]);

        $customData = json_decode($game->custom, true) ?? [];

        if ($request->has('custom')) {
            $newCustomData = json_decode($request->input('custom'), true);
            $customData = array_merge($customData, $newCustomData);
        }

        $validated = $request->validated();
        $validated['custom'] = json_encode($customData);

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

                $difficulty = $request->has('custom') ? "Hard" : "Normal";

                $transactionData = [
                    'type' => 'B',
                    'user_id' => $user->id,
                    'brain_coins' => 5,
                    'game_id' => null,
                    'transaction_datetime' => now(),
                    'custom' => json_encode([
                        'notificationRead' => 1,
                        'msg' => "You received 5 brain coins for beating your previous record on a $boardSize board in $difficulty mode.",
                    ]),
                ];

                $transaction = Transaction::create($transactionData);

                $user->brain_coins_balance += 5;
                $user->save();
            }
        }

        $game->update($validated);

        if (isset($transaction)) {
            $transaction->update(['game_id' => $game->id]);
        }

        return new GameResource($game);
    }

    public function updateOwner(Request $request, Game $game)
    {
        $validated = $request->validate([
            'new_owner_id' => 'required|exists:users,id',
        ]);

        $game->created_user_id = $validated['new_owner_id'];
        $game->save();

        return response()->json([
            'message' => 'Game owner updated successfully.',
            'game' => new GameResource($game),
        ]);
    }


    public function storePlayers(Request $request, Game $game)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'required|integer|exists:users,id',
        ]);

        $userIds = $request->input('user_ids');

        MultiplayerGame::insert(array_map(fn($id) => [
            'game_id' => $game->id,
            'user_id' => $id,
        ], $userIds));

        return response()->json([
            'message' => 'Players stored successfully.',
            'game_id' => $game->id,
            'user_ids' => $userIds,
        ], 201);
    }



    public function updatePlayers(Request $request, Game $game)
    {
        $request->validate([
            'updates' => 'required|array',
            'updates.*.id' => 'required|integer|exists:multiplayer_games_played,id',
            'updates.*.player_won' => 'required|boolean',
            'updates.*.pairs_discovered' => 'required|integer|min:0',
        ]);

        $updates = $request->input('updates');

        $game = Game::findOrFail($game->id);

        foreach ($updates as $update) {
            MultiplayerGame::where('user_id', $update['id'])
                ->where('game_id', $game->id)
                ->update([
                    'player_won' => $update['player_won'] ? 1 : 0,
                    'pairs_discovered' => $update['pairs_discovered'],
                ]);
        }

        $winnerUpdate = collect($updates)->firstWhere('player_won', true);

        if ($winnerUpdate) {
            $winnerId = $winnerUpdate['id'];
            $winner = User::find($winnerId);

            if ($winner) {
                $totalPlayers = count($updates);
                $reward = ($totalPlayers * 5) - 3;

                $transactionData = [
                    'type' => 'I',
                    'user_id' => $winnerId,
                    'brain_coins' => $reward,
                    'game_id' => $game->id,
                    'transaction_datetime' => now(),
                    'custom' => json_encode([
                        'notificationRead' => 1,
                        'msg' => "You received $reward brain coins for winning the multiplayer game ($game->id)!",
                    ]),
                ];

                $transaction = Transaction::create($transactionData);
                $winner->brain_coins_balance += $reward;
                $winner->save();
            }
        }

        return response()->json([
            'message' => 'Players updated successfully.',
            'game_id' => $game->id,
            'updates' => $updates,
        ]);
    }



}
