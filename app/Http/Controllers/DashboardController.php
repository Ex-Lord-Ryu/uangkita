<?php

namespace App\Http\Controllers;

use App\Enums\TransactionType;
use App\Models\SavingAccount;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the authenticated user's financial dashboard.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        $startOfMonth = today()->startOfMonth();
        $endOfMonth = today()->endOfMonth();

        $monthTx = Transaction::where('user_id', $user->id)
            ->whereBetween('occurred_at', [$startOfMonth, $endOfMonth])
            ->with('category')
            ->get();

        $income = (int) $monthTx->where('type', TransactionType::Income)->sum('amount');
        $expense = (int) $monthTx->where('type', TransactionType::Expense)->sum('amount');
        $savingAccounts = SavingAccount::where('user_id', $user->id)
            ->with('savingTransactions')
            ->get();

        return Inertia::render('Dashboard', [
            'summary' => [
                'income' => $income,
                'expense' => $expense,
                'balance' => $income - $expense,
                'savings' => (int) $savingAccounts->sum('estimated_balance_amount'),
                'transaction_count' => $monthTx->count(),
            ],
            'daily_trend' => $this->dailyTrend($user->id, $startOfMonth, $endOfMonth),
            'category_breakdown' => $this->categoryBreakdown($monthTx),
            'monthly_comparison' => $this->monthlyComparison($user->id),
            'recent' => Transaction::where('user_id', $user->id)
                ->with('category')
                ->latest('occurred_at')
                ->latest('id')
                ->take(8)
                ->get(),
        ]);
    }

    /**
     * Daily income vs expense totals for the given month.
     *
     * @return array<int, array{date: string, income: int, expense: int}>
     */
    private function dailyTrend(int $userId, Carbon $start, Carbon $end): array
    {
        $rows = Transaction::where('user_id', $userId)
            ->whereBetween('occurred_at', [$start, $end])
            ->selectRaw('occurred_at, type, SUM(amount) as total')
            ->groupBy('occurred_at', 'type')
            ->get();

        $days = [];
        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $key = $d->toDateString();
            $days[$key] = ['date' => $key, 'income' => 0, 'expense' => 0];
        }

        foreach ($rows as $row) {
            $key = Carbon::parse($row->occurred_at)->toDateString();
            if (isset($days[$key])) {
                $days[$key][$row->type->value] = (int) $row->total;
            }
        }

        return array_values($days);
    }

    /**
     * Expense totals grouped by category name.
     *
     * @param  Collection<int, Transaction>  $transactions
     * @return array<int, array{name: string, value: int, color: string}>
     */
    private function categoryBreakdown($transactions): array
    {
        return $transactions
            ->where('type', TransactionType::Expense)
            ->groupBy(fn (Transaction $t) => $t->category?->name ?? 'Tanpa Kategori')
            ->map(fn ($group) => [
                'name' => $group->first()->category?->name ?? 'Tanpa Kategori',
                'value' => (int) $group->sum('amount'),
                'color' => $group->first()->category?->color ?? '#9ca3af',
            ])
            ->sortByDesc('value')
            ->values()
            ->all();
    }

    /**
     * Income vs expense per month for the last 6 months.
     *
     * @return array<int, array{month: string, income: int, expense: int}>
     */
    private function monthlyComparison(int $userId): array
    {
        $start = today()->startOfMonth()->subMonths(5);

        $rows = Transaction::where('user_id', $userId)
            ->where('occurred_at', '>=', $start->toDateString())
            ->get(['occurred_at', 'type', 'amount']);

        $months = [];
        for ($m = $start->copy(); $m->lte(today()); $m->addMonth()) {
            $months[$m->format('Y-m')] = [
                'month' => $m->isoFormat('MMM YY'),
                'income' => 0,
                'expense' => 0,
            ];
        }

        foreach ($rows as $row) {
            $ym = $row->occurred_at->format('Y-m');
            if (isset($months[$ym])) {
                $months[$ym][$row->type->value] += (int) $row->amount;
            }
        }

        return array_values($months);
    }
}
