import { usePage } from '@inertiajs/react';
import en from '../i18n/en.json';
import ms from '../i18n/ms.json';

const DICTS = { en, ms };

/**
 * Resolve a translation key for the given locale.
 *
 * Supports simple `{param}` interpolation:
 *   resolve('learn.quiz.answered', 'en', { n: 3, total: 5 })
 *   // → "3/5 answered"
 *
 * Fallback order:
 *   1. Active locale dictionary key
 *   2. English dictionary key
 *   3. `key` itself (safe debug fallback)
 */
export function resolve(key, locale = 'en', params = {}) {
    const dict     = DICTS[locale] ?? DICTS.en;
    const raw      = dict[key] ?? DICTS.en[key] ?? key;
    const entries  = Object.entries(params);
    if (entries.length === 0) return raw;
    return entries.reduce((str, [k, v]) => str.replaceAll(`{${k}}`, String(v)), raw);
}

/**
 * React hook — returns a `t(key, params?)` function pre-bound to the
 * current Inertia locale prop. Use this inside any React component.
 *
 * Usage:
 *   const t = useT();
 *   <button>{t('common.save')}</button>
 *   <p>{t('learn.quiz.answered', { n: answeredCount, total: questions.length })}</p>
 */
export function useT() {
    const { locale } = usePage().props;
    return (key, params) => resolve(key, locale, params ?? {});
}
