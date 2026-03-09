import { router, usePage } from '@inertiajs/react';

export default function LangSwitcher({ className = '' }) {
    const { locale } = usePage().props;

    function setLocale(l) {
        if (l === locale) return;
        router.post(route('locale.set'), { locale: l }, { preserveScroll: true });
    }

    return (
        <div className={`flex items-center rounded-md border bg-background text-xs font-medium overflow-hidden ${className}`}>
            <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1 transition-colors ${locale === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
                EN
            </button>
            <button
                type="button"
                onClick={() => setLocale('ms')}
                className={`px-2.5 py-1 transition-colors ${locale === 'ms' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
                BM
            </button>
        </div>
    );
}
