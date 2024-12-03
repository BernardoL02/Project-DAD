<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Game;
use App\Models\User;
use Illuminate\Http\Request;

class ScoreBoardController extends Controller
{
    public function globalSinglePlayerScoreboard()
    {
        try {
            $boards = Board::all();

            $allScoreboards = [];

            foreach ($boards as $board) {

                $boardSize = "{$board->board_cols}x{$board->board_rows}";

                $scoreboards = Game::singlePlayer()
                    ->where('board_id', $board->id)
                    ->where('status', 'E')
                    ->with('creator:id,nickname')
                    ->get()
                    ->groupBy('created_user_id')
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

                $scoreboards = $scoreboards->map(function ($scoreboard, $index) {
                    $scoreboard['rank'] = $index + 1;
                    return $scoreboard;
                });
                $allScoreboards[$boardSize] = $scoreboards;
            }

            return response()->json(['scoreboards' => $allScoreboards]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred.', 'details' => $e->getMessage()], 500);
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
