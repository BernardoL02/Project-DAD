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
            'created_user' => new UserResource($this->whenLoaded('createdUser')),
            'winner_user' => new UserResource($this->whenLoaded('winnerUser')),
            'participants_count' => $this->participants_count,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
            'turns' => $customData['turns'] ?? null,
        ];
    }
}
