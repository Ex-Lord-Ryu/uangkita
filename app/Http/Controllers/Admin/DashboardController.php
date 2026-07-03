<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Aggregate-only statistics. No per-user transaction details are exposed.
     */
    public function index(): Response
    {
        $startOfMonth = today()->startOfMonth();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_users' => User::regular()->count(),
                'active_users' => User::regular()->has('transactions')->count(),
                'new_users_this_month' => User::regular()
                    ->where('created_at', '>=', $startOfMonth)
                    ->count(),
                'total_transactions' => Transaction::count(),
                'transactions_this_month' => Transaction::where('occurred_at', '>=', $startOfMonth->toDateString())->count(),
            ],
            'signups_trend' => $this->signupsTrend(),
            'activity_trend' => $this->activityTrend(),
        ]);
    }

    /**
     * New non-admin user sign-ups per month (last 6 months).
     *
     * @return array<int, array{month: string, users: int}>
     */
    private function signupsTrend(): array
    {
        $start = today()->startOfMonth()->subMonths(5);

        $counts = User::regular()
            ->where('created_at', '>=', $start)
            ->get(['created_at'])
            ->groupBy(fn (User $u) => $u->created_at->format('Y-m'))
            ->map->count();

        $months = [];
        for ($m = $start->copy(); $m->lte(today()); $m->addMonth()) {
            $ym = $m->format('Y-m');
            $months[] = ['month' => $m->isoFormat('MMM YY'), 'users' => (int) ($counts[$ym] ?? 0)];
        }

        return $months;
    }

    /**
     * Total transaction count per month across all users (last 6 months).
     *
     * @return array<int, array{month: string, transactions: int}>
     */
    private function activityTrend(): array
    {
        $start = today()->startOfMonth()->subMonths(5);

        $counts = Transaction::where('occurred_at', '>=', $start->toDateString())
            ->get(['occurred_at'])
            ->groupBy(fn (Transaction $t) => $t->occurred_at->format('Y-m'))
            ->map->count();

        $months = [];
        for ($m = $start->copy(); $m->lte(today()); $m->addMonth()) {
            $ym = $m->format('Y-m');
            $months[] = ['month' => $m->isoFormat('MMM YY'), 'transactions' => (int) ($counts[$ym] ?? 0)];
        }

        return $months;
    }
}
