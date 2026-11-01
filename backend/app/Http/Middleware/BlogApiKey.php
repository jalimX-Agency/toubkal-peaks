<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Bearer key of the blog publishing API (BLOG_API_KEY). Without a key of 32+ characters the API does
 * not exist (404). Both values are hashed first so the comparison takes the same time whatever is sent.
 */
class BlogApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = (string) config('services.blog.key');
        if (strlen($expected) < 32) {
            return response()->json(['error' => 'Not found'], 404);
        }
        $provided = (string) $request->bearerToken();
        if ($provided === '' || ! hash_equals(hash('sha256', $expected), hash('sha256', $provided))) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
