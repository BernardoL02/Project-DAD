<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GameResource extends JsonResource
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
            ],

            'winner_user' => [
                'id' => $this->winnerUser?->id,
                'nickname' => $this->winnerUser?->nickname,
            ],
            'participants_count' => $this->participants_count,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => optional($this->user)->id,
                    'name' => optional($this->user)->name,
                    'email' => optional($this->user)->email,
                ];
            }),
            'total_turns_winner' => $this->total_turns_winner,
            'custom' => $this->custom,
        ];
    }
}
