<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFeedbackReplyRequest;
use App\Http\Requests\StoreFeedbackRequest;
use App\Models\Feedback;
use App\Models\FeedbackAttachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    /**
     * List the user's own feedback threads.
     */
    public function index(Request $request): Response
    {
        $feedbacks = $request->user()
            ->feedbacks()
            ->withCount('replies')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Feedback/Index', [
            'feedbacks' => $feedbacks,
        ]);
    }

    /**
     * Show the create feedback form.
     */
    public function create(): Response
    {
        return Inertia::render('Feedback/Create');
    }

    /**
     * Store a new feedback thread with optional file attachments.
     */
    public function store(StoreFeedbackRequest $request): RedirectResponse
    {
        $feedback = $request->user()->feedbacks()->create([
            'subject' => $request->validated()['subject'],
            'message' => $request->validated()['message'],
            'status' => 'open',
            'is_read_by_admin' => false,
            'is_read_by_user' => true,
        ]);

        foreach ($request->file('attachments', []) as $file) {
            $path = $file->store('feedback-attachments', 'public');
            FeedbackAttachment::create([
                'feedback_id' => $feedback->id,
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);
        }

        return redirect()->route('feedback.show', $feedback)
            ->with('success', 'Feedback berhasil dikirim! Kami akan segera merespons.');
    }

    /**
     * Show a feedback thread and its reply chain.
     */
    public function show(Request $request, Feedback $feedback): Response
    {
        if ($feedback->user_id !== $request->user()->id) {
            abort(403);
        }

        // Mark as read by user when opened.
        if (! $feedback->is_read_by_user) {
            $feedback->update(['is_read_by_user' => true]);
        }

        $feedback->load(['attachments', 'replies.user']);

        return Inertia::render('Feedback/Show', [
            'feedback' => $feedback,
        ]);
    }

    /**
     * User replies to their own feedback thread.
     */
    public function reply(StoreFeedbackReplyRequest $request, Feedback $feedback): RedirectResponse
    {
        if ($feedback->user_id !== $request->user()->id) {
            abort(403);
        }

        $feedback->replies()->create([
            'user_id' => $request->user()->id,
            'message' => $request->validated()['message'],
            'is_admin_reply' => false,
        ]);

        // Mark as unread for admin.
        $feedback->update(['is_read_by_admin' => false, 'is_read_by_user' => true]);

        return back()->with('success', 'Balasan terkirim.');
    }
}
