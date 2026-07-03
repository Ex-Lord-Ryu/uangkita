<?php

namespace App\Http\Middleware;

use App\Models\AppSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRegistrationEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! AppSetting::bool('registration_enabled', true)) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Registrasi sedang dinonaktifkan.'], 403);
            }

            return redirect('/login')->with('status', 'Registrasi sedang dinonaktifkan oleh administrator.');
        }

        return $next($request);
    }
}
