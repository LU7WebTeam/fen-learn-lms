<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <style>
        @php
            $size        = $template['size']        ?? 'a4';
            $orientation = $template['orientation'] ?? 'landscape';
            $bg          = $template['background']  ?? ['type' => 'color', 'color' => '#fdf8f4', 'image_url' => ''];
            $branding    = $template['branding']    ?? [];
            $fieldsRaw   = $template['fields']      ?? [];
            $signatory   = $template['signatory']   ?? ['name' => '', 'title' => '', 'organization' => ''];
            $fields      = collect($fieldsRaw)->keyBy('id');

            $pageDims = [
                'a4'     => ['landscape' => [297, 210], 'portrait' => [210, 297]],
                'letter' => ['landscape' => [279.4, 215.9], 'portrait' => [215.9, 279.4]],
            ];
            $pageW = $pageDims[$size][$orientation][0] ?? 297;
            $pageH = $pageDims[$size][$orientation][1] ?? 210;

            // Top/bottom bar heights as fraction of page height
            $showTopBar    = $branding['show_top_bar']    ?? true;
            $showBottomBar = $branding['show_bottom_bar'] ?? true;
            $topBarH       = $showTopBar    ? round($pageH * 0.085, 2) : 0;
            $bottomBarH    = $showBottomBar ? round($pageH * 0.067, 2) : 0;
            $accentH       = $showTopBar    ? round($pageH * 0.014, 2) : 0;
            $accentH2      = $showBottomBar ? round($pageH * 0.010, 2) : 0;

            $topBarColor    = $branding['top_bar_color']    ?? '#8B1A4A';
            $bottomBarColor = $branding['bottom_bar_color'] ?? '#8B1A4A';
            $accentColor    = $branding['accent_color']     ?? '#C8A96E';
            $showLogo       = $branding['show_logo']        ?? true;
            $logoText       = $branding['logo_text']        ?? 'FENLearn';
            $tagline        = $branding['tagline']          ?? '';

            // Background styles
            $bgStyle = '';
            if (($bg['type'] ?? 'color') === 'image' && !empty($bg['image_url'])) {
                $bgStyle = "background-image: url('{$bg['image_url']}'); background-size: cover; background-position: center;";
            } else {
                $bgStyle = "background: " . ($bg['color'] ?? '#fdf8f4') . ";";
            }

            // Helper to get field value for dynamic fields
            $dynamicValues = [
                'recipient_name'  => $name         ?? '',
                'course_title'    => $course_title  ?? '',
                'completion_date' => $completed_at  ?? '',
                'certificate_id'  => $uuid          ?? '',
                'signatory_name'  => $signatory['name']  ?? '',
                'signatory_title' => $signatory['title'] ?? '',
            ];

            function getFieldText($field, $dynamicValues) {
                if (($field['type'] ?? 'static') === 'dynamic') {
                    return $dynamicValues[$field['id']] ?? '';
                }
                return $field['text'] ?? '';
            }

            function fieldCss($field, $pageW, $pageH) {
                $topMm     = round(($field['y'] / 100) * $pageH, 2);
                $fontSize  = $field['font_size'] ?? 12;
                $color     = $field['color']     ?? '#1e1e2e';
                $align     = $field['align']     ?? 'center';
                $bold      = ($field['bold']     ?? false) ? 'bold'   : 'normal';
                $italic    = ($field['italic']   ?? false) ? 'italic' : 'normal';
                $paddingL  = 10; // mm padding each side
                $paddingR  = 10;

                // For left-aligned, shift start based on x%
                if ($align === 'left') {
                    $startMm  = round(($field['x'] / 100) * $pageW, 2);
                    $paddingL = $startMm;
                } elseif ($align === 'right') {
                    $endMm    = round(($field['x'] / 100) * $pageW, 2);
                    $paddingR = $pageW - $endMm;
                }

                return "position: absolute; top: {$topMm}mm; left: 0; right: 0;"
                    . " padding-left: {$paddingL}mm; padding-right: {$paddingR}mm;"
                    . " font-size: {$fontSize}pt; color: {$color};"
                    . " text-align: {$align}; font-weight: {$bold}; font-style: {$italic};"
                    . " line-height: 1;";
            }
        @endphp

        * { margin: 0; padding: 0; box-sizing: border-box; }

        @page { size: {{ $pageW }}mm {{ $pageH }}mm; margin: 0; }

        body {
            margin: 0; padding: 0;
            font-family: 'DejaVu Sans', sans-serif;
            width: {{ $pageW }}mm;
            height: {{ $pageH }}mm;
            overflow: hidden;
        }

        .page {
            position: relative;
            width: {{ $pageW }}mm;
            height: {{ $pageH }}mm;
            {!! $bgStyle !!}
        }

        @if ($showTopBar)
        .top-bar {
            position: absolute; top: 0; left: 0; right: 0;
            height: {{ $topBarH }}mm;
            background: {{ $topBarColor }};
        }
        .top-accent {
            position: absolute; top: {{ $topBarH }}mm; left: 0; right: 0;
            height: {{ $accentH }}mm;
            background: {{ $accentColor }};
        }
        .logo-area {
            position: absolute; top: 0; left: 0; right: 0;
            height: {{ $topBarH }}mm;
            text-align: center;
            padding-top: {{ round($topBarH * 0.2, 2) }}mm;
        }
        .logo-text {
            color: #ffffff;
            font-size: {{ round($topBarH * 0.35, 1) }}pt;
            font-weight: bold;
            letter-spacing: 4px;
        }
        .logo-sub {
            color: #F0D9A8;
            font-size: {{ round($topBarH * 0.17, 1) }}pt;
            letter-spacing: 2px;
            margin-top: 1mm;
        }
        @endif

        @if ($showBottomBar)
        .bottom-bar {
            position: absolute; bottom: 0; left: 0; right: 0;
            height: {{ $bottomBarH }}mm;
            background: {{ $bottomBarColor }};
        }
        .bottom-accent {
            position: absolute; bottom: {{ $bottomBarH }}mm; left: 0; right: 0;
            height: {{ $accentH2 }}mm;
            background: {{ $accentColor }};
        }
        .footer-row {
            position: absolute; bottom: 0; left: 0; right: 0;
            height: {{ $bottomBarH }}mm;
            padding: {{ round($bottomBarH * 0.3, 2) }}mm {{ round($pageW * 0.067, 2) }}mm;
        }
        .footer-left  { color: #F0D9A8; font-size: {{ round($bottomBarH * 0.3, 1) }}pt; float: left; }
        .footer-center { color: #fff; font-size: {{ round($bottomBarH * 0.32, 1) }}pt; font-weight: bold; text-align: center; letter-spacing: 2px; }
        .footer-right { color: #F0D9A8; font-size: {{ round($bottomBarH * 0.27, 1) }}pt; float: right; }
        @endif
    </style>
</head>
<body>
<div class="page">

    @if ($showTopBar)
    <div class="top-bar"></div>
    <div class="top-accent"></div>
    @if ($showLogo)
    <div class="logo-area">
        <div class="logo-text">{{ $logoText }}</div>
        @if ($tagline)
        <div class="logo-sub">{{ $tagline }}</div>
        @endif
    </div>
    @endif
    @endif

    @if ($showBottomBar)
    <div class="bottom-accent"></div>
    <div class="bottom-bar"></div>
    <div class="footer-row">
        <span class="footer-left">{{ $completed_at ?? '' }}</span>
        <span class="footer-center" style="display:block; margin: 0 auto; text-align:center;">Certificate of Completion</span>
        <span class="footer-right">{{ $uuid ?? '' }}</span>
    </div>
    @endif

    @foreach ($fieldsRaw as $field)
        @if ($field['visible'] ?? false)
            @php
                $text = getFieldText($field, $dynamicValues);
            @endphp
            @if ($text)
            <div style="{!! fieldCss($field, $pageW, $pageH) !!}">{{ $text }}</div>
            @endif
        @endif
    @endforeach

</div>
</body>
</html>
