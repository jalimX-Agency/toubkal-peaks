<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Mail\AdminAccountCreated;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/** Team accounts (administrators only). New members receive a temporary password by email. */
class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => User::orderBy('name')->get()->map->toAdminArray()->all()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'role' => ['required', Rule::enum(UserRole::class)],
        ]);

        $user = static::invite($data['name'], $data['email'], UserRole::from($data['role']));

        return response()->json(['data' => $user->toAdminArray()], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'role' => ['sometimes', Rule::enum(UserRole::class)],
            'is_active' => ['sometimes', 'boolean'],
            'reset_password' => ['sometimes', 'boolean'],
        ]);

        $self = $request->user()->is($user);
        if ($self && (($data['is_active'] ?? true) === false || ($data['role'] ?? 'admin') !== UserRole::Admin->value)) {
            return response()->json(['message' => 'You cannot remove your own access.'], 422);
        }

        $user->update(collect($data)->only(['name', 'role', 'is_active'])->all());
        if (($data['is_active'] ?? true) === false) {
            $user->tokens()->delete();
        }
        if ($data['reset_password'] ?? false) {
            static::sendTemporaryPassword($user);
        }

        return response()->json(['data' => $user->fresh()->toAdminArray()]);
    }

    /** Create an account and email its temporary password; nothing is kept if the email fails. */
    public static function invite(string $name, string $email, UserRole $role): User
    {
        return DB::transaction(function () use ($name, $email, $role) {
            $user = User::create(['name' => $name, 'email' => $email, 'password' => Str::password(32), 'role' => $role]);
            static::sendTemporaryPassword($user);

            return $user;
        });
    }

    public static function sendTemporaryPassword(User $user): void
    {
        $password = Str::password(14, symbols: false);
        $user->forceFill(['password' => $password, 'must_change_password' => true])->save();
        $user->tokens()->delete();
        Mail::to($user->email)->send(new AdminAccountCreated($user, $password));
    }
}
