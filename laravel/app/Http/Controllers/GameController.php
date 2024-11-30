<?php

namespace App\Http\Controllers;

use App\Models\Game;
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
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Game $game)
    {
        // Perform a soft delete
        $game->delete();

        // Return a success response with HTTP 204 No Content
        return response()->json(null, 204);
    }

    //Other Functions
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
                'createdUser',
                'winnerUser',
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
        $validated = $request->validate([
            'status' => 'required|string|in:E,I',
            'ended_at' => 'nullable|date|after_or_equal:began_at',
            'total_time' => 'nullable|numeric|min:0',
        ]);

        $game->update($validated);

        return new GameResource($game);
    }
}
