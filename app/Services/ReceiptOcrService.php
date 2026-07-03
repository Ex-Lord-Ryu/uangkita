<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Models\AppSetting;
use App\Models\User;
use Illuminate\Support\Str;

class ReceiptOcrService
{
    public function __construct(private CategoryGuesser $categoryGuesser) {}

    /**
     * Whether OCR is enabled in admin settings.
     */
    public function isEnabled(): bool
    {
        return AppSetting::bool('ocr_enabled', true);
    }

    /**
     * Parse TSV output from browser-side tesseract.js into line items + total.
     *
     * TSV contains word-level bounding boxes (level=5 rows). Words are grouped
     * by (block, paragraph, line) and sorted by x-position, producing clean
     * "word word word" lines — identical to binary Tesseract --tsv reconstruction.
     *
     * @return array{raw_input: string, items: array<int, array{description: string, amount: int, category_id: int|null}>, total: int}
     */
    public function extractResultFromTsv(string $tsv, User $user): array
    {
        return $this->extractResult($this->reconstructTextFromTsv($tsv), $user);
    }

    /**
     * Reconstruct clean plain-text from a tesseract TSV string.
     *
     * Each level-5 row is a word with left/top coordinates. Grouping by
     * (block_num, par_num, line_num) and sorting by `left` eliminates the
     * wide column-gap whitespace that plagues raw OCR text output.
     */
    private function reconstructTextFromTsv(string $tsv): string
    {
        $rows = explode("\n", trim($tsv));
        array_shift($rows); // Remove header row.

        /** @var array<string, array{top: int, words: list<array{left: int, text: string}>}> $groups */
        $groups = [];

        foreach ($rows as $row) {
            $cols = explode("\t", $row);

            if (count($cols) < 12) {
                continue;
            }

            [, , $blockNum, $parNum, $lineNum, , $left, $top, , , $conf, $text] = $cols;

            if ((int) $cols[0] !== 5) {
                continue; // Word-level rows only.
            }

            if ((float) $conf < 30 || trim($text) === '') {
                continue; // Skip garbage / whitespace words.
            }

            $key = "{$blockNum}_{$parNum}_{$lineNum}";

            if (! isset($groups[$key])) {
                $groups[$key] = ['top' => (int) $top, 'words' => []];
            }

            $groups[$key]['words'][] = ['left' => (int) $left, 'text' => trim($text)];
        }

        // Sort lines top-to-bottom (reading order).
        usort($groups, fn (array $a, array $b): int => $a['top'] - $b['top']);

        $lines = [];

        foreach ($groups as $group) {
            usort($group['words'], fn (array $a, array $b): int => $a['left'] - $b['left']);
            $lines[] = implode(' ', array_column($group['words'], 'text'));
        }

        return implode("\n", $lines);
    }

    /**
     * Parse raw text extracted by browser-side tesseract.js into line items + total.
     *
     * @return array{raw_input: string, items: array<int, array{description: string, amount: int, category_id: int|null}>, total: int}
     */
    public function extractResult(string $text, User $user): array
    {
        $total = $this->extractTotal($text);
        $items = $this->extractLineItems($text, $user);

        // If no line items detected, fall back to a single item using merchant name + total.
        if (empty($items)) {
            $description = $this->extractMerchant($text);
            $category = $this->categoryGuesser->guess($description, TransactionType::Expense, $user);
            $items = [[
                'description' => $description,
                'amount' => $total,
                'category_id' => $category?->id,
            ]];
        }

        return [
            'raw_input' => trim($text),
            'items' => $items,
            'total' => $total,
        ];
    }

