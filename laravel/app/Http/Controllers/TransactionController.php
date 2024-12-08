<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\TransactionRequest;
use App\Models\Transaction;
use App\Http\Resources\TransactionResource;
use Illuminate\Support\Facades\Http;

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

        if ($validated['type'] === 'P') {
            $isValid = $this->validatePayment($validated['payment_reference'], $validated['euros'], $validated['payment_type']);
            if (!$isValid) {
                return response()->json([
                    'message' => 'Payment validation failed.',
                ], 400);
            }
        }

        if ($validated['brain_coins'] < 0 && ($user->brain_coins_balance + $validated['brain_coins'] < 0)) {
            return response()->json([
                'message' => 'Insufficient balance to complete the transaction.',
            ], 400);
        }

        $customData = ['notificationRead' => 1];
        if (!empty($request['msg'])) {
            $customData['msg'] = $request['msg'];
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
            'custom' => json_encode($customData),
        ]);

        $user->brain_coins_balance += $validated['brain_coins'];
        $user->save();

        return response()->json([
            'message' => 'Transaction created successfully.',
            'data' => $transaction,
            'current_balance' => $user->brain_coins_balance,
        ], 201);
    }

    private function validatePayment($reference, $value, $type)
    {
        $PAYMENT_GATEWAY_URL = 'https://dad-202425-payments-api.vercel.app/api/debit';
        $response = Http::post($PAYMENT_GATEWAY_URL, [
            'type' => $type,
            'reference' => $reference,
            'value' => $value,
        ]);

        return $response->status() === 201;
    }

    public function changeTransactionStatus(Request $request, Transaction $transaction)
    {
        $request->validate([
            'notificationRead' => 'required|boolean',
        ]);

        $custom = json_decode($transaction->custom, true);

        $custom['notificationRead'] = $request->input('notificationRead') ? 1 : 0;

        $transaction->custom = json_encode($custom);
        $transaction->save();

        return response()->json([
            'message' => 'Notification deleted successfully.',
        ]);
    }
}
