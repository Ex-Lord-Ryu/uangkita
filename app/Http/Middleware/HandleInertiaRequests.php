<?php

namespace App\Http\Middleware;

use App\Http\Middleware\EnsureUserTransactionsViewEnabled as ViewTxMiddleware;
use App\Models\AppSetting;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'isAdmin' => (bool) $user?->isAdmin(),
                'isSuperAdmin' => (bool) $user?->isSuperAdmin(),
                // Unread feedback count for the current user (non-admin: replies not read yet).
                'feedbackUnread' => $user && ! $user->isAdmin()
                    ? Feedback::where('user_id', $user->id)->where('is_read_by_user', false)->count()
                    : 0,
            ],
            'flags' => [
                // Admin "view user transactions" toggle (session-scoped, default OFF).
                'canViewUserTx' => (bool) ($user?->isAdmin()
                    && $request->session()->get(ViewTxMiddleware::SESSION_KEY, false)),
                // Unread feedback for admin.
                'feedbackUnread' => $user?->isAdmin()
                    ? Feedback::where('is_read_by_admin', false)->count()
                    : 0,
                // Whether registration is currently open (shown on login/welcome pages).
                'registrationEnabled' => AppSetting::bool('registration_enabled', true),
                // Browser-side receipt scanning toggle.
                'ocrEnabled' => AppSetting::bool('ocr_enabled', true),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
