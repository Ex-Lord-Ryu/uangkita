<?php

namespace App\Http\Controllers;

use App\Enums\SavingInterestPeriod;
use App\Enums\SavingTransactionType;
use App\Http\Requests\StoreSavingAccountRequest;
use App\Http\Requests\StoreSavingTransactionRequest;
use App\Models\SavingAccount;
use App\Models\SavingTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SavingAccountController extends Controller
{
    /**
     * Display the authenticated user's saving accounts.
     */
    public function index(Request $request): Response
    {
        $savingAccounts = SavingAccount::where('user_id', $request->user()->id)
            ->with(['savingTransactions' => fn ($query) => $query
                ->latest('occurred_at')
                ->latest('id')])
            ->orderBy('bank_name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Savings/Index', [
            'saving_accounts' => $savingAccounts,
            'summary' => [
                'principal' => (int) $savingAccounts->sum('stored_balance_amount'),
                'interest' => (int) $savingAccounts->sum('estimated_interest_amount'),
                'total' => (int) $savingAccounts->sum('estimated_balance_amount'),
                'account_count' => $savingAccounts->count(),
            ],
            'interest_periods' => collect(SavingInterestPeriod::cases())
                ->map(fn (SavingInterestPeriod $period) => [
                    'value' => $period->value,
                    'label' => $period->label(),
                ])
                ->values(),
            'transaction_types' => collect(SavingTransactionType::cases())
                ->map(fn (SavingTransactionType $type) => [
                    'value' => $type->value,
                    'label' => $type->label(),
                ])
                ->values(),
            'today' => today()->toDateString(),
        ]);
    }

    public function store(StoreSavingAccountRequest $request): RedirectResponse
    {
        $request->user()->savingAccounts()->create($this->validatedData($request));

        return redirect()->route('savings.index')
            ->with('success', 'Tabungan berhasil ditambahkan.');
    }

    public function update(StoreSavingAccountRequest $request, SavingAccount $savingAccount): RedirectResponse
    {
        $this->authorizeOwner($request, $savingAccount);

        $savingAccount->update($this->validatedData($request));

        return redirect()->route('savings.index')
            ->with('success', 'Tabungan berhasil diperbarui.');
    }

    public function destroy(Request $request, SavingAccount $savingAccount): RedirectResponse
    {
        $this->authorizeOwner($request, $savingAccount);

        $savingAccount->delete();

        return redirect()->route('savings.index')
            ->with('success', 'Tabungan berhasil dihapus.');
    }

    public function storeTransaction(
        StoreSavingTransactionRequest $request,
        SavingAccount $savingAccount
    ): RedirectResponse {
        $this->authorizeOwner($request, $savingAccount);

        $validated = $request->validated();
        $type = SavingTransactionType::from($validated['type']);

        if (
            $type === SavingTransactionType::Withdrawal
            && (int) $validated['amount'] > $savingAccount->stored_balance_amount
        ) {
            return back()
                ->withErrors(['amount' => 'Jumlah penarikan melebihi saldo tabungan.'])
                ->withInput();
        }

        $savingAccount->savingTransactions()->create($validated);

        return redirect()->route('savings.index')
            ->with('success', 'Mutasi tabungan berhasil dicatat.');
    }

    public function destroyTransaction(
        Request $request,
        SavingAccount $savingAccount,
        SavingTransaction $savingTransaction
    ): RedirectResponse {
        $this->authorizeOwner($request, $savingAccount);

        if ($savingTransaction->saving_account_id !== $savingAccount->id) {
            abort(404);
        }

        $savingTransaction->delete();

        return redirect()->route('savings.index')
            ->with('success', 'Mutasi tabungan berhasil dihapus.');
    }

    /**
     * @return array{bank_name: string, name: string, principal_amount: int, has_interest: bool, annual_interest_rate: float|null, interest_period: string, interest_started_at: string|null}
     */
    private function validatedData(StoreSavingAccountRequest $request): array
    {
        $validated = $request->validated();
        $hasInterest = (bool) $validated['has_interest'];
        $name = trim((string) ($validated['name'] ?? ''));
        $bankName = (string) $validated['bank_name'];

        return [
            'bank_name' => $bankName,
            'name' => $name !== '' ? $name : "Tabungan {$bankName}",
            'principal_amount' => (int) $validated['principal_amount'],
            'has_interest' => $hasInterest,
            'annual_interest_rate' => $hasInterest ? (float) ($validated['annual_interest_rate'] ?? 0) : null,
            'interest_period' => $hasInterest
                ? (string) ($validated['interest_period'] ?? SavingInterestPeriod::Monthly->value)
                : SavingInterestPeriod::Monthly->value,
            'interest_started_at' => $hasInterest ? $validated['interest_started_at'] ?? null : null,
        ];
    }

    /**
     * Ensure the saving account belongs to the current user.
     */
    private function authorizeOwner(Request $request, SavingAccount $savingAccount): void
    {
        if ($savingAccount->user_id !== $request->user()->id) {
            abort(403);
        }
    }
}
