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
        $transactions = $user->transactions()->orderBy('transaction_datetime', 'desc')->get();

        // Usar recurso para formatar a resposta
        return TransactionResource::collection($transactions);
    }
    

    public function store(TransactionRequest $request)
    {
        // Pegue o usuário autenticado a partir do token
        $user = $request->user();
    
        // Validação dos dados da requisição
        $validated = $request->validated();
    
        // Substitua o `user_id` pelo ID do usuário autenticado
        $validated['user_id'] = $user->id;
    
        // Verifique se há saldo suficiente para transações negativas
        if ($validated['brain_coins'] < 0 && ($user->brain_coins_balance + $validated['brain_coins'] < 0)) {
            return response()->json([
                'message' => 'Insufficient balance to complete the transaction.',
            ], 400);
        }
    
        // Criação da transação
        $transaction = Transaction::create([
            'type' => $validated['type'],
            'transaction_datetime' => now(), // Insere automaticamente a data/hora atual
            'user_id' => $validated['user_id'], // ID do usuário autenticado
            'game_id' => $validated['game_id'] ?? null,
            'euros' => $validated['euros'] ?? null,
            'payment_type' => $validated['payment_type'] ?? null,
            'payment_reference' => $validated['payment_reference'] ?? null,
            'brain_coins' => $validated['brain_coins'], // Valor dos brain coins
        ]);
    
        // Atualize o saldo do usuário
        $user->brain_coins_balance += $validated['brain_coins'];
        $user->save();
    
        // Retorna a transação criada com o saldo atualizado
        return response()->json([
            'message' => 'Transaction created successfully.',
            'data' => $transaction,
            'current_balance' => $user->brain_coins_balance, // Mostra o saldo atualizado
        ], 201);
    }
    

}

