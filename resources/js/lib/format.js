export function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount ?? 0);
}

export function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(value ?? 0);
}

export function normalizeRupiahInput(value) {
    return String(value ?? '').replace(/\D/g, '');
}

export function formatRupiahInput(value) {
    const digits = normalizeRupiahInput(value).replace(/^0+(?=\d)/, '');

    if (!digits) return '';

    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function toDateOnly(dateStr) {
    if (!dateStr) return new Date('invalid');
    // Strip time, always treat as local midnight (avoids timezone day-shift).
    const s = String(dateStr).replace(' ', 'T').split('T')[0];
    return new Date(s + 'T00:00:00');
}

function toDateTime(dateStr) {
    if (!dateStr) return new Date('invalid');
    // Normalise MySQL "YYYY-MM-DD HH:mm:ss" to ISO "YYYY-MM-DDTHH:mm:ss" (local).
    return new Date(String(dateStr).replace(' ', 'T'));
}

export function formatDate(dateStr, options) {
    const d = toDateOnly(dateStr);
    return d.toLocaleDateString(
        'id-ID',
        options ?? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
    );
}

export function formatShortDate(dateStr) {
    const d = toDateOnly(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

/** Format tanggal + jam, mis. "1 Jul 2026, 14.35" */
export function formatDateTime(dateStr) {
    const d = toDateTime(dateStr);
    return d.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
