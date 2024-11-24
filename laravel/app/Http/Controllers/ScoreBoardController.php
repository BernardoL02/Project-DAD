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

        // Query using relationships
        $scoreboards = Game::where('type', 'S')
            ->where('status', 'E') // Completed games
            ->whereHas('board', function ($query) use ($cols, $rows) {
                $query->where('board_cols', $cols)->where('board_rows', $rows);
            })
            ->with('creator:id,nickname') // Load the creator's nickname
            ->select('created_user_id', DB::raw('MIN(total_time) as best_time'), DB::raw('MAX(status) as status'))
            ->groupBy('created_user_id')
            ->orderBy('best_time', 'asc')
            ->limit(100)
            ->get()
            ->map(function ($game) {
                return [
                    'nickname' => $game->creator->nickname,
                    'best_time' => $game->best_time,
                    'status' => $game->status,
                    'min_turns' => 'N/A',
                ];
            });

        return response()->json(['scoreboards' => $scoreboards]);
    }

    public function multiplayerScoreboard()
    {
        // Fetch players with the most victories and their losses
        $topPlayers = User::withCount([
            'wonGames as victories' => function ($query) {
                $query->where('type', 'M');
            },
            'games as losses' => function ($query) {
                $query->where('type', 'M')->whereNull('winner_user_id');
            },
        ])
            ->orderByDesc('victories')
            ->limit(100)
            ->get(['id', 'nickname', 'victories', 'losses']);

        return response()->json(['player_stats' => $topPlayers]);
    }
}
