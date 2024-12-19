<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Game;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Http\Resources\AdminResource;
use App\Http\Requests\RegistrationRequest;
use App\Http\Resources\TransactionResource;
use Illuminate\Support\Facades\DB;

class AdministratorController extends Controller
{
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    public function store(RegistrationRequest $request)
    {
        $validated = $request->validated();

        $admin = User::create($validated);
        $admin->brain_coins_balance = 0;
        $admin->type = 'A';
        if ($request->hasFile('photo_filename')) {
            $path = $request->file('photo_filename')->store('photos', 'public');
            $admin->photo_filename = basename($path);
        }
        $admin->save();

        return new AdminResource($admin);
    }

    public function blockUser(User $user)
    {
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->blocked = true;
        $user->save();

        return response()->json(['message' => 'User has been blocked.']);
    }

    public function unblockUser(User $user)
    {
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->blocked = false;
        $user->save();

        return response()->json(['message' => 'User has been unblocked.']);
    }

    public function destroy(User $user)
    {
        if (!$user) {
            return response()->json(['message' => 'Cannot delete this account.'], 403);
        }

        if ($user->isAdmin()) {
            return response()->json(['message' => 'Administrators cannot delete their own accounts.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Account deleted successfully.']);
    }

    public function viewTransactions(Request $request) {

        $selectedType = $request->input('selected_type');
        $selectedPaymentMethod = $request->input('selected_payment_method');

        $startDate = $request->input('date_range')[0] ?? null;
        $endDate = $request->input('date_range')[1] ?? null;

        $query = Transaction::with('user')->orderBy('transaction_datetime', 'desc');

        if ($selectedType != 'All') {
            $query->where('type', $selectedType);
        }

        if ($selectedPaymentMethod != 'All') {
            $query->where('payment_type', $selectedPaymentMethod);
        }

        if ($startDate && $endDate) {
            $query->whereBetween('transaction_datetime', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ]);
        }

        $transactions = $query->paginate(10);

        return [
            'data' => TransactionResource::collection($transactions)->response()->getData(true)['data'],
            'meta' => [
                'last_page' => $transactions->lastPage(),
            ],
        ];
    }



    public function viewTransactionsStatistics()
    {

        $totalPurchases = DB::table('transactions')
            ->where('type', 'P')
            ->count();

        $totalValuePurchases = DB::table('transactions')
            ->where('type', 'P')
            ->sum('euros');

        $numberOfPurchasesPerPack = DB::table('transactions')
        ->selectRaw(
            'CASE
                WHEN euros >= 1 AND euros < 2 THEN 1
                WHEN euros >= 2 AND euros < 3 THEN 2
                WHEN euros >= 3 AND euros < 4 THEN 3
                WHEN euros >= 4 AND euros < 5 THEN 4
                WHEN euros >= 5 AND euros < 6 THEN 5
                WHEN euros >= 6 THEN 6
                ELSE 0
            END as pack,
            COUNT(*) as total'
        )
        ->where('type', 'P')
        ->groupBy('pack')
        ->orderBy('pack')
        ->get();

        $numberOfPurchasesPerPaymentType = DB::table('transactions')
            ->selectRaw('payment_type, COUNT(*) as total')
            ->where('type', 'P')
            ->groupBy('payment_type')
            ->get();

        $totalPurchasesByMonth = DB::table('transactions')
            ->selectRaw('YEAR(transaction_datetime) as year, MONTH(transaction_datetime) as month, COUNT(*) as total')
            ->where('type', 'P')
            ->groupByRaw('YEAR(transaction_datetime), MONTH(transaction_datetime)')
            ->orderByRaw('YEAR(transaction_datetime), MONTH(transaction_datetime)')
            ->get();

        return [
            'totalPurchases' => $totalPurchases,
            'totalPurchaseValue' => $totalValuePurchases,
            'numberOfPurchasesPerPack' => $numberOfPurchasesPerPack,
            'numberOfPurchasesPerPaymentType' => $numberOfPurchasesPerPaymentType,
            'totalPurchasesByMonth' => $totalPurchasesByMonth
        ];
    }

}
