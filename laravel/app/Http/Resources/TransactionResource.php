<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'transaction_datetime' => $this->transaction_datetime,
            'game_id' => $this->game_id,
            'euros' => $this->euros,
            'payment_type' => $this->payment_type,
            'payment_reference' => $this->payment_reference,
            'brain_coins' => $this->brain_coins,
        ];
    }
}
