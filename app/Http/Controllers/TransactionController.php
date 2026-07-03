<?php

namespace App\Http\Controllers;

use App\Enums\TransactionType;
use App\Http\Requests\QuickStoreTransactionRequest;
use App\Http\Requests\StoreTransactionRequest;
use App\Models\Category;
use App\Models\Transaction;
use App\Services\ReceiptOcrService;
use App\Services\TextExpenseParser;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function __construct(private TextExpenseParser $parser) {}

    /**
     * Display transactions grouped by date for the selected period.
     */
    public function index(Request $request): Response
    {
        $period = $request->query('period', 'month');
        $date = Carbon::parse($request->query('date', today()->toDateString()));

        [$start, $end] = match ($period) {
            'day' => [$date->copy()->startOfDay(), $date->copy()->endOfDay()],
            'week' => [$date->copy()->startOfWeek(Carbon::MONDAY), $date->copy()->endOfWeek(Carbon::SUNDAY)],
            default => [$date->copy()->startOfMonth(), $date->copy()->endOfMonth()],
        };

        $userId = $request->user()->id;

        // Load all period transactions in-memory for totals + breakdown (portable).
        $allTx = Transaction::where('user_id', $userId)
            ->whereBetween('occurred_at', [$start, $end])
            ->with('category')
            ->get();

        $totalIncome = (int) $allTx->filter(fn ($t) => $t->type === TransactionType::Income)->sum('amount');
        $totalExpense = (int) $allTx->filter(fn ($t) => $t->type === TransactionType::Expense)->sum('amount');

        $categoryBreakdown = $allTx
            ->filter(fn (Transaction $t) => $t->type === TransactionType::Expense)
            ->groupBy(fn (Transaction $t) => $t->category?->name ?? 'Tanpa Kategori')
            ->map(fn ($group) => (int) $group->sum('amount'))
            ->sortDesc();

        // Separate paginated query for the list (15 per page).
        $transactions = Transaction::where('user_id', $userId)
            ->whereBetween('occurred_at', [$start, $end])
            ->with('category')
            ->orderBy('occurred_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'summary' => [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'balance' => $totalIncome - $totalExpense,
            ],
            'category_breakdown' => $categoryBreakdown,
            'categories' => Category::forUser($request->user())->orderBy('type')->orderBy('name')->get(),
            'period' => [
                'type' => $period,
                'date' => $date->toDateString(),
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
        ]);
    }

    /**
     * Store a manually entered transaction.
     */
    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        $request->user()->transactions()->create([
            ...$request->validated(),
            'source' => 'manual',
            'occurred_at' => $request->validated()['occurred_at'],
        ]);

        return redirect()->route('transactions.index')
            ->with('success', 'Transaksi berhasil ditambahkan.');
    }

    /**
     * Quick-add a transaction from free-text input.
     */
    public function quickStore(QuickStoreTransactionRequest $request): RedirectResponse
    {
        $parsed = $this->parser->parse($request->validated()['raw_input'], $request->user());

        $request->user()->transactions()->create([
            'type' => $parsed['type'],
            'description' => $parsed['description'],
            'amount' => $parsed['amount'],
            'category_id' => $parsed['category_id'],
            'occurred_at' => today(),
            'source' => 'text',
            'raw_input' => $parsed['raw_input'],
        ]);

        return redirect()->route('transactions.index')
            ->with('success', sprintf(
                'Transaksi "%s" %s Rp%s berhasil dicatat.',
                $parsed['description'],
                $parsed['type']->label(),
                number_format($parsed['amount'], 0, ',', '.'),
            ));
    }

    /**
     * Accept OCR-extracted text from client-side tesseract.js,
     * parse it into line items, and redirect to the review page.
     */
    public function ocrScan(Request $request, ReceiptOcrService $ocr): RedirectResponse
    {
        if (! $ocr->isEnabled()) {
            return back()->with('error', 'Fitur scan struk sedang dinonaktifkan.');
        }

        $request->validate([
            'raw_tsv' => ['nullable', 'string', 'max:500000'],
            'raw_text' => ['required_without:raw_tsv', 'string', 'min:5', 'max:50000'],
        ]);

        $result = $request->filled('raw_tsv')
            ? $ocr->extractResultFromTsv($request->input('raw_tsv'), $request->user())
            : $ocr->extractResult($request->input('raw_text'), $request->user());

        $request->session()->put('ocr_draft', $result);

        return redirect()->route('transactions.ocr-review');
    }

    /**
     * Show the OCR draft review page.
     */
    public function ocrReview(Request $request): Response|RedirectResponse
    {
        $draft = $request->session()->get('ocr_draft');

        if (! $draft) {
            return redirect()->route('transactions.index');
        }

        $categories = Category::forUser($request->user())->orderBy('type')->orderBy('name')->get();

        return Inertia::render('Transactions/OcrReview', [
            'draft' => $draft,
            'categories' => $categories,
            'today' => today()->toDateString(),
        ]);
    }

    /**
     * Store multiple OCR-sourced transactions in one request.
     */
    public function storeOcrItems(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string', 'max:255'],
            'items.*.amount' => ['required', 'integer', 'min:1'],
            'items.*.category_id' => [
                'nullable',
                Rule::exists('categories', 'id')
                    ->where('user_id', $request->user()->id),
            ],
            'type' => ['required', 'in:income,expense'],
            'occurred_at' => ['required', 'date'],
        ]);

        $rawInput = $request->session()->pull('ocr_draft.raw_input', '');

        foreach ($validated['items'] as $item) {
            $request->user()->transactions()->create([
                'type' => $validated['type'],
                'description' => $item['description'],
                'amount' => $item['amount'],
                'category_id' => $item['category_id'] ?? null,
                'occurred_at' => $validated['occurred_at'],
                'source' => 'ocr',
                'raw_input' => $rawInput,
            ]);
        }

        $count = count($validated['items']);

        return redirect()->route('transactions.index')
            ->with('success', "{$count} transaksi dari struk berhasil disimpan.");
    }

    /**
     * Update a transaction.
     */
    public function update(StoreTransactionRequest $request, Transaction $transaction): RedirectResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $transaction->update($request->validated());

        return redirect()->route('transactions.index')
            ->with('success', 'Transaksi berhasil diperbarui.');
    }

    /**
     * Delete a transaction.
     */
    public function destroy(Request $request, Transaction $transaction): RedirectResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $transaction->delete();

        return redirect()->route('transactions.index')
            ->with('success', 'Transaksi berhasil dihapus.');
    }
}
