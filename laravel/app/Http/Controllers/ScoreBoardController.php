<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Game;
use App\Models\Scoreboard;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ScoreBoardController extends Controller
{
    public function globalSinglePlayerScoreboard($boardSize)
    {
        // Define board dimensions
        $boardDimensions = [
            '3x4' => [3, 4],
            '4x4' => [4, 4],
            '6x6' => [6, 6],
        ];

        if (!isset($boardDimensions[$boardSize])) {
            return response()->json(['error' => 'Invalid board size'], 400);
        }

        [$cols, $rows] = $boardDimensions[$boardSize];

        // Use Eloquent models and relationships to query
        $scoreboards = Game::query()
            ->where('type', 'S')
            ->where('status', 'E')
            ->whereHas('board', function ($query) use ($cols, $rows) {
                $query->where('board_cols', $cols)
                    ->where('board_rows', $rows);
            })
            ->with(['user:id,nickname', 'board:board_cols,board_rows'])
            ->selectRaw('created_user_id, MIN(total_time) as best_time, MAX(status) as status') // Use MAX() to select a single status
            ->groupBy('created_user_id') // Only group by created_user_id
            ->orderBy('best_time', 'asc')
            ->limit(10)
            ->get()
            ->map(function ($game) {
                return [
                    'nickname' => $game->user->nickname,
                    'best_time' => $game->best_time,
                    'status' => $game->status,
                    'min_turns' => 'N/A',

                ];
            });

        return response()->json(['scoreboards' => $scoreboards]);
    }

        public function multiplayerScoreboard()
        {
            // Fetch the top players with most victories in multiplayer games
            $topPlayers = Game::select('winner_user_id', DB::raw('COUNT(winner_user_id) as victories'))
                ->where('type', 'M')  // Multiplayer games
                ->groupBy('winner_user_id')
                ->orderByDesc('victories')
                ->limit(5)
                ->get();

            $players = User::whereIn('id', $topPlayers->pluck('winner_user_id'))->get();

            return response()->json([
                'top_players' => $topPlayers,
                'players' => $players
            ]);
        }
}
