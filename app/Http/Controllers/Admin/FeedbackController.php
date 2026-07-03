<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FeedbackStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFeedbackReplyRequest;
use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    /**
     * List all feedback threads for admin.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status');

        $feedbacks = Feedback::with('user')
            ->withCount('replies')
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $counts = [
            'all' => Feedback::count(),
            'unread' => Feedback::where('is_read_by_admin', false)->count(),
            'open' => Feedback::where('status', FeedbackStatus::Open)->count(),
            'in_progress' => Feedback::where('status', FeedbackStatus::InProgress)->count(),
            'resolved' => Feedback::where('status', FeedbackStatus::Resolved)->count(),
        ];

        return Inertia::render('Admin/Feedbacks/Index', [
            'feedbacks' => $feedbacks,
            'counts' => $counts,
            'filters' => ['status' => $status ?? ''],
        ]);
    }

    /**
     * Show a feedback thread detail with reply chain.
     */
    public function show(Feedback $feedback): Response
    {
        // Mark as read by admin.
        if (! $feedback->is_read_by_admin) {
            $feedback->update(['is_read_by_admin' => true]);
        }

        $feedback->load(['user', 'attachments', 'replies.user']);

        return Inertia::render('Admin/Feedbacks/Show', [
            'feedback' => $feedback,
            'statuses' => collect(FeedbackStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'tone' => $s->badgeTone(),
            ]),
        ]);
    }

    /**
     * Admin replies to a feedback thread.
     */
    public function reply(StoreFeedbackReplyRequest $request, Feedback $feedback): RedirectResponse
    {
        $feedback->replies()->create([
            'user_id' => $request->user()->id,
            'message' => $request->validated()['message'],
            'is_admin_reply' => true,
        ]);

        // Mark as unread for user, read for admin.
        $feedback->update([
            'is_read_by_admin' => true,
            'is_read_by_user' => false,
            'status' => $feedback->status === FeedbackStatus::Open
                ? FeedbackStatus::InProgress->value
                : $feedback->status->value,
        ]);

        return back()->with('success', 'Balasan terkirim ke pengguna.');
    }

    /**
     * Update the status of a feedback thread.
     */
    public function updateStatus(Request $request, Feedback $feedback): RedirectResponse
    {
        $request->validate([
            'status' => ['required', new Enum(FeedbackStatus::class)],
        ]);

        $feedback->update(['status' => $request->input('status')]);

        return back()->with('success', 'Status feedback diperbarui.');
    }

    /**
     * Delete a feedback thread.
     */
    public function destroy(Feedback $feedback): RedirectResponse
    {
        $feedback->delete();

        return redirect()->route('admin.feedbacks.index')
            ->with('success', 'Feedback dihapus.');
    }
}
