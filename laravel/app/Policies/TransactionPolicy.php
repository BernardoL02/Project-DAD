<?php

namespace App\Policies;

use App\Models\Transaction;
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

    public function update(User $user, Transaction $transaction)
    {
        return $user->isPlayer() && $transaction->user_id == $user->id;
    }

}
