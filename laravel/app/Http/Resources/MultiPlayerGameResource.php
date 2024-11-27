<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MultiPlayerGameResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'status' => $this->status,
            'began_at' => $this->began_at,
            'ended_at' => $this->ended_at,
            'total_time' => $this->total_time,
            'board_id' => $this->board_id,
            'participants_count' => $this->multiplayer_games_played_count,
            'created_user' => [
                'id' => $this->createdUser->id,
                'nickname' => $this->createdUser->nickname,
            ],

            'winner_user' => [
                'id' => $this->winnerUser->id,
                'nickname' => $this->winnerUser->nickname,
            ],
            'pairs_discovered' => $this->multiplayerGamesPlayed->first()->pairs_discovered ?? 0,
        ];
    }
}
