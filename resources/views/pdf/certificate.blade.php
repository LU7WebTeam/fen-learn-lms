<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        @page { size: A4 landscape; margin: 0; }

        body {
            width: 297mm;
            height: 210mm;
            font-family: 'DejaVu Sans', sans-serif;
            background: #ffffff;
            color: #1e1e2e;
            overflow: hidden;
        }

        /* ── Outer page ── */
        .page {
            width: 297mm;
            height: 210mm;
            position: relative;
            background: #fdf8f4;
        }

        /* ── Decorative border ── */
        .border-outer {
            position: absolute;
            inset: 10mm;
            border: 3px solid #8B1A4A;
        }
        .border-inner {
            position: absolute;
            inset: 13mm;
            border: 1px solid #C8A96E;
        }

        /* ── Corner ornaments (CSS squares rotated) ── */
        .corner {
            position: absolute;
            width: 8mm;
            height: 8mm;
            border: 2px solid #C8A96E;
        }
        .corner-tl { top: 8mm;  left: 8mm;  border-right: none; border-bottom: none; }
        .corner-tr { top: 8mm;  right: 8mm; border-left: none;  border-bottom: none; }
        .corner-bl { bottom: 8mm; left: 8mm;  border-right: none; border-top: none; }
        .corner-br { bottom: 8mm; right: 8mm; border-left: none;  border-top: none; }

        /* ── Accent bar top ── */
        .top-bar {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 18mm;
            background: #8B1A4A;
        }
        .top-bar-gold {
            position: absolute;
            top: 18mm;
            left: 0;
            right: 0;
            height: 3mm;
            background: #C8A96E;
        }

        /* ── Bottom bar ── */
        .bottom-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 14mm;
            background: #8B1A4A;
        }
        .bottom-bar-gold {
            position: absolute;
            bottom: 14mm;
            left: 0;
            right: 0;
            height: 2mm;
            background: #C8A96E;
        }

        /* ── Logo in top bar ── */
        .logo-area {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 18mm;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .logo-text {
            color: #ffffff;
            font-size: 16pt;
            font-weight: bold;
            letter-spacing: 4px;
            text-transform: uppercase;
        }
        .logo-sub {
            color: #F0D9A8;
            font-size: 7pt;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-top: 1mm;
            text-align: center;
        }

        /* ── Main content ── */
        .content {
            position: absolute;
            top: 24mm;
            left: 18mm;
            right: 18mm;
            bottom: 18mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }

        .cert-label {
            font-size: 9pt;
            letter-spacing: 5px;
            text-transform: uppercase;
            color: #8B1A4A;
            margin-bottom: 4mm;
        }

        .cert-title {
            font-size: 28pt;
            font-weight: bold;
            color: #1e1e2e;
            letter-spacing: 1px;
            margin-bottom: 6mm;
            line-height: 1.1;
        }

        .cert-presented {
            font-size: 9pt;
            color: #666;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 4mm;
        }

        .divider {
            width: 40mm;
            height: 1px;
            background: #C8A96E;
            margin: 0 auto 5mm;
        }

        .recipient-name {
            font-size: 30pt;
            font-weight: bold;
            color: #8B1A4A;
            margin-bottom: 5mm;
            letter-spacing: 1px;
        }

        .cert-body {
            font-size: 9pt;
            color: #555;
            letter-spacing: 1px;
            margin-bottom: 3mm;
        }

        .course-title {
            font-size: 15pt;
            font-weight: bold;
            color: #1e1e2e;
            margin-bottom: 6mm;
            line-height: 1.3;
            padding: 0 10mm;
        }

        /* ── Footer row ── */
        .footer-row {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 14mm;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20mm;
        }
        .footer-left {
            color: #F0D9A8;
            font-size: 6.5pt;
            letter-spacing: 1px;
        }
        .footer-center {
            color: #ffffff;
            font-size: 7pt;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            text-align: center;
        }
        .footer-right {
            color: #F0D9A8;
            font-size: 6.5pt;
            letter-spacing: 1px;
            text-align: right;
        }

        /* ── Date + meta row ── */
        .meta-row {
            display: flex;
            align-items: flex-start;
            justify-content: center;
            gap: 20mm;
            margin-top: 3mm;
        }
        .meta-col {
            text-align: center;
        }
        .meta-label {
            font-size: 6pt;
            color: #999;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 2mm;
        }
        .meta-value {
            font-size: 9pt;
            color: #1e1e2e;
            font-weight: bold;
        }
        .meta-line {
            width: 35mm;
            height: 1px;
            background: #ddd;
            margin: 3mm auto 2mm;
        }
    </style>
</head>
<body>
<div class="page">

    <!-- Top decorative bar -->
    <div class="top-bar"></div>
    <div class="top-bar-gold"></div>

    <!-- Logo in top bar -->
    <div class="logo-area">
        <div>
            <div class="logo-text">FENLearn</div>
            <div class="logo-sub">FEN E-Learning Platform &nbsp;·&nbsp; Backed by FEN Network</div>
        </div>
    </div>

    <!-- Bottom bar -->
    <div class="bottom-bar-gold"></div>
    <div class="bottom-bar"></div>

    <!-- Corner ornaments -->
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <!-- Footer row inside bottom bar -->
    <div class="footer-row">
        <div class="footer-left">
            Issued: {{ $completed_at }}
        </div>
        <div class="footer-center">
            Certificate of Completion
        </div>
        <div class="footer-right">
            ID: {{ $uuid }}
        </div>
    </div>

    <!-- Main content -->
    <div class="content">
        <div class="cert-label">Certificate of Completion</div>

        <div class="cert-title">Certificate of Achievement</div>

        <div class="cert-presented">This is proudly presented to</div>

        <div class="divider"></div>

        <div class="recipient-name">{{ $name }}</div>

        <div class="cert-body">for successfully completing the course</div>

        <div class="course-title">{{ $course_title }}</div>

        <div class="meta-row">
            <div class="meta-col">
                <div class="meta-label">Completion Date</div>
                <div class="meta-line"></div>
                <div class="meta-value">{{ $completed_at }}</div>
            </div>
            <div class="meta-col">
                <div class="meta-label">Certificate ID</div>
                <div class="meta-line"></div>
                <div class="meta-value" style="font-size:7pt; font-family: 'DejaVu Sans Mono', monospace;">{{ $uuid }}</div>
            </div>
            <div class="meta-col">
                <div class="meta-label">Verify At</div>
                <div class="meta-line"></div>
                <div class="meta-value" style="font-size:7pt;">{{ $verify_url }}</div>
            </div>
        </div>
    </div>

</div>
</body>
</html>
