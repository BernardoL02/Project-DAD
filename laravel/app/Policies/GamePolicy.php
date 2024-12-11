<?php

namespace App\Policies;

use App\Models\Game;
use App\Models\User;

class GamePolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    public function viewAny(?User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(?User $user): bool
    {
        return $user->isPlayer();
    }

    public function create(?User $user): bool
    {
        return $user->isPlayer();
    }

    public function update(?User $user, Game $game): bool
    {
        return $user->isPlayer() && $user->id === $game->created_user_id;
    }

    public function show(?User $user, Game $game): bool
    {
        return $user->isPlayer() && $game->participants->contains('id', $user->id);
    }
}

