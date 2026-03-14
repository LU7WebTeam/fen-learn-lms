import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

const GA_SCRIPT_ID = 'ga4-tracker-script';

export default function AnalyticsTracker() {
    const { url, props } = usePage();
    const analytics = props?.integrations?.analytics ?? {};

    const enabled = analytics.enabled === true;
    const measurementId = analytics.measurement_id ?? '';
    const anonymizeIp = analytics.anonymize_ip !== false;
    const debugMode = analytics.debug_mode === true;

    useEffect(() => {
        if (!enabled || !measurementId) {
            return;
        }

        if (!document.getElementById(GA_SCRIPT_ID)) {
            const script = document.createElement('script');
            script.id = GA_SCRIPT_ID;
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
            document.head.appendChild(script);
        }

        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function gtag() {
            window.dataLayer.push(arguments);
        };

        window.gtag('js', new Date());
    }, [enabled, measurementId]);

    useEffect(() => {
        if (!enabled || !measurementId || typeof window.gtag !== 'function') {
            return;
        }

        window.gtag('config', measurementId, {
            page_path: url,
            anonymize_ip: anonymizeIp,
            debug_mode: debugMode,
            send_page_view: true,
        });
    }, [enabled, measurementId, anonymizeIp, debugMode, url]);

    return null;
}
