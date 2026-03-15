<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found &mdash; {{ config('app.name') }}</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 2rem;
        }
        .card {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 3rem 2.5rem;
            max-width: 480px;
            width: 100%;
            text-align: center;
            box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .code {
            font-size: 5rem;
            font-weight: 800;
            color: #0ea5e9;
            line-height: 1;
            margin-bottom: 1rem;
            letter-spacing: -0.04em;
        }
        h1 { font-size: 1.375rem; font-weight: 700; margin-bottom: 0.75rem; }
        p { color: #64748b; line-height: 1.6; font-size: 0.95rem; margin-bottom: 2rem; }
        .btn {
            display: inline-block;
            background: #111827;
            color: #fff;
            text-decoration: none;
            padding: 0.625rem 1.5rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            transition: background 0.15s;
        }
        .btn:hover { background: #374151; }
    </style>
</head>
<body>
    <div class="card">
        <div class="code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.</p>
        <a href="{{ url('/') }}" class="btn">Go Home</a>
    </div>
</body>
</html>
