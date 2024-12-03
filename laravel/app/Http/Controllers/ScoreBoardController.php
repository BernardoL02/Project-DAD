<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Game;
use App\Models\User;
use Illuminate\Http\Request;

class ScoreBoardController extends Controller
{
    public function globalSinglePlayerScoreboard($boardSize)
    {
        // Fetch board dimensions dynamically
        $board = Board::whereRaw("CONCAT(board_cols, 'x', board_rows) = ?", [$boardSize])->first();

        if (!$board) {
            return response()->json(['error' => 'Invalid board size'], 400);
        }

        try {
            // Fetch games with relationships
            $scoreboards = Game::singlePlayer()
                ->where('status', 'E')
                ->where('board_id', $board->id)
                ->with('creator:id,nickname')->get()->groupBy('created_user_id')
                ->map(function ($games) {
                    $bestGame = $games->sortBy('total_time')->first();

                    return [
                        'nickname' => $bestGame->creator->nickname ?? 'Unknown',
                        'best_time' => $bestGame->total_time,
                        'status' => $bestGame->status,
                        'min_turns' => $bestGame->total_turns_winner,
                    ];
                })
                ->sortBy('best_time')
                ->take(10)
                ->values();

            return response()->json(['scoreboards' => $scoreboards]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred.'], 500);
        }
    }

    public function multiplayerScoreboard()
    {
        try {
            $topPlayers = User::withCount([
                'wonGames as victories' => function ($query) {
                    $query->where('type', 'M');
                },
                'games as losses' => function ($query) {
                    $query->where('type', 'M')->whereNull('winner_user_id');
                },
            ])
                ->orderByDesc('victories')
                ->limit(5)
                ->get(['id', 'nickname']);

            return response()->json(['player_stats' => $topPlayers]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred.'], 500);
        }
    }
}
