<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\FeedbackController as AdminFeedbackController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\UserTransactionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SavingAccountController;
use App\Http\Controllers\TransactionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Transactions
    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('index');
        Route::post('/', [TransactionController::class, 'store'])->name('store');
        Route::post('/quick', [TransactionController::class, 'quickStore'])->name('quick');
        Route::post('/ocr-text', [TransactionController::class, 'ocrScan'])->name('ocr-text');
        Route::get('/ocr-review', [TransactionController::class, 'ocrReview'])->name('ocr-review');
        Route::post('/ocr-items', [TransactionController::class, 'storeOcrItems'])->name('ocr-items');
        Route::patch('/{transaction}', [TransactionController::class, 'update'])->name('update');
        Route::delete('/{transaction}', [TransactionController::class, 'destroy'])->name('destroy');
    });

    // Categories
    Route::resource('categories', CategoryController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    // Savings
    Route::resource('savings', SavingAccountController::class)
        ->parameters(['savings' => 'savingAccount'])
        ->only(['index', 'store', 'update', 'destroy']);
    Route::post('/savings/{savingAccount}/transactions', [SavingAccountController::class, 'storeTransaction'])
        ->name('savings.transactions.store');
    Route::delete('/savings/{savingAccount}/transactions/{savingTransaction}', [SavingAccountController::class, 'destroyTransaction'])
        ->name('savings.transactions.destroy');

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

    // Feedback (user)
    Route::prefix('feedback')->name('feedback.')->group(function () {
        Route::get('/', [FeedbackController::class, 'index'])->name('index');
        Route::get('/create', [FeedbackController::class, 'create'])->name('create');
        Route::post('/', [FeedbackController::class, 'store'])->name('store');
        Route::get('/{feedback}', [FeedbackController::class, 'show'])->name('show');
        Route::post('/{feedback}/reply', [FeedbackController::class, 'reply'])->name('reply');
    });

    // Admin
    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        Route::resource('users', AdminUserController::class)
            ->only(['index', 'store', 'update', 'destroy']);

        Route::get('/settings', [SettingController::class, 'edit'])->name('settings.edit');
        Route::put('/settings/view-user-tx', [SettingController::class, 'updateViewUserTx'])->name('settings.view-user-tx');
        Route::put('/settings/registration', [SettingController::class, 'updateRegistration'])->name('settings.registration');
        Route::put('/settings/ocr', [SettingController::class, 'updateOcr'])->name('settings.ocr');

        // Gated: only accessible when the session toggle is ON.
        Route::get('/user-transactions', [UserTransactionController::class, 'index'])
            ->middleware('admin.viewtx')
            ->name('user-transactions.index');

        // Feedback management
        Route::prefix('feedbacks')->name('feedbacks.')->group(function () {
            Route::get('/', [AdminFeedbackController::class, 'index'])->name('index');
            Route::get('/{feedback}', [AdminFeedbackController::class, 'show'])->name('show');
            Route::post('/{feedback}/reply', [AdminFeedbackController::class, 'reply'])->name('reply');
            Route::patch('/{feedback}/status', [AdminFeedbackController::class, 'updateStatus'])->name('status');
            Route::delete('/{feedback}', [AdminFeedbackController::class, 'destroy'])->name('destroy');
        });
    });
});

require __DIR__.'/auth.php';
