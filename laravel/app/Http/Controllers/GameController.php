<?php

namespace App\Http\Controllers;

use App\Models\Game;
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

    public function updateGameStatus(UpdateGameRequest $request, Game $game)
    {
        $customData = json_decode($game->custom, true) ?? [];

        if ($request->has('custom')) {
            $newCustomData = json_decode($request->input('custom'), true);
            $customData = array_merge($customData, $newCustomData);
        }

        $validated = $request->validated();
        $validated['custom'] = json_encode($customData);

        $game->update($validated);

        return new GameResource($game);
    }

}
