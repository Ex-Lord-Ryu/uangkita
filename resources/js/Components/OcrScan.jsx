import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Icon from '@/Components/Icon';

const SCAN_TIPS = [
    'Gunakan foto/screenshot struk asli — bukan foto struk yang sudah difoto ulang',
    'Pastikan kertas struk rata & tidak terlipat',
    'Cahaya cukup & tidak ada bayangan di atas tulisan',
    'Teks harus terlihat tajam, bukan buram/miring',
    'Screenshot digital (PDF/nota online) lebih akurat dari foto kertas',
];

/**
 * Client-side OCR using tesseract.js (WebAssembly, no server binary needed).
 * After recognition, sends the extracted text to the server for line-item parsing.
 */
export default function OcrScan() {
    const [status, setStatus] = useState(null); // null | 'loading' | 'progress' | 'parsing' | 'error' | 'tips'
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);
    const tipsRef = useRef(null);
    const tipsBtnRef = useRef(null);

    // Close tips when clicking outside.
    useEffect(() => {
        if (status !== 'tips') {
            return;
        }

        const handleClickOutside = (e) => {
            if (
                tipsRef.current && !tipsRef.current.contains(e.target) &&
                tipsBtnRef.current && !tipsBtnRef.current.contains(e.target)
            ) {
                setStatus(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [status]);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        setStatus('loading');
        setProgress(0);
        setErrorMsg('');

        let worker = null;

        try {
            // Dynamically import tesseract.js (code-split so main bundle stays small).
            const { createWorker } = await import('tesseract.js');
            worker = await createWorker('ind+eng', 1, {
                logger: (info) => {
                    if (info.status === 'recognizing text') {
                        setStatus('progress');
                        setProgress(Math.round((info.progress ?? 0) * 100));
                    }
                },
            });

            await worker.setParameters({
                // PSM 6 = single uniform block of text — much better for receipt columns
                // than the default PSM 3 which tries to auto-detect complex layouts.
                tessedit_pageseg_mode: '6',
                user_defined_dpi: '300',
            });

            // Request TSV output — contains word-level bounding boxes so the
            // server can reconstruct clean lines (no column-gap artifacts).
            const {
                data: { text, tsv },
            } = await worker.recognize(file);

            if (!text || text.trim().length < 5) {
                setStatus('error');
                setErrorMsg('Tidak ada teks terbaca. Coba foto lebih jelas.');
                return;
            }

            // Send TSV (preferred) so the server can use word coordinates for
            // clean line reconstruction, identical to binary Tesseract --tsv output.
            setStatus('parsing');
            router.post(
                route('transactions.ocr-text'),
                { raw_tsv: tsv ?? null, raw_text: text },
                {
                    onSuccess: () => setStatus(null),
                    onError: (errs) => {
                        setStatus('error');
                        setErrorMsg(errs.raw_tsv ?? errs.raw_text ?? 'Gagal memproses teks OCR.');
                    },
                },
            );
        } catch (err) {
            setStatus('error');
            setErrorMsg('OCR gagal: ' + (err.message ?? 'Unknown error'));
        } finally {
            if (worker) {
                await worker.terminate();
            }

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const isBusy = status === 'loading' || status === 'progress' || status === 'parsing';

    return (
        <>
            {/* Full-screen backdrop so clicking anywhere outside closes tips */}
            {status === 'tips' && (
                <div className="fixed inset-0 z-40" aria-hidden="true" />
            )}

            <div className="relative max-w-full">
                <div className="flex max-w-full items-center gap-2">
                    <label
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-600 px-4 py-2 text-sm font-medium text-brand-600 transition hover:bg-brand-50 dark:hover:bg-brand-900/20 ${isBusy ? 'pointer-events-none opacity-60' : ''}`}
                    >
                        {isBusy ? (
                            <>
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                {status === 'loading' && 'Memuat OCR…'}
                                {status === 'progress' && `Membaca ${progress}%`}
                                {status === 'parsing' && 'Memproses…'}
                            </>
                        ) : (
                            <>
                                <Icon name="camera" className="h-4 w-4" />
                                Scan Struk
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFile}
                            disabled={isBusy}
                            className="hidden"
                        />
                    </label>

                    {/* Tips toggle button */}
                    {!isBusy && (
                        <button
                            ref={tipsBtnRef}
                            type="button"
                            title="Tips foto struk"
                            onClick={() => setStatus(s => s === 'tips' ? null : 'tips')}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-400 transition hover:border-brand-400 hover:text-brand-600 dark:border-gray-600 dark:hover:border-brand-500 dark:hover:text-brand-400"
                        >
                            <span className="text-xs font-bold">?</span>
                        </button>
                    )}
                </div>

                {/* Progress bar */}
                {status === 'progress' && (
                    <div className="absolute -bottom-1.5 left-0 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                            className="h-full rounded-full bg-brand-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {/* Tips modal */}
                {status === 'tips' && (
                    <div
                        ref={tipsRef}
                        className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-80 rounded-2xl border border-blue-200 bg-white p-5 shadow-2xl sm:-right-4 dark:border-blue-800 dark:bg-gray-900"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                📷 Tips scan struk
                            </p>
                            <button
                                onClick={() => setStatus(null)}
                                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <ul className="space-y-2.5">
                            {SCAN_TIPS.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                                        {i + 1}
                                    </span>
                                    {tip}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                💡 <strong>Screenshot</strong> struk digital jauh lebih akurat dari foto kertas — hindari foto ulang layar/kertas
                            </p>
                        </div>
                    </div>
                )}

                {/* Error toast */}
                {status === 'error' && errorMsg && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-64 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 shadow-lg dark:border-red-800 dark:bg-red-900/40 dark:text-red-300">
                        <div className="flex items-start gap-2">
                            <Icon name="bell" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <div>
                                <p>{errorMsg}</p>
                                <button
                                    onClick={() => setStatus(null)}
                                    className="mt-1 font-medium underline hover:no-underline"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
