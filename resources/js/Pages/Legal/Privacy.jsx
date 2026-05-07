import { Head, Link, usePage } from '@inertiajs/react';
import LangSwitcher from '@/Components/LangSwitcher';
import { useT } from '@/lib/i18n';
import { useEffect, useState } from 'react';

function Section({ title, children }) {
    return (
        <section className="space-y-3 border-t border-[#d9dee8] pt-6 first:border-t-0 first:pt-0">
            <h2 className="text-2xl leading-tight text-[#131722] sm:text-3xl">{title}</h2>
            <div className="space-y-3 text-base leading-relaxed text-[#545c6b]">{children}</div>
        </section>
    );
}

export default function Privacy() {
    const { platform, auth } = usePage().props;
    const name = platform?.name || 'FEN Learn';
    const platformDarkLogoUrl = platform?.logo_dark_url || platform?.logo_url || null;
    const website = 'fen-learn.fenetwork.my';
    const country = 'Malaysia';
    const updatedOn = '16 March 2026';
    const t = useT();
    const [isScrolled, setIsScrolled] = useState(false);
    const [showAuthMenu, setShowAuthMenu] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setIsScrolled(window.scrollY > 24);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <Head title={t('privacy.title', { name })} />

            <div className="min-h-screen bg-[#eceff3] text-[#0f1115]">
                <header className="sticky top-0 z-50 px-5 pt-4 2xl:px-8">
                    <div className={`w-full rounded-2xl px-4 py-4 text-white shadow-[0_18px_45px_-28px_rgba(0,0,0,0.9)] backdrop-blur-md transition-colors duration-300 sm:px-7 ${isScrolled ? 'bg-black/60' : 'bg-black/30'}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-6">
                                <Link href={route('home')} className="inline-flex items-center">
                                    {platformDarkLogoUrl ? (
                                        <img src={platformDarkLogoUrl} alt={name} className="h-[24px] w-auto object-contain sm:h-[30px]" />
                                    ) : (
                                        <span className="text-3xl font-black tracking-tight">{name}</span>
                                    )}
                                </Link>
                                <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex">
                                    <Link href={route('terms')} className="opacity-80 transition hover:opacity-100">{t('nav.terms')}</Link>
                                    <Link href={route('privacy')} className="opacity-95 transition hover:opacity-100">{t('nav.privacy')}</Link>
                                </nav>
                            </div>

                            <div className="flex items-center gap-3 text-sm font-semibold">
                                <a href="https://www.fenetwork.my" target="_blank" rel="noopener noreferrer" className="hidden sm:block">
                                    <img src="/images/fen-logo-.png" alt="FEN Network" className="h-7 w-auto" />
                                </a>
                                <div className="block">
                                    <LangSwitcher className="border-white bg-white text-[#131722]" />
                                </div>
                                {auth?.user ? (
                                    <Link href={route('courses.show', 'fen-proaktif')} className="inline-flex min-w-[118px] items-center justify-center rounded-full bg-[#b53391] px-3.5 py-1.5 text-[0.92rem] font-semibold text-white transition hover:bg-[#9f2c80] sm:min-w-[160px] sm:px-5 sm:py-2.5 sm:text-[1rem]">
                                        {t('landing.cta.my_dashboard')}
                                    </Link>
                                ) : (
                                    <>
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

                <section className="-mt-[84px] w-full px-5 pt-4 2xl:px-8">
                    <div
                        className="relative min-h-[50vh] overflow-hidden rounded-2xl bg-cover bg-center"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 18% 24%, rgba(252,184,47,0.22) 0 10%, transparent 11%), radial-gradient(circle at 78% 30%, rgba(181,51,145,0.2) 0 12%, transparent 13%), linear-gradient(135deg, #1f1437 0%, #2a1548 38%, #5a267c 100%)',
                        }}
                    >
                        <div className="relative z-10 flex min-h-[50vh] w-full items-end px-6 pb-8 pt-[100px] sm:px-8 sm:pb-12 lg:px-10">
                            <div className="max-w-full sm:max-w-[70%]">
                                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75">{t('nav.privacy')}</p>
                                <h1 className="mt-3 text-4xl leading-[0.95] text-white sm:text-6xl">{t('privacy.heading')}</h1>
                                <p className="mt-4 text-base text-white/85 sm:text-lg">{t('privacy.last_updated', { updatedOn })}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <main className="mx-auto w-full max-w-[1440px] p-0">
                    <section className="mt-4 rounded-xl bg-[#ebedf1] p-4 sm:p-5">
                        <article className="rounded-xl bg-white p-6 shadow-[0_18px_45px_-34px_rgba(15,17,21,0.35)] sm:p-8 lg:p-10">
                            <div className="mb-8 space-y-4">
                                <h2 className="text-4xl leading-[0.95] text-[#131722] sm:text-5xl">{t('privacy.heading')}</h2>
                                <p className="text-base leading-relaxed text-[#545c6b]">{t('privacy.last_updated', { updatedOn })}</p>
                                <div className="rounded-xl bg-[#f4f6fa] p-4 text-sm leading-relaxed text-[#545c6b]">
                                    <p><span className="font-semibold text-[#131722]">Website:</span> {website}</p>
                                    <p className="mt-2"><span className="font-semibold text-[#131722]">Jurisdiction:</span> {country}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Section title={t('privacy.section1.title')}>
                                    <p>{t('privacy.section1.body1', { name, website })}</p>
                                    <p>{t('privacy.section1.body2', { country })}</p>
                                </Section>
                                <Section title={t('privacy.section2.title')}>
                                    <p>{t('privacy.section2.body1', { name })}</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>{t('privacy.section2.list1')}</li>
                                        <li>{t('privacy.section2.list2')}</li>
                                        <li>{t('privacy.section2.list3')}</li>
                                        <li>{t('privacy.section2.list4')}</li>
                                        <li>{t('privacy.section2.list5')}</li>
                                    </ul>
                                </Section>
                                <Section title={t('privacy.section3.title')}>
                                    <p>{t('privacy.section3.body1')}</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>{t('privacy.section3.list1')}</li>
                                        <li>{t('privacy.section3.list2')}</li>
                                        <li>{t('privacy.section3.list3')}</li>
                                        <li>{t('privacy.section3.list4')}</li>
                                        <li>{t('privacy.section3.list5')}</li>
                                        <li>{t('privacy.section3.list6')}</li>
                                    </ul>
                                    <p>{t('privacy.section3.body2')}</p>
                                </Section>
                                <Section title={t('privacy.section4.title')}>
                                    <p>{t('privacy.section4.body', { country })}</p>
                                </Section>
                                <Section title={t('privacy.section5.title')}>
                                    <p>{t('privacy.section5.body')}</p>
                                </Section>
                                <Section title={t('privacy.section6.title')}>
                                    <p>{t('privacy.section6.body1')}</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>{t('privacy.section6.list1')}</li>
                                        <li>{t('privacy.section6.list2')}</li>
                                        <li>{t('privacy.section6.list3')}</li>
                                    </ul>
                                    <p>{t('privacy.section6.body2')}</p>
                                </Section>
                                <Section title={t('privacy.section7.title')}>
                                    <p>{t('privacy.section7.body')}</p>
                                </Section>
                                <Section title={t('privacy.section8.title')}>
                                    <p>{t('privacy.section8.body')}</p>
                                </Section>
                                <Section title={t('privacy.section9.title')}>
                                    <p>{t('privacy.section9.body1')}</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>{t('privacy.section9.list1')}</li>
                                        <li>{t('privacy.section9.list2')}</li>
                                        <li>{t('privacy.section9.list3')}</li>
                                        <li>{t('privacy.section9.list4')}</li>
                                    </ul>
                                </Section>
                                <Section title={t('privacy.section10.title')}>
                                    <p>{t('privacy.section10.body', { website })}</p>
                                </Section>
                                <Section title={t('privacy.section11.title')}>
                                    <p>{t('privacy.section11.body', { name, website })}</p>
                                </Section>
                            </div>
                        </article>
                    </section>
                </main>

                <footer className="mt-4 w-full px-5 pb-4 sm:pb-6 2xl:px-8">
                    <div className="w-full rounded-2xl bg-[#17191f] px-6 py-7 text-[#d4d8e2] sm:px-8">
                        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                            <div className="flex flex-col items-center gap-1 text-center text-sm sm:flex-row sm:gap-3 sm:text-left">
                                <Link href={route('home')} className="inline-flex items-center">
                                    {platformDarkLogoUrl ? (
                                        <img src={platformDarkLogoUrl} alt={name} className="h-[24px] w-auto object-contain sm:h-[30px]" />
                                    ) : (
                                        <span className="text-lg font-bold text-white">{name.charAt(0)}</span>
                                    )}
                                </Link>
                                {!platformDarkLogoUrl && <span className="hidden text-[#4a5060] sm:inline">|</span>}
                                <span className="text-[#b8bdc8]">&copy; {new Date().getFullYear()} {name}. {t('common.all_rights_reserved')}</span>
                            </div>

                            <div className="flex flex-col items-center gap-3 text-sm sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6">
                                <a href="https://www.fenetwork.my" target="_blank" rel="noreferrer" className="text-[#b8bdc8] transition hover:text-white">{t('landing.footer.about_fen')}</a>
                                <Link href={route('terms')} className="text-[#b8bdc8] transition hover:text-white">{t('landing.footer.terms')}</Link>
                                <Link href={route('privacy')} className="text-[#b8bdc8] transition hover:text-white">{t('landing.footer.privacy')}</Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
