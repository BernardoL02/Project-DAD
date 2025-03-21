<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Http\Requests\UserRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\UpdateUserRequest;
use App\Htpp\Request\ProfileUserResource;
use Illuminate\Validation\Rules\Password;
use App\Http\Requests\RegistrationRequest;
use App\Http\Resources\TransactionResource;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Resources\ProfileUserResource as ResourcesProfileUserResource;
use App\Models\Game;

class UserController extends Controller
{
    public function showMe(Request $request)
    {
        return new UserResource($request->user());
    }

    public function store(RegistrationRequest $request)
    {
        $validated = $request->validated();

        $user = User::create($validated);
        $user->brain_coins_balance = 0;
        $user->type = 'P';

        if ($request->hasFile('photo_filename')) {
            $path = $request->file('photo_filename')->store('photos', 'public');
            $user->photo_filename = basename($path);
        }

        $transaction = Transaction::create([
            'type' => 'B',
            'transaction_datetime' => now(),
            'user_id' => $user->id,
            'brain_coins' => 10,
            'custom' => json_encode([
                'notificationRead' => 1,
                'msg' => 'Welcome! You\'ve received 10 Brain Coins as a sign-up reward.'
            ]),
        ]);

        $user->brain_coins_balance += 10;
        $user->save();

        return new UserResource($user);
    }


    public function update(UpdateUserRequest $request)
    {
        $user = $request->user();

        $user->update($request->validated());

        if ($request->hasFile('photo_filename')) {
            $path = $request->file('photo_filename')->store('photos', 'public');
            $user->photo_filename = basename($path);
        }

        $user->save();

        return new UserResource($user);
    }


    public function updatePassword(Request $request)
    {
        $request->validate([
            'password' => 'required|min:3',
            'confirm_password' => 'required|min:3',
        ]);

        if ($request->password !== $request->confirm_password) {
            return response()->json(['message' => 'Passwords do not match!.'], 400);
        }

        $user = $request->user();

        if (Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'New password cannot be the same as the current password!'], 400);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully!',
            'title' => 'Success'
        ],200);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'password' => 'required'
        ]);

        $user = $request->user();

        if ($user->isAdmin()) {
            return response()->json(['message' => 'Administrators cannot delete their own accounts.'], 403);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password.'], 400);
        }

        $authController = new AuthController();
        $authController->logout($request);

        if ($user->transactions()->exists() || $user->games()->exists()) {
            $user->delete();
        } else {
            $user->forceDelete();
        }

        return response()->json([
            'message' => 'Your account was permanently deleted.'
        ], 200);
    }

     public function profileUser(Request $request, String $nickname){


        $user = User::where('nickname',$nickname)->first();

        if(!$user){
        return response()->json([
                    'message' => 'User not found.',
                ], 404);
        }

        return new ResourcesProfileUserResource($user);
     }

    public function getNotifications(Request $request)
    {
        $user = $request->user();

        $transactions = Transaction::where('user_id', $user->id)
            ->whereNotNull('custom')->orderBy('transaction_datetime', 'desc')
            ->get();

        $filteredTransactions = $transactions->filter(function ($transaction) {
            $customData = json_decode($transaction->custom, true);
            return isset($customData['notificationRead']) && $customData['notificationRead'] == 1;
        });

        return TransactionResource::collection($filteredTransactions);
    }

    public function deleteAllNotifications(Request $request)
    {
        $user = $request->user();

        $transactions = Transaction::where('user_id', $user->id)
            ->whereNotNull('custom')
            ->get();

        foreach ($transactions as $transaction) {
            $custom = json_decode($transaction->custom, true);

            $custom['notificationRead'] = $request->input('notificationRead') ? 1 : 0;

            $transaction->custom = json_encode($custom);

            $transaction->save();
        }

        return response()->json([
            'message' => 'All notifications updated successfully.',
            'updatedCount' => $transactions->count(),
        ], 200);
    }

    public function Statistics(Request $request)
    {
        $user = $request->user();

        $singlePlayerGames = $user->games()
            ->where('type', 'S')
            ->orderBy('began_at', 'desc')
            ->get();

        $multiPlayerGames = Game::with([
                'createdUser' => function ($query) {
                    $query->withTrashed();
                },
                'winnerUser' => function ($query) {
                    $query->withTrashed();
                },
                'multiplayerGamesPlayed' => function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                }
            ])
            ->withCount('multiplayerGamesPlayed')
            ->whereHas('multiplayerGamesPlayed', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->where('type', 'M')
            ->orderBy('id', 'desc')
            ->get();

        $multiPlayerGames->each(function ($game) use ($user) {
            $playerStats = $game->multiplayerGamesPlayed->firstWhere('user_id', $user->id);
            $game->pairs_discovered = $playerStats ? (int)$playerStats->pairs_discovered : 0;
        });

        $totalGamesByYearMonth = DB::table('games')
            ->selectRaw('YEAR(began_at) as year, MONTH(began_at) as month, COUNT(*) as total')
            ->where('status', 'E')
            ->where('created_user_id', $user->id)
            ->groupByRaw('YEAR(began_at), MONTH(began_at)')
            ->orderByRaw('YEAR(began_at), MONTH(began_at)')
            ->get();

        $transactions = DB::table('transactions')
            ->where('user_id', $user->id)
            ->get();

        $transactionsFormatted = $transactions->map(function ($transaction) {
            $transactionValue = $transaction->euros ?? 0;
            $pack = min((int) floor($transactionValue), 6);

            return [
                'id' => $transaction->id,
                'name' => $transaction->user_name ?? '-',
                'date' => $transaction->transaction_datetime,
                'type' => $transaction->type === 'P' ? 'Purchase' : 'Unknown',
                'value' => $transactionValue,
                'paymentMethod' => $transaction->payment_type ?? '-',
                'reference' => $transaction->payment_reference ?? '-',
                'coins' => $transaction->brain_coins,
                'pack' => $pack,
            ];
        });

        $transactionsGroupedByMonth = $transactionsFormatted->groupBy(function ($transaction) {
            return \Carbon\Carbon::parse($transaction['date'])->format('F Y');
        });

        $selectedYear = now()->year;
        $monthlyPurchaseCounts = [];
        foreach (range(1, 12) as $month) {
            $monthName = \Carbon\Carbon::createFromDate(null, $month, 1)->format('M');
            $monthlyPurchaseCounts[$monthName] = $transactionsFormatted
                ->filter(function ($transaction) use ($month, $selectedYear) {
                    $transactionDate = \Carbon\Carbon::parse($transaction['date']);
                    return $transaction['type'] === 'Purchase'
                        && $transactionDate->year === $selectedYear
                        && $transactionDate->month === $month;
                })
                ->count();
        }



        return response()->json([
            'totalSingle' => $singlePlayerGames,
            'totalMulty' => $multiPlayerGames,
            'totalGamesByYearMonth' => $totalGamesByYearMonth,
            'transactionsUser' => $transactionsFormatted,
            'transactionsGroupedByMonth' => $transactionsGroupedByMonth,
            'monthlyPurchaseCounts' => $monthlyPurchaseCounts

        ]);
    }
}

