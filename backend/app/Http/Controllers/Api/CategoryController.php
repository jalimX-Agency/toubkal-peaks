<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;

class CategoryController extends Controller
{
    /** Category tree (hubs and sub-hubs) with translated names, URL paths and published tour counts. */
    public function index()
    {
        $categories = Category::where('is_active', true)->whereNull('parent_id')->orderBy('sort_order')
            ->with(['translations', 'children' => fn ($q) => $q->where('is_active', true), 'children.translations', 'children.parent.translations'])
            ->get();

        return CategoryResource::collection($categories);
    }
}
