import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { Toaster } from '@/Components/ui/toaster';
import { ThemeProvider } from '@/Components/ThemeProvider';
import AccessibilityHelper from '@/Components/AccessibilityHelper';

const appName = import.meta.env.VITE_APP_NAME || 'Free LMS';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        function RootApp() {
            const [locale, setLocale] = useState(props?.initialPage?.props?.locale ?? 'en');

            useEffect(() => {
                const stopListening = router.on('success', (event) => {
                    setLocale(event?.detail?.page?.props?.locale ?? 'en');
                });

                return () => {
                    if (typeof stopListening === 'function') {
                        stopListening();
                    }
                };
            }, []);

            return (
                <ThemeProvider>
                    <App {...props} />
                    <AccessibilityHelper locale={locale} />
                    <Toaster />
                </ThemeProvider>
            );
        }

        root.render(
            <RootApp />
        );
    },
    progress: {
        color: '#4B5563',
    },
});