    /**
     * Extract individual line items from a receipt.
     * Each item has: description, amount (unit or line total), category_id.
     *
     * Supports common thermal-printer / digital receipt formats found in
     * Indonesian retail, F&B, and marketplace receipts:
     *   - Single-line       : "Roti Tawar  12.000"
     *   - Double-line       : "Nasi Ayam Geprek" then "1X 12.000 Rp 12.000"
     *   - Qty-unit markers  : "2 pcs", "3 buah", "1 porsi", "2 @ 5.000"
     *   - Barcode-prefixed  : "8991234567890 Indomie Goreng 3.500"
     *
     * Lines representing tax, service charge, discounts, payment method,
     * store metadata (address/phone/kasir/no meja), and machine-readable
     * IDs (barcodes, phone numbers, ref/approval codes) are excluded so
     * they never get mistaken for a purchased item.
     *
     * @return array<int, array{description: string, amount: int, category_id: int|null}>
     */
    private function extractLineItems(string $text, User $user): array
    {
        $lines = preg_split('/\r\n|\r|\n/', $text) ?: [];

        // Keywords that must end on a word boundary (avoid matching "total" in mid-word).
        $skipWords = '/^\s*(?:'
            .'no\.?|nota|struk|receipt|invoice|faktur|'
            .'tanggal|tgl\.?|jam|waktu|'
            .'kepada|pembeli|customer|cust\.?|member|'
            .'nama\s*barang|nama\s*produk|deskripsi|'
            .'qty|jumlah\s*barang|jumlah\s*item|banyak|'
            .'harga|satuan|harga\s*satuan|'
            .'sub\s*total|subtotal|'
            .'total\s*(?:item|qty|barang|jenis)|'
            .'grand\s*total|total\s*belanja|total\s*tagihan|total|'
            .'ppn|pb1|pph\d*|pajak|service\s*charge|svc\.?|biaya(?:\s*(?:layanan|admin|service))?|'
            .'ongkir|ongkos\s*kirim|biaya\s*kirim|'
            .'diskon|disc\.?|potongan|promo|voucher|e-?voucher|cashback|cash\s*back|'
            .'poin|point|reward|loyalty|'
            .'dp|uang\s*muka|sisa\s*(?:bayar|tagihan)?|'
            .'pembayaran|bayar|tunai|cash|debit|kredit|kartu|edc|qris|transfer|e-?wallet|'
            .'kembalian|kembali|'
            .'kasir|operator|karyawan|pelayan|'
            .'terima\s*kasih|selamat\s*(?:datang|belanja)|'
            .'tanda\s*terima|bon|npwp|'
            .'alamat|jl\.?|jalan|telp\.?|telepon|fax|'
            .'cabang|outlet|meja|no\.?\s*meja|no\.?\s*ref\.?|'
            .'kode(?:\s*(?:promo|transaksi|voucher))?|id\s*trans(?:aksi)?|no\.?\s*trans(?:aksi)?|'
            .'approval|auth\s*code|batch|trace|ref\.?\s*no|'
            .'saldo|deposit'
            .')\b/iu';

        // Prefix-only keywords — OCR sometimes merges them (e.g. "KritikeSaran:", "LinkQR:").
        $skipPrefix = '/^\s*(?:link|kritik|saran|sms|hubungi|website|email|instagram|ig\s*:|facebook|fb\s*:)/iu';

        $items = [];
        $pendingName = null; // Item name buffered from the previous line (double-line format).

        foreach ($lines as $line) {
            $line = trim($line);

            if (mb_strlen($line) < 3) {
                $pendingName = null;

                continue;
            }

            // Skip timestamp lines: "2022-04-14 …", "19-05-2017 …", or "14:24:34 …"
            if (preg_match('/^\d{4}[-\/]\d{2}[-\/]\d{2}|\d{2}[-\/]\d{2}[-\/]\d{4}|\d{2}:\d{2}:\d{2}/', $line)) {
                continue;
            }

            // Skip tax-ID lines: NPWP / OCR misreads (NPYP, NPRP …) — "NP** : …"
            if (preg_match('/^\s*np[a-z]{2}\s*:/iu', $line)) {
                continue;
            }

            // Skip URL-like lines: "olshopin.com/…", "https://…"
            if (preg_match('/https?:\/\/|www\.|\.com\b|\.id\b|\.net\b/i', $line)) {
                continue;
            }

            // Skip pure barcode / long numeric ID lines (no letters at all).
            if (preg_match('/^\s*\d{8,}\s*$/', $line)) {
                continue;
            }

            // Skip phone-number-only lines: "0812xxxxxxx", "+62812xxxxxxx".
            if (preg_match('/^\s*(?:\+?62|0)\d{8,12}\s*$/', $line)) {
                continue;
            }

            if (preg_match($skipWords, $line) || preg_match($skipPrefix, $line)) {
                $pendingName = null;

                continue;
            }

            // ── No price number on this line ────────────────────────────────
            if (! preg_match_all('/\d{1,3}(?:[.,]\d{3})+|\b\d{4,}\b/', $line, $matches)) {
                // Buffer as a potential item name for double-line receipts.
                // Only keep it if the line is mostly letters (not a barcode / ID).
                if (preg_match('/\p{L}{2,}/u', $line) && ! preg_match('/^\d+\s*[xX×@]/u', $line)) {
                    $pendingName = $line;
                }

                continue;
            }

            // ── Line has at least one price-like number ──────────────────────

            // Discard barcode-like candidates: long contiguous digit runs with
            // no thousand-separator (real prices almost always have one once
            // they're 4+ digits on a printed receipt, barcodes never do).
            $candidates = array_values(array_filter($matches[0], function (string $raw): bool {
                $digitsOnly = str_replace(['.', ','], '', $raw);
                $hasSeparator = str_contains($raw, '.') || str_contains($raw, ',');

                return $hasSeparator || strlen($digitsOnly) < 8;
            }));

            if ($candidates === []) {
                $pendingName = null;

                continue;
            }

            // Use the LAST remaining number as the line total (format: qty  unit-price  line-total).
            $rawAmount = end($candidates);
            $amount = (int) str_replace(['.', ','], '', $rawAmount);

            // Reject unrealistic amounts (likely a misread ID/phone, not a price).
            if ($amount < 500 || $amount > 50_000_000) {
                $pendingName = null;

                continue;
            }

            // Qty-price line: starts with digits followed by a unit marker
            // (e.g. "1X 12.000", "2 @ 5.000", "3 pcs 9.000", "1 porsi 15.000").
            $isQtyLine = (bool) preg_match(
                '/^\s*\d+\s*(?:[xX×@]|pcs\b|buah\b|botol\b|btl\b|porsi\b|pack\b|pak\b|lusin\b|lsn\b|kg\b|gr\b|ml\b|ltr\b)/iu',
                $line
            );

            if ($isQtyLine && $pendingName !== null) {
                // Double-line format — use the buffered name.
                $name = $pendingName;
            } else {
                // Single-line format — strip numbers/currency/qty markers to get the item name.
                $name = preg_replace('/\d{1,3}(?:[.,]\d{3})+|\b\d+\b/', ' ', $line) ?? $line;
                $name = preg_replace(
                    '/\b(rp\.?|idr|×|x|@|pcs|buah|botol|btl|porsi|pack|pak|lusin|lsn|kg|gr|ml|ltr)\b/iu',
                    ' ',
                    $name
                ) ?? $name;
                $name = preg_replace('/\s+/u', ' ', trim($name)) ?? $name;
                $name = trim($name, ' .,-:×@=');

                if (mb_strlen($name) < 2) {
                    $pendingName = null;

                    continue;
                }
            }

            $pendingName = null;

            $name = mb_convert_case($name, MB_CASE_TITLE, 'UTF-8');
            $category = $this->categoryGuesser->guess($name, TransactionType::Expense, $user);

            $items[] = [
                'description' => $name,
                'amount' => $amount,
                'category_id' => $category?->id,
            ];
        }

        return $items;
    }

