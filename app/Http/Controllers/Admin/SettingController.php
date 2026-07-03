<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureUserTransactionsViewEnabled as ViewTx;
use App\Models\AppSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Admin/Settings', [
            'viewUserTx' => (bool) $request->session()->get(ViewTx::SESSION_KEY, false),
            'registrationEnabled' => AppSetting::bool('registration_enabled', true),
            'ocrEnabled' => AppSetting::bool('ocr_enabled', true),
        ]);
    }

    /**
     * Enable/disable the "view user transactions" feature (session-only).
     */
    public function updateViewUserTx(Request $request): RedirectResponse
    {
        $validated = $request->validate(['enabled' => ['required', 'boolean']]);

        if ($validated['enabled']) {
            $request->session()->put(ViewTx::SESSION_KEY, true);
            $message = 'Fitur "Lihat Transaksi User" diaktifkan untuk sesi ini.';
        } else {
            $request->session()->forget(ViewTx::SESSION_KEY);
            $message = 'Fitur "Lihat Transaksi User" dinonaktifkan.';
        }

        return back()->with('success', $message);
    }

    /**
     * Toggle user registration on/off (persisted in DB).
     */
    public function updateRegistration(Request $request): RedirectResponse
    {
        $validated = $request->validate(['enabled' => ['required', 'boolean']]);

        AppSetting::set('registration_enabled', $validated['enabled'] ? 'true' : 'false');

        return back()->with('success', $validated['enabled']
            ? 'Registrasi pengguna diaktifkan.'
            : 'Registrasi pengguna dinonaktifkan.');
    }

    /**
     * Update OCR settings.
     */
    public function updateOcr(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'enabled' => ['required', 'boolean'],
        ]);

        AppSetting::set('ocr_enabled', $validated['enabled'] ? 'true' : 'false');

        return back()->with('success', 'Pengaturan OCR disimpan.');
    }
}
