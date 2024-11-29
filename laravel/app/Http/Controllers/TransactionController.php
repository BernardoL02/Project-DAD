<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\TransactionRequest;
use App\Models\Transaction;
use App\Http\Resources\TransactionResource;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            $transactions = Transaction::with('user')->orderBy('transaction_datetime', 'desc')->get();
        } else {
            $transactions = $user->transactions()->with('user')->orderBy('transaction_datetime', 'desc')->get();
        }

        return TransactionResource::collection($transactions);
    }



    public function store(TransactionRequest $request)
    {
        $user = $request->user();

        $validated = $request->validated();

        $validated['user_id'] = $user->id;

        if ($validated['brain_coins'] < 0 && ($user->brain_coins_balance + $validated['brain_coins'] < 0)) {
            return response()->json([
                'message' => 'Insufficient balance to complete the transaction.',
            ], 400);
        }

        $transaction = Transaction::create([
            'type' => $validated['type'],
            'transaction_datetime' => now(),
            'user_id' => $validated['user_id'],
            'game_id' => $validated['game_id'] ?? null,
            'euros' => $validated['euros'] ?? null,
            'payment_type' => $validated['payment_type'] ?? null,
            'payment_reference' => $validated['payment_reference'] ?? null,
            'brain_coins' => $validated['brain_coins'],
        ]);

        $user->brain_coins_balance += $validated['brain_coins'];
        $user->save();

        return response()->json([
            'message' => 'Transaction created successfully.',
            'data' => $transaction,
            'current_balance' => $user->brain_coins_balance,
        ], 201);
    }


}

