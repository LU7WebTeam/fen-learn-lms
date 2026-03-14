import { useEffect, useMemo, useState } from 'react';
import { Accessibility, RotateCcw } from 'lucide-react';
import { Button } from '@/Components/ui/button';

const STORAGE_KEY = 'a11y_preferences_v1';

const DEFAULT_PREFERENCES = {
    fontScale: 1,
    lineHeight: 1.5,
    letterSpacing: 0,
    highContrast: false,
    reducedMotion: false,
    strongFocus: false,
    dyslexicFont: false,
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
    root.dataset.a11yMotion = preferences.reducedMotion ? 'reduced' : 'default';
    root.dataset.a11yFocus = preferences.strongFocus ? 'strong' : 'default';
    root.dataset.a11yFont = preferences.dyslexicFont ? 'dyslexic' : 'default';
}

function formatScale(value) {
    return `${Math.round(value * 100)}%`;
}

export default function AccessibilityHelper() {
    const [open, setOpen] = useState(false);
    const [preferences, setPreferences] = useState(() => readStoredPreferences());

    useEffect(() => {
        applyPreferences(preferences);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    }, [preferences]);

    const canReset = useMemo(() => {
        return JSON.stringify(preferences) !== JSON.stringify(DEFAULT_PREFERENCES);
    }, [preferences]);

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
            <div className="fixed bottom-4 right-4 z-[100]">
                <Button
                    type="button"
                    onClick={() => setOpen(prev => !prev)}
                    className="h-11 w-11 rounded-full shadow-lg"
                    title="Open accessibility helper"
                    aria-label="Open accessibility helper"
                >
                    <Accessibility className="h-5 w-5" />
                </Button>
            </div>

            {open && (
                <div className="fixed bottom-20 right-4 z-[100] w-[320px] rounded-xl border bg-card p-4 shadow-2xl">
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

                    <div className="space-y-4">
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
