<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TransactionType;
use App\Http\Controllers\Controller;
use App\Models\SavingAccount;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserTransactionController extends Controller
{
    /**
     * List users and, when one is selected, their full transaction details.
     *
     * Access is gated by the `admin.viewtx` middleware.
     */
    public function index(Request $request): Response
    {
        $users = User::regular()
            ->withCount(['transactions', 'savingAccounts'])
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'created_at']);

        $selectedId = $request->query('user');
        $selected = null;
        $transactions = null;
        $savingAccounts = [];
        $summary = null;

        if ($selectedId) {
            $selected = User::regular()
                ->withCount(['transactions', 'savingAccounts'])
                ->findOrFail($selectedId);

            // Summary totals for the selected user (all-time).
            $allTx = Transaction::where('user_id', $selected->id)->get(['type', 'amount']);
            $totalIncome = (int) $allTx->filter(fn ($t) => $t->type === TransactionType::Income)->sum('amount');
            $totalExpense = (int) $allTx->filter(fn ($t) => $t->type === TransactionType::Expense)->sum('amount');
            $savingAccounts = SavingAccount::where('user_id', $selected->id)
                ->with(['savingTransactions' => fn ($query) => $query
                    ->latest('occurred_at')
                    ->latest('id')])
                ->orderBy('bank_name')
                ->orderBy('name')
                ->get();

            $summary = [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'balance' => $totalIncome - $totalExpense,
                'total_transactions' => $allTx->count(),
                'saving_balance' => (int) $savingAccounts->sum('stored_balance_amount'),
                'saving_interest' => (int) $savingAccounts->sum('estimated_interest_amount'),
                'saving_total' => (int) $savingAccounts->sum('estimated_balance_amount'),
                'saving_accounts_count' => $savingAccounts->count(),
                'saving_transactions_count' => (int) $savingAccounts->sum(
                    fn (SavingAccount $account): int => $account->savingTransactions->count(),
                ),
            ];

            $transactions = Transaction::where('user_id', $selected->id)
                ->with('category')
                ->latest('occurred_at')
                ->latest('id')
                ->paginate(20)
                ->withQueryString();
        }

        return Inertia::render('Admin/UserTransactions', [
            'users' => $users,
            'selectedUser' => $selected,
            'summary' => $summary,
            'transactions' => $transactions,
            'savingAccounts' => $savingAccounts,
        ]);
    }
}
