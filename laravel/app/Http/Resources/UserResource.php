<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'nickname' => $this->nickname,
            'photo_filename' => $this->photo_filename ,
            'brain_coins_balance' => $this->brain_coins_balance,
            'type' => $this->type,
            'custom' => $this->custom,
        ];
    }
}
