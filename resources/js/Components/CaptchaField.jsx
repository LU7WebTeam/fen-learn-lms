import { useEffect, useRef } from 'react';
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

        await loadScript(
            `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`,
            `${RECAPTCHA_SCRIPT_PREFIX}${siteKey}`,
        );

        if (!window.grecaptcha) {
            return '';
        }

        await new Promise((resolve) => window.grecaptcha.ready(resolve));
        const token = await window.grecaptcha.execute(siteKey, { action });
        return token || '';
    }

    return '';
}

export default function CaptchaField({ config, action, token, onTokenChange, error }) {
    const containerRef = useRef(null);
    const widgetRef = useRef(null);
    const onTokenChangeRef = useRef(onTokenChange);

    const enabled = isCaptchaEnabled(config, action);

    useEffect(() => {
        onTokenChangeRef.current = onTokenChange;
    }, [onTokenChange]);

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

    if (!enabled) {
        return null;
    }

    return (
        <div className="space-y-2">
            {config.provider === 'turnstile' && <div ref={containerRef} />}
            {config.provider === 'recaptcha' && (
                <p className="text-xs text-gray-500">
                    This form is protected by reCAPTCHA and Google Privacy Policy and Terms of Service apply.
                </p>
            )}
            <input type="hidden" value={token || ''} readOnly />
            <InputError message={error} />
        </div>
    );
}
