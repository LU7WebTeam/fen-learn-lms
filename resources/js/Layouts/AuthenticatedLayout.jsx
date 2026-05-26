import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Menu, GraduationCap, User } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/Components/ui/sheet';
import { Button } from '@/Components/ui/button';
import UserMenu from '@/Components/UserMenu';
import LangSwitcher from '@/Components/LangSwitcher';
import ThemeToggleButton from '@/Components/ThemeToggleButton';
import AnalyticsTracker from '@/Components/AnalyticsTracker';
import { useT } from '@/lib/i18n';
import { useState, useEffect } from 'react';

function MobileNavItems() {
    const t = useT();
    const linkClass = 'flex items-center gap-3 px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md';
    return (
        <>
            <Link href={route('dashboard')} className={linkClass}>
                <LayoutDashboard className="h-4 w-4" />
                {t('nav.my_dashboard')}
            </Link>
            <Link href={route('profile.edit')} className={linkClass}>
                <User className="h-4 w-4" />
                {t('nav.profile')}
            </Link>
        </>
    );
}

export default function AuthenticatedLayout({ children }) {
    const t = useT();
    const { platform } = usePage().props;
    const platformName = platform?.name || 'Free LMS';
    const platformLogoUrl = platform?.logo_url || null;
    const platformDarkLogoUrl = platform?.logo_dark_url || null;
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#eceff3] text-[#0f1115] dark:bg-[#0b1020] dark:text-slate-100">
            <AnalyticsTracker />

            <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
                <div className={`w-full rounded-2xl px-6 py-4 text-white shadow-[0_18px_45px_-28px_rgba(0,0,0,0.9)] backdrop-blur-md transition-colors duration-300 sm:px-7 ${isScrolled ? 'bg-[#1f1437]/95' : 'bg-[#2a1548]/85'}`}>
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-6">
                            <Link href={route('home')}>
                                {(platformDarkLogoUrl || platformLogoUrl) ? (
                                    <img src={platformDarkLogoUrl || platformLogoUrl} alt={platformName} className="h-[24px] w-auto object-contain sm:h-[30px]" />
                                ) : (
                                    <span className="text-xl font-black tracking-tight">{platformName}</span>
                                )}
                            </Link>
                            <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex">
                                <Link href={route('dashboard')} className="flex items-center gap-1.5 text-white/90 transition hover:text-white">
                                    <LayoutDashboard className="h-4 w-4" />
                                    {t('nav.my_dashboard')}
                                </Link>
                                <Link href={route('profile.edit')} className="flex items-center gap-1.5 text-white transition hover:text-white">
                                    <User className="h-4 w-4" />
                                    {t('nav.profile')}
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center gap-3">
                            <ThemeToggleButton className="h-9 w-9 text-white hover:bg-white/10 hover:text-white focus-visible:text-white active:text-white" />
                            <div className="hidden sm:block">
                                <LangSwitcher className="border-white bg-white text-[#131722]" />
                            </div>
                            <UserMenu />
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 lg:hidden">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-72">
                                    <Link href={route('home')} className="flex items-center gap-2 pb-4 font-bold text-foreground">
                                        {platformLogoUrl ? (
                                            <img src={platformLogoUrl} alt={platformName} className="h-7 w-auto" />
                                        ) : (
                                            <GraduationCap className="h-6 w-6 text-primary" />
                                        )}
                                    </Link>
                                    <nav className="flex flex-col gap-1">
                                        <MobileNavItems />
                                    </nav>
                                </SheetContent>
                            </Sheet>
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
