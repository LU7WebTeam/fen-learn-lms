<?php

namespace App\Support;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class AdminDocumentation
{
    public static function all(): array
    {
        $directory = base_path('docs/admin');

        if (! File::isDirectory($directory)) {
            return [];
        }

        return collect(File::files($directory))
            ->filter(fn ($file) => $file->getExtension() === 'md')
            ->map(fn ($file) => self::parseFile($file->getPathname()))
            ->filter()
            ->sortBy([
                ['category', 'asc'],
                ['order', 'asc'],
                ['title', 'asc'],
            ])
            ->values()
            ->all();
    }

    public static function grouped(): array
    {
        return collect(self::all())
            ->groupBy('category')
            ->map(fn ($documents) => $documents->values()->all())
            ->all();
    }

    private static function parseFile(string $path): ?array
    {
        $raw = File::get($path);

        if (! preg_match('/\A---\R(.*?)\R---\R(.*)\z/s', $raw, $matches)) {
            $content = trim($raw);

            if ($content === '') {
                return null;
            }

            return [
                'slug' => Str::slug(pathinfo($path, PATHINFO_FILENAME)),
                'title' => Str::headline(pathinfo($path, PATHINFO_FILENAME)),
                'category' => 'General',
                'order' => 999,
                'summary' => null,
                'updated_at' => date('M j, Y g:i A', File::lastModified($path)),
                'path' => str_replace(base_path() . DIRECTORY_SEPARATOR, '', $path),
                'content' => $content,
            ];
        }

        $frontMatter = self::parseFrontMatter($matches[1]);
        $content = trim($matches[2]);

        return [
            'slug' => $frontMatter['slug'] ?? Str::slug(pathinfo($path, PATHINFO_FILENAME)),
            'title' => $frontMatter['title'] ?? Str::headline(pathinfo($path, PATHINFO_FILENAME)),
            'category' => $frontMatter['category'] ?? 'General',
            'order' => isset($frontMatter['order']) ? (int) $frontMatter['order'] : 999,
            'summary' => $frontMatter['summary'] ?? null,
            'updated_at' => date('M j, Y g:i A', File::lastModified($path)),
            'path' => str_replace(base_path() . DIRECTORY_SEPARATOR, '', $path),
            'content' => $content,
        ];
    }

    private static function parseFrontMatter(string $frontMatter): array
    {
        return collect(preg_split('/\R/', trim($frontMatter)))
            ->map(fn ($line) => explode(':', $line, 2))
            ->filter(fn ($parts) => count($parts) === 2)
            ->mapWithKeys(fn ($parts) => [trim($parts[0]) => trim($parts[1], " \t\n\r\0\x0B\"'")])
            ->all();
    }
}
