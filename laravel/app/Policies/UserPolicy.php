<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    public function viewAny(User $user)
    {
        return $user->isAdmin();
    }

    public function create(User $user)
    {
        return $user->isAdmin();
    }

    public function block(User $user, User $targetUser)
    {
        return $user->isAdmin() && $user->id !== $targetUser->id;
    }

    public function unblock(User $user, User $targetUser)
    {
        return $user->isAdmin() && $user->id !== $targetUser->id;
    }

    public function delete(User $user, User $targetUser)
    {
        return $user->isAdmin() && $user->id !== $targetUser->id;
    }

    public function deleteMyAccount(User $user)
    {
        return $user->isPlayer();
    }
}
