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
        $boardDimensions = [
            '3x4' => [3, 4],
            '4x4' => [4, 4],
            '6x6' => [6, 6],
        ];

        if (!isset($boardDimensions[$boardSize])) {
            return response()->json(['error' => 'Invalid board size'], 400);
        }

        [$cols, $rows] = $boardDimensions[$boardSize];

        $scoreboards = DB::table('games')
            ->join('boards', 'boards.id', '=', 'games.board_id')
            ->join('users', 'users.id', '=', 'games.created_user_id') // Corrected column
            ->select(
                'games.created_user_id',
                'users.nickname',
                'boards.board_cols',
                'boards.board_rows',
                DB::raw('MIN(total_time) as best_time') // Removed `turns`
            )
            ->where('games.type', 'S') // Single-player games
            ->where('boards.board_cols', $cols)
            ->where('boards.board_rows', $rows)
            ->groupBy('games.created_user_id', 'boards.board_cols', 'boards.board_rows', 'users.nickname') // Group by the correct columns
            ->orderBy('best_time', 'asc') // Sort by best time
            ->limit(10)
            ->get();

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
