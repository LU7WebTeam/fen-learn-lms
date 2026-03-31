import { Head, Link, usePage } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';
import LangSwitcher from '@/Components/LangSwitcher';
import { useT } from '@/lib/i18n';

function Section({ title, children }) {
    return (
        <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
        </section>
    );
}

export default function Privacy() {
    const { platform, auth, locale } = usePage().props;
    const name = platform?.name || 'FEN Learn';
    const website = 'fen-learn.fenetwork.my';
    const country = 'Malaysia';
    const updatedOn = '16 March 2026';
    const t = useT();

    return (
        <>
            <Head>
                <title>{t('privacy.title', { name })}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Lexend:wght@300..700&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-white font-['Lexend',sans-serif] text-slate-600">
                <nav className="flex justify-between items-center py-5 px-8 max-w-7xl mx-auto bg-white">
                    <Link href="/" className="flex items-center gap-2">
                        {platform?.logo_url ? (
                            <div className="w-10 h-10 overflow-hidden flex items-center justify-center">
                                <img src={platform.logo_url} alt={name} className="w-full h-full object-contain" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                        )}
                        <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-slate-900 text-xl">
                            {name}
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 font-medium">
                        <Link href={route('about')} className="hover:text-slate-900 transition">{t('nav.about')}</Link>
                        <Link href={route('courses.index')} className="hover:text-slate-900 transition">{t('nav.catalog')}</Link>
                        <Link href={route('terms')} className="hover:text-slate-900 transition">{t('nav.terms')}</Link>
                        <Link href={route('privacy')} className="hover:text-slate-900 transition">{t('nav.privacy')}</Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <LangSwitcher />
                        {auth?.user ? (
                            <Link href={route('dashboard')} className="bg-primary text-white px-6 py-2.5 rounded-full hover:bg-primary/90 transition font-medium">
                                {t('dashboard.title')}
                            </Link>
                        ) : (
                            <div className="flex gap-4 items-center">
                                <Link href={route('login')} className="font-medium hover:text-slate-900 hidden sm:block">
                                    {t('auth.login.submit')}
                                </Link>
                                <Link href={route('register')} className="bg-primary text-white px-6 py-2.5 rounded-full hover:bg-primary/90 transition font-medium">
                                    {t('landing.cta.register_free', 'Register Free')}
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>

                <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 space-y-10">
                    <div>
                        <h1 className="font-['Bricolage_Grotesque',sans-serif] text-3xl font-bold tracking-tight mb-2 text-slate-900">{t('privacy.heading')}</h1>
                        <p className="text-sm text-slate-500">{t('privacy.last_updated', { updatedOn })}</p>
                    </div>

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
                </main>

                <footer className="bg-slate-900 text-slate-400 py-12 px-8 text-sm mt-16">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            {platform?.logo_url ? (
                                <div className="w-8 h-8 overflow-hidden bg-white/10 rounded p-1">
                                    <img src={platform.logo_url} alt={name} className="w-full h-full object-contain" />
                                </div>
                            ) : (
                                <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-white text-lg">{name.charAt(0)}</span>
                            )}
                            {!platform?.logo_url && <span className="text-slate-500">|</span>}
                            <span>&copy; {new Date().getFullYear()} {name}. {t('common.all_rights_reserved')}</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <Link href={route('about')} className="hover:text-white transition">{t('nav.about')}</Link>
                            <Link href={route('terms')} className="hover:text-white transition">{t('nav.terms')}</Link>
                            <Link href={route('privacy')} className="hover:text-white transition">{t('nav.privacy')}</Link>
                            <span className="w-1 h-1 bg-slate-700 rounded-full hidden md:block"></span>
                            <Link href={route('courses.index')} className="hover:text-white transition font-medium">{t('nav.catalog')}</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