    /**
     * Find the most likely total amount on the receipt.
     *
     * Priority order:
     *   1. Lines mentioning "total" / "grand total" / "total belanja" / "total
     *      tagihan" (excluding "subtotal" and "total item/qty/barang", which
     *      are counts, not currency).
     *   2. Lines mentioning "bayar" / "tunai" (payment amount) if no total
     *      keyword was found.
     *   3. The largest plausible number anywhere in the receipt.
     */
    private function extractTotal(string $text): int
    {
        $lines = preg_split('/\r\n|\r|\n/', $text) ?: [];

        $priorityCandidates = [];
        $fallbackCandidates = [];
        $allNumbers = [];

        foreach ($lines as $line) {
            $trimmed = trim($line);

            // Never pull numbers from lines that are clearly not price-bearing.
            if (
                preg_match('/^\d{4}[-\/]\d{2}[-\/]\d{2}|\d{2}[-\/]\d{2}[-\/]\d{4}|\d{2}:\d{2}:\d{2}/', $trimmed)
                || preg_match('/^\s*np[a-z]{2}\s*:/iu', $trimmed)
                || preg_match('/https?:\/\/|www\.|\.com\b|\.id\b|\.net\b/i', $trimmed)
                || preg_match('/^\s*\d{8,}\s*$/', $trimmed)
                || preg_match('/^\s*(?:\+?62|0)\d{8,12}\s*$/', $trimmed)
            ) {
                continue;
            }

            $numbers = $this->numbersIn($trimmed);

            if ($numbers === []) {
                continue;
            }

            $allNumbers = array_merge($allNumbers, $numbers);

            // Subtotal is always excluded (grand total takes precedence).
            if (preg_match('/sub\s*total/i', $trimmed)) {
                continue;
            }

            // "Total Item N" lines can be either a plain count ("Total Item: 3") or
            // a price summary ("Total Item 1  4.500"). Exclude only when there is no
            // thousands-formatted number — if there is one, treat it as a total.
            if (
                preg_match('/total\s*(?:item|qty|barang|jenis)/i', $trimmed)
                && ! preg_match('/\d{1,3}(?:[.,]\d{3})+/', $trimmed)
            ) {
                continue;
            }

            if (preg_match('/\btotal\b|jumlah\s*bayar|grand\s*total|total\s*belanja|total\s*tagihan/i', $trimmed)) {
                $priorityCandidates = array_merge($priorityCandidates, $numbers);

                continue;
            }

            if (preg_match('/\bbayar\b|\btunai\b/i', $trimmed)) {
                $fallbackCandidates = array_merge($fallbackCandidates, $numbers);
            }
        }

        if ($priorityCandidates !== []) {
            return (int) max($priorityCandidates);
        }

        if ($fallbackCandidates !== []) {
            return (int) max($fallbackCandidates);
        }

        return $allNumbers !== [] ? (int) max($allNumbers) : 0;
    }

