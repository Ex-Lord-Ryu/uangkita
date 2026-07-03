<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class CategoryGuesser
{
    /**
     * Guess the best matching category for a description, scoped to the
     * given user's own categories.
     *
     * Matches the description against each category's keywords and returns the
     * category owning the longest matching keyword. Falls back to the default
     * (keyword-less) category of the given type when nothing matches.
     */
    public function guess(string $description, TransactionType $type, User $user): ?Category
    {
        $haystack = Str::lower($description);

        /** @var Collection<int, Category> $categories */
        $categories = Category::query()->forUser($user)->where('type', $type)->get();

        $bestMatch = null;
        $bestLength = 0;

        foreach ($categories as $category) {
            foreach ($category->keywords ?? [] as $keyword) {
                $keyword = Str::lower(trim($keyword));

                if ($keyword === '' || ! $this->matches($haystack, $keyword)) {
                    continue;
                }

                if (Str::length($keyword) > $bestLength) {
                    $bestLength = Str::length($keyword);
                    $bestMatch = $category;
                }
            }
        }

        return $bestMatch ?? $this->fallback($categories, $type);
    }

    /**
     * Whether the keyword appears in the haystack on a word boundary.
     */
    private function matches(string $haystack, string $keyword): bool
    {
        return (bool) preg_match('/(?<![\p{L}\p{N}])'.preg_quote($keyword, '/').'(?![\p{L}\p{N}])/u', $haystack);
    }

    /**
     * The default keyword-less category for the given type.
     *
     * @param  Collection<int, Category>  $categories
     */
    private function fallback($categories, TransactionType $type): ?Category
    {
        return $categories->first(fn (Category $category): bool => empty($category->keywords));
    }
}
