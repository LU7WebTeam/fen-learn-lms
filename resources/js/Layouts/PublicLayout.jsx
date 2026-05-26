import { Link, usePage } from '@inertiajs/react';
import LangSwitcher from '@/Components/LangSwitcher';
import AnalyticsTracker from '@/Components/AnalyticsTracker';
import { useT } from '@/lib/i18n';
import { useState, useEffect } from 'react';

export default function PublicLayout({ children }) {
    const t = useT();
    const { platform, auth } = usePage().props;
    const platformName = platform?.name || 'FEN Learn';
    const platformDarkLogoUrl = platform?.logo_dark_url || platform?.logo_url || null;
    const [isScrolled, setIsScrolled] = useState(false);
    const [showAuthMenu, setShowAuthMenu] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#eceff3] text-[#0f1115] dark:bg-[#0b1020] dark:text-slate-100">
            <AnalyticsTracker />

            <header className="sticky top-0 z-50 px-5 pt-4 2xl:px-8">
                <div className={`w-full rounded-2xl px-4 py-4 text-white shadow-[0_18px_45px_-28px_rgba(0,0,0,0.9)] backdrop-blur-md transition-colors duration-300 sm:px-7 ${isScrolled ? 'bg-black/60' : 'bg-black/30'}`}>
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-6">
                            <Link href={route('home')}>
                                {platformDarkLogoUrl ? (
                                    <img src={platformDarkLogoUrl} alt={platformName} className="h-[24px] w-auto object-contain sm:h-[30px]" />
                                ) : (
                                    <span className="text-3xl font-black tracking-tight">{platformName}</span>
                                )}
                            </Link>
                            <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex">
                                <Link href={route('terms')} className="opacity-80 transition hover:opacity-100">{t('nav.terms')}</Link>
                                <Link href={route('privacy')} className="opacity-80 transition hover:opacity-100">{t('nav.privacy')}</Link>
                            </nav>
                        </div>

                        <div className="flex items-center gap-3 text-sm font-semibold">
                            <div className="block">
                                <LangSwitcher className="border-white bg-white text-[#131722]" />
                            </div>
                            {auth?.user ? (
                                <Link href={route('dashboard')} className="inline-flex min-w-[118px] items-center justify-center rounded-full bg-[#b53391] px-3.5 py-1.5 text-[0.92rem] font-semibold text-white transition hover:bg-[#9f2c80] sm:min-w-[160px] sm:px-5 sm:py-2.5 sm:text-[1rem]">
                                    {t('landing.cta.my_dashboard')}
                                </Link>
                            ) : (
                                <>
                                    {/* Mobile: dropdown */}
                                    <div className="relative sm:hidden">
                                        {showAuthMenu && (
                                            <div className="fixed inset-0 z-40" onClick={() => setShowAuthMenu(false)} />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setShowAuthMenu(v => !v)}
                                            className="inline-flex items-center gap-1 rounded-full bg-[#b53391] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#9f2c80]"
                                        >
                                            {t('landing.cta.register')} ▾
                                        </button>
                                        {showAuthMenu && (
                                            <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                                                <Link
                                                    href={route('login')}
                                                    className="block px-4 py-2.5 text-sm text-[#131722] transition hover:bg-slate-50"
                                                >
                                                    {t('landing.cta.login')}
                                                </Link>
                                                <div className="border-t border-slate-100" />
                                                <Link
                                                    href={route('register')}
                                                    className="block px-4 py-2.5 text-sm font-semibold text-[#b53391] transition hover:bg-slate-50"
                                                >
                                                    {t('landing.cta.register')}
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                    {/* Desktop: separate */}
                                    <Link href={route('login')} className="hidden opacity-90 transition hover:opacity-100 sm:inline-flex">
                                        {t('landing.cta.login')}
                                    </Link>
                                    <Link href={route('register')} className="hidden items-center justify-center rounded-full bg-[#b53391] font-semibold text-white transition hover:bg-[#9f2c80] sm:inline-flex sm:min-w-[160px] sm:px-5 sm:py-2.5 sm:text-[1rem]">
                                        {t('landing.cta.register')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main>{children}</main>

            <footer className="mt-4 w-full px-5 pb-4 sm:pb-6 2xl:px-8">
                <div className="w-full rounded-2xl bg-[#17191f] px-6 py-7 text-[#d4d8e2] sm:px-8">
                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div className="flex flex-col items-center gap-1 text-center text-sm sm:flex-row sm:gap-3 sm:text-left">
                            {platformDarkLogoUrl ? (
                                <img src={platformDarkLogoUrl} alt={platformName} className="h-[24px] w-auto object-contain sm:h-[30px]" />
                            ) : (
                                <span className="text-lg font-bold text-white">{platformName.charAt(0)}</span>
                            )}
                            {!platformDarkLogoUrl && <span className="hidden text-[#4a5060] sm:inline">|</span>}
                            <span className="text-[#b8bdc8]">&copy; {new Date().getFullYear()} {platformName}. {t('common.all_rights_reserved')}</span>
                        </div>

                        <div className="flex flex-col items-center gap-2 text-sm md:items-end">
                            <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6 md:justify-end">
                                <a href="https://www.fenetwork.my/about/" target="_blank" rel="noreferrer" className="text-[#b8bdc8] transition hover:text-white">{t('landing.footer.about_fen')}</a>
                                <Link href={route('terms')} className="text-[#b8bdc8] transition hover:text-white">{t('landing.footer.terms')}</Link>
                            </div>
                            <p className="text-[#b8bdc8] text-center md:text-right">
                                {t('landing.footer.support_text')}{' '}
                                <a href="mailto:learn@fenetwork.my" className="transition hover:text-white">learn@fenetwork.my</a>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
