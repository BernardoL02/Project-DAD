<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_user_id',
        'winner_user_id',
        'type',
        'status',
        'began_at',
        'ended_at',
        'total_time',
        'board_id',
        'total_turns_winner'
    ];

    protected $casts = [
        'custom' => 'array',
    ];

    // Relacionamentos
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_user_id');
    }

    public function winner()
    {
        return $this->belongsTo(User::class, 'winner_user_id');
    }

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function multiplayerGamesPlayed()
    {
        return $this->hasMany(MultiplayerGame::class, 'game_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_user_id', 'id');
    }

    public function createdUser()
    {
        return $this->belongsTo(User::class, 'created_user_id');
    }

    public function winnerUser()
    {
        return $this->belongsTo(User::class, 'winner_user_id');
    }

    public function player()
    {
        return $this->belongsTo(User::class, 'created_user_id');
    }
    public function scopeSinglePlayer($query)
    {
        return $query->where('type', 'S');
    }

    public function scopeWithBoardSize($query, $cols, $rows)
    {
        return $query->whereHas('board', function ($query) use ($cols, $rows) {
            $query->where('board_cols', $cols)->where('board_rows', $rows);
        });
    }
}
