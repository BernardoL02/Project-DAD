<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGameRequest;
use App\Models\Game;
use Illuminate\Http\Request;
use App\Http\Resources\GameResource;

class GameController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        return GameResource::collection($user->games);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGameRequest $request)
    {
        $game = Game::create($request->validated());  // Pass array of validated attributes

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

        $singlePlayerGames = $user->games()->where('type', 'S')->get();

        return GameResource::collection($singlePlayerGames);
    }

}
