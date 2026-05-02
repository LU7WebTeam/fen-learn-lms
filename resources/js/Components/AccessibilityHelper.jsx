import { useEffect, useMemo, useRef, useState } from 'react';
import { Accessibility, RotateCcw } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { resolve } from '@/lib/i18n';

const STORAGE_KEY = 'a11y_preferences_v1';

const DEFAULT_PREFERENCES = {
    fontScale: 1,
    lineHeight: 1.5,
    letterSpacing: 0,
    highContrast: false,
    colorBlindFriendly: false,
    reducedMotion: false,
    strongFocus: false,
    dyslexicFont: false,
    captionsByDefault: false,
    textFirstLearning: false,
};

function readStoredPreferences() {
    if (typeof window === 'undefined') {
        return DEFAULT_PREFERENCES;
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return DEFAULT_PREFERENCES;
        }

        const parsed = JSON.parse(raw);

        return {
            ...DEFAULT_PREFERENCES,
            ...parsed,
        };
    } catch {
        return DEFAULT_PREFERENCES;
    }
}

function applyPreferences(preferences) {
    const root = document.documentElement;

    root.style.setProperty('--a11y-font-scale', String(preferences.fontScale));
    root.style.setProperty('--a11y-line-height', String(preferences.lineHeight));
    root.style.setProperty('--a11y-letter-spacing', `${preferences.letterSpacing}em`);

    root.dataset.a11yContrast = preferences.highContrast ? 'high' : 'default';
    root.dataset.a11yColor = preferences.colorBlindFriendly ? 'friendly' : 'default';
    root.dataset.a11yMotion = preferences.reducedMotion ? 'reduced' : 'default';
    root.dataset.a11yFocus = preferences.strongFocus ? 'strong' : 'default';
    root.dataset.a11yFont = preferences.dyslexicFont ? 'dyslexic' : 'default';
}

function formatScale(value) {
    return `${Math.round(value * 100)}%`;
}

