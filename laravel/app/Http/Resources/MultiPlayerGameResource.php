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
        $customData = json_decode($this->custom, true);

        $participants = $this->whenLoaded('multiplayerGamesPlayed', function () {
            return $this->multiplayerGamesPlayed->map(function ($player) {
                return [
                    'user_id' => $player->user_id,
                    'name' => $player->user->name,
                    'player_name' => $player->user->nickname,
                    'player_won' => $player->player_won ? 'Yes' : 'No',
                    'pairs_discovered' => $player->pairs_discovered,
                    'photo_filename' =>$player->user->photo_filename,
                ];
            });
        });

        return [
            'id' => $this->id,
            'created_user_id' => $this->created_user_id,
            'winner_user_id' => $this->winner_user_id,
            'type' => $this->type,
            'status' => $this->status,
            'began_at' => $this->began_at,
            'ended_at' => $this->ended_at,
            'total_time' => $this->total_time,
            'board_id' => $this->board_id,
            'created_user' => [
                'id' => $this->createdUser?->id,
                'nickname' => $this->createdUser?->nickname,
                'photo_filename' => $this->createdUser?->photo_filename,
            ],
            'winner_user' => [
                'id' => $this->winnerUser?->id,
                'nickname' => $this->winnerUser?->nickname,
                'photo_filename' => $this->winnerUser?->photo_filename,
            ],
            'participants_count' => count( $participants),
            'participants' => $participants,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => optional($this->user)->id,
                    'name' => optional($this->user)->name,
                    'email' => optional($this->user)->email,
                ];
            }),
            'total_turns_winner' => $this->total_turns_winner,
            'custom' => $customData,
        ];
    }
}
