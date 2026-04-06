export function translateAuthError(message, t) {
    if (typeof message !== 'string' || message.trim() === '') {
        return message;
    }

    const normalized = message.trim();

    const exactMap = {
        'These credentials do not match our records.': 'auth.errors.invalid_credentials',
        'The email field is required.': 'auth.errors.email_required',
        'The email must be a valid email address.': 'auth.errors.email_invalid',
        'The password field is required.': 'auth.errors.password_required',
        'The password must be at least 8 characters.': 'auth.errors.password_min',
        'The name field is required.': 'auth.errors.name_required',
        'The password confirmation does not match.': 'auth.errors.password_confirmation_mismatch',
        'The email has already been taken.': 'auth.errors.email_taken',
        'The agree terms field must be accepted.': 'auth.errors.terms_accepted',
        'The terms field must be accepted.': 'auth.errors.terms_accepted',
        'The captcha token field is required.': 'auth.errors.captcha_required',
        'The captcha token field is invalid.': 'auth.errors.captcha_invalid',
    };

    const key = exactMap[normalized];
    if (key) {
        return t(key);
    }

    if (normalized.startsWith('Too many login attempts.')) {
        const secondsMatch = normalized.match(/(\d+)/);
        const seconds = secondsMatch ? Number(secondsMatch[1]) : undefined;
        return t('auth.errors.too_many_attempts', { seconds: seconds ?? 0 });
    }

    return message;
}
