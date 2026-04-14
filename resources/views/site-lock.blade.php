<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Protected</title>
    <style>
        * { box-sizing: border-box; }
        html, body { height: 100%; }
        body {
            margin: 0;
            background: #ffffff;
            display: grid;
            place-items: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        form {
            width: min(320px, 90vw);
        }
        input {
            width: 100%;
            height: 42px;
            border: 1px solid #d4d4d8;
            border-radius: 8px;
            padding: 0 12px;
            font-size: 14px;
            outline: none;
        }
        input:focus {
            border-color: #111827;
        }
        button {
            width: 100%;
            margin-top: 10px;
            height: 42px;
            border: 0;
            border-radius: 8px;
            background: #111827;
            color: #ffffff;
            font-size: 14px;
            cursor: pointer;
        }
        .error {
            margin-top: 8px;
            color: #b91c1c;
            font-size: 12px;
            text-align: center;
        }
    </style>
</head>
<body>
    <form method="POST" action="{{ route('site-lock.unlock') }}">
        @csrf
        <input type="password" name="password" placeholder="Password" autofocus required>
        <button type="submit">Enter</button>
        @error('password')
            <div class="error">{{ $message }}</div>
        @enderror
    </form>
</body>
</html>
