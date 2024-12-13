<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MultiplayerGame extends Model
{
    use HasFactory;

    protected $table = 'multiplayer_games_played';

    public $timestamps = false;

    protected $fillable = [
        'user_id', 'game_id', 'player_won', 'pairs_discovered', 'custom',
    ];

    protected $casts = [
        'custom' => 'array',
    ];

    // Relacionamentos
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function game()
    {
        return $this->belongsTo(Game::class);
    }
}