export default function AccessibilityHelper({ locale = 'en' }) {
    const [open, setOpen] = useState(false);
    const [preferences, setPreferences] = useState(() => readStoredPreferences());
    const triggerRef = useRef(null);
    const t = (key, params) => resolve(key, locale, params ?? {});

    useEffect(() => {
        applyPreferences(preferences);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    }, [preferences]);

    const canReset = useMemo(() => {
        return JSON.stringify(preferences) !== JSON.stringify(DEFAULT_PREFERENCES);
    }, [preferences]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const shouldReduce = preferences.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (shouldReduce) {
            return undefined;
        }

        const interval = window.setInterval(() => {
            if (!triggerRef.current) {
                return;
            }

            triggerRef.current.animate(
                [
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-6px)' },
                    { transform: 'translateX(6px)' },
                    { transform: 'translateX(0)' },
                ],
                { duration: 700, easing: 'ease-in-out' },
            );
        }, 30000);

        return () => window.clearInterval(interval);
    }, [preferences.reducedMotion]);

    function updatePreference(key, value) {
        setPreferences(prev => ({
            ...prev,
            [key]: value,
        }));
    }

    function resetPreferences() {
        setPreferences(DEFAULT_PREFERENCES);
    }

    return (
        <>
            <div className="fixed bottom-24 right-4 z-[100] flex flex-col items-center gap-1">
                <Button
                    ref={triggerRef}
                    type="button"
                    onClick={() => setOpen(prev => !prev)}
                    className="h-[70px] w-[70px] rounded-full shadow-lg [&_svg]:!h-[36px] [&_svg]:!w-[36px]"
                    title={t('a11y.helper.open_aria')}
                    aria-label={t('a11y.helper.open_aria')}
                >
                    <Accessibility />
                </Button>
                <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-900 shadow-sm">
                    {t('a11y.helper.trigger_label')}
                </span>
            </div>

            {open && (
                <div className="fixed bottom-4 right-4 top-4 z-[110] flex w-[min(320px,calc(100vw-2rem))] flex-col rounded-xl border bg-card p-4 shadow-2xl sm:bottom-40 sm:top-auto sm:max-h-[calc(100dvh-11rem)]">
                    <div className="mb-4 flex items-start justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-semibold">Accessibility Helper</h3>
                            <p className="text-xs text-muted-foreground">Personalize readability and interaction preferences.</p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpen(false)}
                        >
                            Close
                        </Button>
                    </div>

                    <div className="space-y-4 overflow-y-auto pr-1">
                        <label className="block text-xs font-medium text-muted-foreground">
                            Text Size ({formatScale(preferences.fontScale)})
                            <input
                                type="range"
                                min="0.9"
                                max="1.2"
                                step="0.05"
                                value={preferences.fontScale}
                                onChange={(e) => updatePreference('fontScale', Number(e.target.value))}
                                className="mt-1 w-full"
                            />
                        </label>

                        <label className="block text-xs font-medium text-muted-foreground">
                            Line Height ({preferences.lineHeight.toFixed(1)})
                            <input
                                type="range"
                                min="1.4"
                                max="1.9"
                                step="0.1"
                                value={preferences.lineHeight}
                                onChange={(e) => updatePreference('lineHeight', Number(e.target.value))}
                                className="mt-1 w-full"
                            />
                        </label>

                        <label className="block text-xs font-medium text-muted-foreground">
                            Letter Spacing ({preferences.letterSpacing.toFixed(2)}em)
                            <input
                                type="range"
                                min="0"
                                max="0.08"
                                step="0.01"
                                value={preferences.letterSpacing}
                                onChange={(e) => updatePreference('letterSpacing', Number(e.target.value))}
                                className="mt-1 w-full"
                            />
                        </label>

                        <label className="flex items-center justify-between rounded-md border p-2 text-xs">
                            <span>High contrast mode</span>
                            <input
                                type="checkbox"
                                checked={preferences.highContrast}
                                onChange={(e) => updatePreference('highContrast', e.target.checked)}
                            />
                        </label>

                        <label className="flex items-center justify-between rounded-md border p-2 text-xs">
                            <span>Color-blind friendly colors</span>
                            <input
                                type="checkbox"
                                checked={preferences.colorBlindFriendly}
                                onChange={(e) => updatePreference('colorBlindFriendly', e.target.checked)}
                            />
                        </label>

                        <label className="flex items-center justify-between rounded-md border p-2 text-xs">
                            <span>Reduce motion</span>
                            <input
                                type="checkbox"
                                checked={preferences.reducedMotion}
                                onChange={(e) => updatePreference('reducedMotion', e.target.checked)}
                            />
                        </label>

                        <label className="flex items-center justify-between rounded-md border p-2 text-xs">
                            <span>Stronger focus outlines</span>
                            <input
                                type="checkbox"
                                checked={preferences.strongFocus}
                                onChange={(e) => updatePreference('strongFocus', e.target.checked)}
                            />
                        </label>

                        <label className="flex items-center justify-between rounded-md border p-2 text-xs">
                            <span>Dyslexia-friendly font</span>
                            <input
                                type="checkbox"
                                checked={preferences.dyslexicFont}
                                onChange={(e) => updatePreference('dyslexicFont', e.target.checked)}
                            />
                        </label>

                        <label className="flex items-center justify-between rounded-md border p-2 text-xs">
                            <span>Enable captions by default</span>
                            <input
                                type="checkbox"
                                checked={preferences.captionsByDefault}
                                onChange={(e) => updatePreference('captionsByDefault', e.target.checked)}
                            />
                        </label>

                        <label className="flex items-center justify-between rounded-md border p-2 text-xs">
                            <span>Show learning text before video</span>
                            <input
                                type="checkbox"
                                checked={preferences.textFirstLearning}
                                onChange={(e) => updatePreference('textFirstLearning', e.target.checked)}
                            />
                        </label>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={resetPreferences}
                            disabled={!canReset}
                        >
                            <RotateCcw className="mr-2 h-3.5 w-3.5" />
                            Reset
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
