<?php

namespace App\Policies;

use App\Models\User;

class TransactionPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    public function viewAll(User $user)
    {
        return $user->isAdmin();
    }

    public function viewAny(User $user)
    {
        return $user->isPlayer();
    }

    public function create(User $user)
    {
        return $user->isPlayer();
    }

    public function update(User $user)
    {
        return $user->isPlayer();
    }

}
