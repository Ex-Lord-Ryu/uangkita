<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserTransactionsViewEnabled
{
    /**
     * Session key holding the admin's "view user transactions" toggle.
     * Stored in session (not DB) so it resets to OFF on logout.
     */
    public const SESSION_KEY = 'admin_view_user_tx';

    /**
     * Allow the request only when an admin has explicitly enabled the
     * "view user transactions" feature in this session.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            abort(403, 'Halaman ini khusus admin.');
        }

        if (! $request->session()->get(self::SESSION_KEY, false)) {
            abort(403, 'Fitur "Lihat Transaksi User" sedang nonaktif. Aktifkan dulu di Pengaturan.');
        }

        return $next($request);
    }
}
