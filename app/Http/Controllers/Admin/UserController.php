<?php

namespace App\Http\Controllers\Admin;

use App\Actions\SeedDefaultCategories;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * List users with aggregate counts (no transaction details).
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $users = User::query()
            ->when($search, fn ($q) => $q->where(fn ($w) => $w
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
            ))
            ->withCount(['transactions', 'categories'])
            ->orderByDesc('is_super_admin')
            ->orderByDesc('is_admin')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => ['search' => $search ?? ''],
            'canManageRoles' => $request->user()->isSuperAdmin(),
        ]);
    }

    public function store(StoreUserRequest $request, SeedDefaultCategories $seedDefaultCategories): RedirectResponse
    {
        $data = $request->validated();
        $isSuperAdmin = $request->user()->isSuperAdmin();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'is_admin' => $isSuperAdmin ? ($data['is_admin'] ?? false) : false,
        ]);

        $seedDefaultCategories->handle($user);

        return back()->with('success', "Pengguna {$user->name} berhasil dibuat.");
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();
        $isSuperAdmin = $request->user()->isSuperAdmin();

        if (! $isSuperAdmin && $user->isAdmin()) {
            abort(403, 'Admin biasa tidak bisa mengubah akun admin.');
        }

        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
            'is_admin' => $isSuperAdmin ? ($data['is_admin'] ?? false) : $user->is_admin,
        ]);

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return back()->with('success', "Pengguna {$user->name} berhasil diperbarui.");
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'Tidak bisa menghapus akun sendiri.');
        }

        if (! $request->user()->isSuperAdmin() && $user->isAdmin()) {
            abort(403, 'Admin biasa tidak bisa menghapus akun admin.');
        }

        $user->delete();

        return back()->with('success', 'Pengguna berhasil dihapus.');
    }
}