    /**
     * Extract integer rupiah amounts from a line of text.
     *
     * Filters out barcode/ID-like long digit runs (no thousand separator,
     * 8+ digits) and unrealistically large values, since those are almost
     * always misread IDs rather than prices.
     *
     * @return array<int, int>
     */
    private function numbersIn(string $line): array
    {
        if (! preg_match_all('/\d{1,3}(?:[.,]\d{3})+|\d{4,}/', $line, $matches)) {
            return [];
        }

        $numbers = [];

        foreach ($matches[0] as $raw) {
            $digitsOnly = str_replace(['.', ',', ' '], '', $raw);
            $hasSeparator = str_contains($raw, '.') || str_contains($raw, ',');

            if (! $hasSeparator && strlen($digitsOnly) >= 8) {
                continue; // Barcode / long ID, not a price.
            }

            $value = (int) $digitsOnly;

            if ($value > 50_000_000) {
                continue; // Implausible single receipt amount — likely a misread ID.
            }

            $numbers[] = $value;
        }

        return $numbers;
    }

    /**
     * Use the first meaningful text line as the merchant / description.
     */
    private function extractMerchant(string $text): string
    {
        $lines = preg_split('/\r\n|\r|\n/', $text) ?: [];

        foreach ($lines as $line) {
            $line = trim($line);

            // Skip address/phone header lines so the merchant name wins instead.
            if (preg_match('/^\s*(?:jl\.?|jalan|no\.?\s*telp|telp\.?|hp\.?)\b/iu', $line)) {
                continue;
            }

            // Skip empty lines, lines that are mostly digits/symbols, or long numeric IDs.
            if (
                Str::length($line) >= 3
                && preg_match('/\p{L}{3,}/u', $line)
                && ! preg_match('/^\s*\d{6,}/', $line)
            ) {
                return Str::limit($line, 100, '');
            }
        }

        return 'Struk belanja';
    }
}
