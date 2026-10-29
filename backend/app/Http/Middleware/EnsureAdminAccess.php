<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Admin API guard (after auth:sanctum): the account must be active, and `admin.access:admin` also
 * requires the admin role. A deactivated member is signed out of every device at once.
 */
class EnsureAdminAccess
{
    public function handle(Request $request, Closure $next, ?string $role = null): Response
    {
        $user = $request->user();
        if (! $user || ! $user->is_active) {
            $user?->tokens()->delete();

            return response()->json(['message' => 'Your account is disabled.'], 401);
        }
        if ($role === 'admin' && ! $user->isAdmin()) {
            return response()->json(['message' => 'Only administrators can do this.'], 403);
        }

        return $next($request);
    }
}
