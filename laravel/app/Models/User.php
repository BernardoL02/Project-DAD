<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'email_verified_at',
        'nickname',
        'type', 'blocked', 'photo_filename', 'brain_coins_balance', 'custom', 'deleted_at', 'total_turns_winner'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin()
    {
        return $this->type === 'A'; // Verifica se o tipo é 'A' para administrador
    }

     // Relationships
     public function transactions()
     {
         return $this->hasMany(Transaction::class, 'user_id');
     }

     public function multiplayerGames()
     {
         return $this->hasMany(MultiplayerGame::class);
     }

     public function createdGames()
     {
         return $this->hasMany(Game::class, 'created_user_id');
     }

     public function wonGames()
     {
         return $this->hasMany(Game::class, 'winner_user_id');
     }

     public function games()
     {
         return $this->hasMany(Game::class, 'created_user_id', 'id');
     }

}
