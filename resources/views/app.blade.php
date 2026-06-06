<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        @php
            $settings = \App\Models\Setting::allAsArray();

            $platformName = trim((string) ($settings['platform_name'] ?? config('app.name', 'Free LMS')));
            $platformTagline = trim((string) ($settings['platform_tagline'] ?? ''));

            $seoDefaultTitle = trim((string) ($settings['seo_default_title'] ?? ''));
            $seoDefaultDescription = trim((string) ($settings['seo_default_description'] ?? ''));
            $seoDefaultImage = trim((string) ($settings['seo_default_image'] ?? ''));
            $seoHomeTitle = trim((string) ($settings['seo_home_title'] ?? ''));
            $seoHomeDescription = trim((string) ($settings['seo_home_description'] ?? ''));
            $seoCoursesTitle = trim((string) ($settings['seo_courses_title'] ?? ''));
            $seoCoursesDescription = trim((string) ($settings['seo_courses_description'] ?? ''));

            $metaTitle = $seoDefaultTitle !== '' ? $seoDefaultTitle : $platformName;
            $metaDescription = $seoDefaultDescription !== '' ? $seoDefaultDescription : $platformTagline;
            $metaImage = $seoDefaultImage;
            $metaType = 'website';

            if (request()->routeIs('home')) {
                $metaTitle = $seoHomeTitle !== '' ? $seoHomeTitle : $metaTitle;
                $metaDescription = $seoHomeDescription !== '' ? $seoHomeDescription : $metaDescription;
            }

            if (request()->routeIs('courses.index')) {
                $metaTitle = $seoCoursesTitle !== '' ? $seoCoursesTitle : $metaTitle;
                $metaDescription = $seoCoursesDescription !== '' ? $seoCoursesDescription : $metaDescription;
            }

            if (request()->routeIs('courses.show')) {
                $courseParam = request()->route('course');
                $course = $courseParam instanceof \App\Models\Course
                    ? $courseParam
                    : \App\Models\Course::query()->where('slug', (string) $courseParam)->first();

                if ($course && $course->status === 'published') {
                    $metaTitle = trim((string) ($course->meta_title ?: $course->title ?: $metaTitle));
                    $metaDescription = trim((string) ($course->meta_description ?: $metaDescription));
                    $metaImage = trim((string) ($course->meta_image ?: $course->cover_image ?: $metaImage));
                    $metaType = 'article';
                }
            }
        @endphp

        @if ($metaDescription !== '')
            <meta name="description" content="{{ $metaDescription }}">
        @endif
        <meta property="og:title" content="{{ $metaTitle }}">
        @if ($metaDescription !== '')
            <meta property="og:description" content="{{ $metaDescription }}">
        @endif
        @if ($metaImage !== '')
            <meta property="og:image" content="{{ $metaImage }}">
        @endif
        <meta property="og:type" content="{{ $metaType }}">
        <meta property="og:url" content="{{ request()->fullUrl() }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $metaTitle }}">
        @if ($metaDescription !== '')
            <meta name="twitter:description" content="{{ $metaDescription }}">
        @endif
        @if ($metaImage !== '')
            <meta name="twitter:image" content="{{ $metaImage }}">
        @endif
        <link rel="canonical" href="{{ request()->url() }}">

        <!-- Favicon -->
        @php
            $faviconPath = (string) ($settings['favicon_path'] ?? '');
            $faviconUrl  = \App\Support\EmailBranding::s3Url($faviconPath);
        @endphp
        @if ($faviconUrl)
            <link rel="icon" type="image/png" href="{{ $faviconUrl }}">
        @else
            <link rel="icon" href="/favicon.ico">
        @endif

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite('resources/js/app.jsx')
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
