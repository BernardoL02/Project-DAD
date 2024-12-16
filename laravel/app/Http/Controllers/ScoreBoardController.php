<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Game;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScoreBoardController extends Controller
{
    public function globalSinglePlayerScoreboard()
    {
        $allScoreboards = Game::select(
            'games.board_id',
            'games.created_user_id',
            DB::raw('MIN(games.total_time) as best_time'),
            'games.status',
            'games.total_turns_winner as min_turns',
            'users.nickname'
        )
        ->join('users', 'users.id', '=', 'games.created_user_id')
        ->where('games.type', "S")
        ->whereNotNull('games.total_time')
        ->groupBy('games.board_id', 'games.created_user_id', 'games.status', 'games.total_turns_winner', 'users.nickname')
        ->orderBy('best_time', 'asc')
        ->orderBy('total_turns_winner', 'asc')
        ->get()
        ->groupBy('board_id')
        ->map(function ($games) {
            return $games->unique('created_user_id')->take(10)->values();
        });

        return response()->json(['scoreboards' => $allScoreboards]);
    }


    public function multiplayerScoreboard()
    {
        try {
            $topPlayers = User::withCount([
                'multiplayerGames as victories' => function ($query) {
                    $query->where('player_won', true);
                },
                'multiplayerGames as losses' => function ($query) {
                    $query->where('player_won', false);
                },
            ])
                ->orderByDesc('victories')
                ->limit(5)
                ->get(['id', 'nickname']);

            return response()->json(['player_stats' => $topPlayers]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred.', 'details' => $e->getMessage()], 500);
        }
    }

}
