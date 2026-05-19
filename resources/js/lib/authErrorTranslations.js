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
        'The password field must be at least 8 characters.': 'auth.errors.password_min',
        'The password must contain at least one letter.': 'auth.errors.password_letters',
        'The password field must contain at least one letter.': 'auth.errors.password_letters',
        'The password must contain at least one uppercase and one lowercase letter.': 'auth.errors.password_mixed',
        'The password field must contain at least one uppercase and one lowercase letter.': 'auth.errors.password_mixed',
        'The password must contain at least one symbol.': 'auth.errors.password_symbols',
        'The password field must contain at least one symbol.': 'auth.errors.password_symbols',
        'The name field is required.': 'auth.errors.name_required',
        'The password confirmation does not match.': 'auth.errors.password_confirmation_mismatch',
        'The password field confirmation does not match.': 'auth.errors.password_confirmation_mismatch',
        'The email has already been taken.': 'auth.errors.email_taken',
        'The agree terms field must be accepted.': 'auth.errors.terms_accepted',
        'The terms field must be accepted.': 'auth.errors.terms_accepted',
        'The captcha token field is required.': 'auth.errors.captcha_required',
        'The captcha token field is invalid.': 'auth.errors.captcha_invalid',
        'Captcha verification failed. Please retry. If this keeps happening, try a different browser, disable blockers/VPN, or check your network.': 'auth.errors.captcha_invalid',
    };

    const key = exactMap[normalized];
    if (key) {
        return t(key);
    }

    if (/^The password(?: field)? confirmation does not match\.$/.test(normalized)) {
        return t('auth.errors.password_confirmation_mismatch');
    }

    if (/^The password(?: field)? must be at least \d+ characters\.$/.test(normalized)) {
        return t('auth.errors.password_min');
    }

    if (/^The password(?: field)? must contain at least one letter\.$/.test(normalized)) {
        return t('auth.errors.password_letters');
    }

    if (/^The password(?: field)? must contain at least one uppercase and one lowercase letter\.$/.test(normalized)) {
        return t('auth.errors.password_mixed');
    }

    if (/^The password(?: field)? must contain at least one symbol\.$/.test(normalized)) {
        return t('auth.errors.password_symbols');
    }

    if (/^The email(?: field)? is required\.$/.test(normalized)) {
        return t('auth.errors.email_required');
    }

    if (/^The email(?: field)? must be a valid email address\.$/.test(normalized)) {
        return t('auth.errors.email_invalid');
    }

    if (/^The password(?: field)? is required\.$/.test(normalized)) {
        return t('auth.errors.password_required');
    }

    if (/^The name(?: field)? is required\.$/.test(normalized)) {
        return t('auth.errors.name_required');
    }

    if (/^The email(?: field)? has already been taken\.$/.test(normalized)) {
        return t('auth.errors.email_taken');
    }

    if (/^The (?:agree terms|terms)(?: field)? must be accepted\.$/.test(normalized)) {
        return t('auth.errors.terms_accepted');
    }

    if (/^The captcha token(?: field)? is required\.$/.test(normalized)) {
        return t('auth.errors.captcha_required');
    }

    if (/^The captcha token(?: field)? is invalid\.$/.test(normalized)) {
        return t('auth.errors.captcha_invalid');
    }

    if (normalized.startsWith('Captcha verification failed.')) {
        return t('auth.errors.captcha_invalid');
    }

    if (normalized.startsWith('Too many login attempts.')) {
        const secondsMatch = normalized.match(/(\d+)/);
        const seconds = secondsMatch ? Number(secondsMatch[1]) : undefined;
        return t('auth.errors.too_many_attempts', { seconds: seconds ?? 0 });
    }

    return message;
}
