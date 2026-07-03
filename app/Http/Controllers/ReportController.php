<?php

namespace App\Http\Controllers;

use App\Enums\TransactionType;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Financial report for a chosen month, with charts and category table.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $month = $request->query('month', today()->format('Y-m'));
        $anchor = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $start = $anchor->copy()->startOfMonth();
        $end = $anchor->copy()->endOfMonth();

        $transactions = Transaction::where('user_id', $user->id)
            ->whereBetween('occurred_at', [$start, $end])
            ->with('category')
            ->get();

        $income = (int) $transactions->where('type', TransactionType::Income)->sum('amount');
        $expense = (int) $transactions->where('type', TransactionType::Expense)->sum('amount');

        return Inertia::render('Reports/Index', [
            'month' => $month,
            'summary' => [
                'income' => $income,
                'expense' => $expense,
                'balance' => $income - $expense,
                'transaction_count' => $transactions->count(),
                'avg_per_day' => $expense > 0 ? (int) round($expense / $end->day) : 0,
            ],
            'expense_by_category' => $this->byCategory($transactions, TransactionType::Expense),
            'income_by_category' => $this->byCategory($transactions, TransactionType::Income),
            'monthly_comparison' => $this->monthlyComparison($user->id, $anchor),
        ]);
    }

    /**
     * @param  Collection<int, Transaction>  $transactions
     * @return array<int, array{name: string, value: int, color: string, count: int}>
     */
    private function byCategory($transactions, TransactionType $type): array
    {
        return $transactions
            ->where('type', $type)
            ->groupBy(fn (Transaction $t) => $t->category?->name ?? 'Tanpa Kategori')
            ->map(fn ($group) => [
                'name' => $group->first()->category?->name ?? 'Tanpa Kategori',
                'value' => (int) $group->sum('amount'),
                'color' => $group->first()->category?->color ?? '#9ca3af',
                'count' => $group->count(),
            ])
            ->sortByDesc('value')
            ->values()
            ->all();
    }

    /**
     * Income vs expense per month for the 6 months ending at the anchor month.
     *
     * @return array<int, array{month: string, income: int, expense: int}>
     */
    private function monthlyComparison(int $userId, Carbon $anchor): array
    {
        $start = $anchor->copy()->subMonths(5)->startOfMonth();
        $end = $anchor->copy()->endOfMonth();

        $rows = Transaction::where('user_id', $userId)
            ->whereBetween('occurred_at', [$start, $end])
            ->get(['occurred_at', 'type', 'amount']);

        $months = [];
        for ($m = $start->copy(); $m->lte($end); $m->addMonth()) {
            $months[$m->format('Y-m')] = ['month' => $m->isoFormat('MMM YY'), 'income' => 0, 'expense' => 0];
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
