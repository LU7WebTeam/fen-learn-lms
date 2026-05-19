import { useEffect, useRef, useState } from 'react';
import InputError from '@/Components/InputError';

const TURNSTILE_SCRIPT_ID = 'turnstile-script';
const RECAPTCHA_SCRIPT_PREFIX = 'recaptcha-script-';

function loadScript(src, id) {
    return new Promise((resolve, reject) => {
        const existing = document.getElementById(id);
        if (existing) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

export function isCaptchaEnabled(config, action) {
    if (!config || !config.configured) {
        return false;
    }

    return config.enabled?.[action] === true;
}

export async function resolveCaptchaToken(config, action, existingToken = '') {
    if (!isCaptchaEnabled(config, action)) {
        return '';
    }

    if (config.provider === 'turnstile') {
        return existingToken || '';
    }

    if (config.provider === 'recaptcha') {
        const siteKey = config.site_key;
        if (!siteKey) {
            return '';
        }

        try {
            await loadScript(
                `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`,
                `${RECAPTCHA_SCRIPT_PREFIX}${siteKey}`,
            );
        } catch {
            return '';
        }

        if (!window.grecaptcha) {
            return '';
        }

        try {
            await new Promise((resolve) => window.grecaptcha.ready(resolve));
            const token = await window.grecaptcha.execute(siteKey, { action });
            return token || '';
        } catch {
            return '';
        }
    }

    return '';
}

export default function CaptchaField({ config, action, token, onTokenChange, error, onAvailabilityChange, t }) {
    const containerRef = useRef(null);
    const widgetRef = useRef(null);
    const onTokenChangeRef = useRef(onTokenChange);
    const [loadError, setLoadError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [skipped, setSkipped] = useState(false);

    const enabled = isCaptchaEnabled(config, action);
    const maxRetries = 3; // Allow 3 retry attempts before showing skip option

    const unavailableMessage = t
        ? t('auth.captcha.unavailable')
        : 'Captcha could not be loaded. It may be blocked by your browser or network. Disable blockers, check your connection, then retry.';
    const retryLabel = t ? t('auth.captcha.retry') : 'Retry captcha';

    useEffect(() => {
        onTokenChangeRef.current = onTokenChange;
    }, [onTokenChange]);

    useEffect(() => {
        if (!enabled) {
            onAvailabilityChange?.(true);
            setLoadError(false);
            return;
        }

        setLoadError(false);
        onAvailabilityChange?.(true);
    }, [enabled, action, onAvailabilityChange]);

    useEffect(() => {
        if (!enabled || config.provider !== 'recaptcha' || !config.site_key) {
            return;
        }

        let mounted = true;

        loadScript(
            `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(config.site_key)}`,
            `${RECAPTCHA_SCRIPT_PREFIX}${config.site_key}`,
        )
            .then(() => {
                if (!mounted) {
                    return;
                }

                const available = typeof window.grecaptcha !== 'undefined';
                setLoadError(!available);
                onAvailabilityChange?.(available);
            })
            .catch(() => {
                if (!mounted) {
                    return;
                }
                setLoadError(true);
                onAvailabilityChange?.(false);
                onTokenChangeRef.current('');
            });

        return () => {
            mounted = false;
        };
    }, [enabled, config?.provider, config?.site_key, retryCount, onAvailabilityChange]);

    useEffect(() => {
        if (!enabled || config.provider !== 'turnstile' || !config.site_key || !containerRef.current) {
            return;
        }

        let mounted = true;

        loadScript('https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit', TURNSTILE_SCRIPT_ID)
            .then(() => {
                if (!mounted || !window.turnstile || !containerRef.current) {
                    return;
                }

                setLoadError(false);
                onAvailabilityChange?.(true);

                if (widgetRef.current !== null) {
                    try {
                        window.turnstile.remove(widgetRef.current);
                    } catch {
                        // no-op
                    }
                    widgetRef.current = null;
                }

                widgetRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: config.site_key,
                    callback: (value) => onTokenChangeRef.current(value || ''),
                    'expired-callback': () => onTokenChangeRef.current(''),
                    'error-callback': () => onTokenChangeRef.current(''),
                });
            })
            .catch(() => {
                setLoadError(true);
                onAvailabilityChange?.(false);
                onTokenChangeRef.current('');
            });

        return () => {
            mounted = false;
            if (widgetRef.current !== null && window.turnstile) {
                try {
                    window.turnstile.remove(widgetRef.current);
                } catch {
                    // no-op
                }
            }
            widgetRef.current = null;
        };
    }, [enabled, config?.provider, config?.site_key]);

    useEffect(() => {
        if (!enabled || config?.provider !== 'turnstile') {
            return;
        }

        if (widgetRef.current !== null && window.turnstile && !loadError) {
            try {
                window.turnstile.reset(widgetRef.current);
            } catch {
                // no-op
            }
        }
    }, [loadError, enabled, config?.provider]);

    if (!enabled) {
        return null;
    }

    const canSkip = loadError && retryCount >= maxRetries;

    return (
        <div className="space-y-2">
            {config.provider === 'turnstile' && (
                <>
                    <div ref={containerRef} />
                    <p className="text-xs text-gray-400">
                        Having trouble with the verification? Try refreshing the page or switching to a different browser.
                    </p>
                </>
            )}
            {config.provider === 'recaptcha' && (
                <p className="text-xs text-gray-500">
                    This form is protected by reCAPTCHA and Google Privacy Policy and Terms of Service apply.
                </p>
            )}
            {loadError && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <p>{unavailableMessage}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {retryCount < maxRetries && (
                            <button
                                type="button"
                                className="inline-flex rounded border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100"
                                onClick={() => {
                                    setRetryCount(c => c + 1);
                                    onTokenChangeRef.current('');
                                    setLoadError(false);
                                }}
                            >
                                {retryLabel} ({maxRetries - retryCount} {maxRetries - retryCount === 1 ? 'attempt' : 'attempts'} left)
                            </button>
                        )}
                        {canSkip && !skipped && (
                            <button
                                type="button"
                                className="inline-flex rounded border border-amber-400 bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900 hover:bg-amber-200"
                                onClick={() => {
                                    setSkipped(true);
                                    onTokenChangeRef.current('skipped');
                                    setLoadError(false);
                                }}
                            >
                                Skip verification (continue anyway)
                            </button>
                        )}
                    </div>
                    {skipped && (
                        <p className="mt-2 text-xs text-amber-700 font-medium">
                            ✓ Verification skipped. You may need to verify your email after signup.
                        </p>
                    )}
                </div>
            )}
            <input type="hidden" value={token || ''} readOnly />
            <InputError message={error} />
        </div>
    );
}
