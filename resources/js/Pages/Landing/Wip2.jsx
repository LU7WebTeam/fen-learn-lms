import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, Award, CheckCircle, Clock, Globe } from 'lucide-react';
import LangSwitcher from '@/Components/LangSwitcher';
import { useT } from '@/lib/i18n';

const FEATURE_ITEMS = [
    {
        icon: Clock,
        iconClassName: 'text-blue-600',
        titleKey: 'landing.features.item1.title',
        descKey: 'landing.features.item1.desc',
    },
    {
        icon: BookOpen,
        iconClassName: 'text-purple-600',
        titleKey: 'landing.features.item2.title',
        descKey: 'landing.features.item2.desc',
    },
    {
        icon: Award,
        iconClassName: 'text-pink-600',
        titleKey: 'landing.features.item3.title',
        descKey: 'landing.features.item3.desc',
    },
    {
        icon: CheckCircle,
        iconClassName: 'text-teal-600',
        titleKey: 'landing.features.item4.title',
        descKey: 'landing.features.item4.desc',
    },
];

const LEARN_ITEMS = [
    { num: '01', titleKey: 'landing.learn.item1.title', descKey: 'landing.learn.item1.desc' },
    { num: '02', titleKey: 'landing.learn.item2.title', descKey: 'landing.learn.item2.desc' },
    { num: '03', titleKey: 'landing.learn.item3.title', descKey: 'landing.learn.item3.desc' },
    { num: '04', titleKey: 'landing.learn.item4.title', descKey: 'landing.learn.item4.desc' },
    { num: '05', titleKey: 'landing.learn.item5.title', descKey: 'landing.learn.item5.desc' },
];

const FAQ_ITEMS = [
    { qKey: 'landing.faq.item1.q', aKey: 'landing.faq.item1.a' },
    { qKey: 'landing.faq.item2.q', aKey: 'landing.faq.item2.a' },
    { qKey: 'landing.faq.item3.q', aKey: 'landing.faq.item3.a' },
    { qKey: 'landing.faq.item4.q', aKey: 'landing.faq.item4.a' },
    { qKey: 'landing.faq.item5.q', aKey: 'landing.faq.item5.a' },
];

export default function Wip2() {
    const { platform, auth, locale } = usePage().props;
    const platformName = platform?.name || 'FEN E-Learning Platform';
    const t = useT();
    const posterLang = locale === 'ms' ? 'BM' : 'ENG';
    const posterSrc = posterLang === 'BM'
        ? '/images/FEN_PROAKTIF_20_BM.webp'
        : '/images/FEN_PROAKTIF_20_ENG.webp';

    return (
        <div className="min-h-screen bg-white font-['Lexend',sans-serif] text-slate-600">
            <Head>
                <title>{platformName}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Lexend:wght@300..700&display=swap" rel="stylesheet" />
            </Head>

            {/* Navbar */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
            <nav className="flex w-full justify-between items-center py-2 px-4">
                <Link href="/" className="flex items-center gap-2">
                    {platform?.logo_url ? (
                        <img src={platform.logo_url} alt={platformName} className="h-8 w-auto object-contain" />
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            {platformName.charAt(0)}
                        </div>
                    )}
                </Link>
                <div className="hidden md:flex items-center gap-8 font-medium">
                    <a href="#proaktif" className="hover:text-slate-900 transition">{t('landing.nav.proaktif')}</a>
                    <a href="#about" className="hover:text-slate-900 transition">{t('landing.nav.about')}</a>
                    <a href="#features" className="hover:text-slate-900 transition">{t('landing.nav.why_fen')}</a>
                    <a href="#faq" className="hover:text-slate-900 transition">{t('landing.nav.faq')}</a>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:block">
                        <LangSwitcher className="bg-white border-slate-200 text-slate-700" />
                    </div>
                    {auth?.user ? (
                        <Link href={route('dashboard')} className="bg-primary text-white px-6 py-2.5 rounded-full hover:bg-primary/90 transition font-medium">
                            {t('landing.cta.my_dashboard')}
                        </Link>
                    ) : (
                        <div className="flex gap-4 items-center">
                            <Link href={route('login')} className="font-medium hover:text-slate-900 hidden sm:block">
                                {t('landing.cta.login')}
                            </Link>
                            <Link href={route('register')} className="bg-primary text-white px-6 py-2.5 rounded-full hover:bg-primary/90 transition font-medium">
                                {t('landing.cta.register')}
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
            </header>

            {/* Hero Section with full-width background image */}
            <style>{`
                .hero-bg { background-image: url('/images/FEN_learn-hero-mobile.webp'); }
                @media (min-width: 768px) {
                    .hero-bg { background-image: url('/images/FEN_learn-hero-desktop.webp'); }
                }
            `}</style>
            <div className="hero-bg w-full bg-cover bg-center bg-no-repeat">
                <section id="home" className="max-w-7xl mx-auto px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Empty left column - lets background image show on desktop */}
                    <div></div>
                    
                    {/* Text on right - with 350px spacing on mobile */}
                    <div className="space-y-6 pt-[200px] md:pt-0">
                        <h1 className="font-['Bricolage_Grotesque',sans-serif] text-4xl md:text-6xl font-extrabold text-primary leading-tight">
                            {t('landing.hero.title', { platform: platformName })}
                        </h1>
                        <p className="text-xl font-medium text-slate-800">
                            {t('landing.hero.subtitle')}
                        </p>
                        <p className="text-lg leading-relaxed text-slate-600">
                            {t('landing.hero.description', { platform: platformName })}
                        </p>
                        <div className="pt-4">
                            <Link href={route('register')} className="inline-block bg-primary text-white px-8 py-3.5 rounded-full hover:bg-primary/90 transition font-medium text-lg shadow-lg shadow-slate-200">
                                {t('landing.cta.register_free')}
                            </Link>
                        </div>
                    </div>
                </section>
            </div>

            {/* Featured Course Spotlight */}
            <section
                id="proaktif"
                className="py-20 scroll-mt-20"
                style={{
                    backgroundColor: '#f8fafc',
                    backgroundImage: "radial-gradient(circle at 15% 15%, rgba(96, 165, 250, 0.18) 0, rgba(96, 165, 250, 0) 35%), radial-gradient(circle at 85% 85%, rgba(129, 140, 248, 0.14) 0, rgba(129, 140, 248, 0) 38%), repeating-linear-gradient(0deg, rgba(148, 163, 184, 0.08) 0, rgba(148, 163, 184, 0.08) 1px, transparent 1px, transparent 36px), repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.08) 0, rgba(148, 163, 184, 0.08) 1px, transparent 1px, transparent 36px)",
                }}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-7 p-1 lg:p-2">
                        <div className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                            {t('landing.spotlight.badge')}
                        </div>
                        <h2 className="mt-4 font-['Bricolage_Grotesque',sans-serif] text-4xl md:text-5xl font-extrabold text-primary">
                            {t('landing.spotlight.title')}
                        </h2>
                        <div className="mt-6 space-y-4 text-slate-600 text-lg">
                            <p>{t('landing.spotlight.p1')}</p>
                            <p className="font-medium text-slate-800 border border-blue-100 bg-blue-50 rounded-2xl px-4 py-3">
                                {t('landing.spotlight.highlight')}
                            </p>
                            <p>{t('landing.spotlight.p2')}</p>
                            <p>{t('landing.spotlight.p3')}</p>
                        </div>
                        <div className="pt-6 flex flex-wrap gap-4">
                            <Link href={route('register')} className="bg-primary text-white px-8 py-3.5 rounded-full hover:bg-primary/90 transition font-medium shadow-md">
                                {t('landing.cta.register_enroll')}
                            </Link>
                            <Link href={route('courses.show', 'fen-proaktif')} className="bg-white text-slate-900 border border-slate-200 px-8 py-3.5 rounded-full hover:bg-slate-50 transition font-medium shadow-sm">
                                {t('landing.cta.view_course')}
                            </Link>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="rounded-3xl overflow-hidden bg-slate-100 shadow-sm">
                            <img
                                src={posterSrc}
                                alt={`Proaktif 2.0 poster (${posterLang})`}
                                className="w-full h-auto object-contain"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* What You Will Learn Section */}
            <section
                className="py-24 px-6 md:px-8"
                style={{
                    backgroundColor: '#f8fafc',
                    backgroundImage: "radial-gradient(circle at 15% 15%, rgba(96, 165, 250, 0.18) 0, rgba(96, 165, 250, 0) 35%), radial-gradient(circle at 85% 85%, rgba(129, 140, 248, 0.14) 0, rgba(129, 140, 248, 0) 38%), repeating-linear-gradient(0deg, rgba(148, 163, 184, 0.08) 0, rgba(148, 163, 184, 0.08) 1px, transparent 1px, transparent 36px), repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.08) 0, rgba(148, 163, 184, 0.08) 1px, transparent 1px, transparent 36px)",
                }}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-4 lg:sticky lg:top-24 self-start">
                            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-4xl lg:text-5xl font-extrabold text-primary">
                                {t('landing.learn.title')}
                            </h2>
                            <p className="mt-4 text-slate-600 text-lg">
                                Build the same Proaktif 2.0 skills highlighted above through five practical focus areas.
                            </p>
                        </div>

                        <div className="lg:col-span-8">
                            {LEARN_ITEMS.map((item, idx) => (
                                <div key={idx} className="flex gap-5 py-6 border-b border-slate-200/70 last:border-b-0">
                                    <div className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 text-white font-bold text-sm">
                                        {item.num}
                                    </div>
                                    <div>
                                        <h3 className="font-['Bricolage_Grotesque',sans-serif] text-2xl font-bold text-secondary">
                                            {t(item.titleKey)}
                                        </h3>
                                        <p className="mt-2 text-base text-slate-600 leading-relaxed">
                                            {t(item.descKey)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 px-6 md:px-8 bg-white scroll-mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                        <div>
                            <div className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold tracking-wide uppercase mb-4">
                                {t('nav.about')}
                            </div>
                            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-4xl md:text-5xl font-extrabold text-primary mb-4">
                                {t('about.heading', { name: platformName })}
                            </h2>
                            <p className="text-xl text-slate-700 mb-8 leading-relaxed">
                                {platform?.tagline || t('about.tagline')}
                            </p>
                            <div className="space-y-4 text-slate-600 text-lg leading-relaxed">
                                <p>{t('about.body1', { name: platformName })}</p>
                                <p>{t('about.body2')}</p>
                            </div>
                            
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: BookOpen, titleKey: 'about.feature1.title', descKey: 'about.feature1.desc' },
                                { icon: Award, titleKey: 'about.feature2.title', descKey: 'about.feature2.desc' },
                                { icon: Globe, titleKey: 'about.feature3.title', descKey: 'about.feature3.desc' },
                            ].map(({ icon: Icon, titleKey, descKey }, idx) => (
                                <div key={idx} className="flex gap-4 items-start rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                                    <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-slate-900">{t(titleKey)}</h3>
                                        <p className="mt-1 text-sm text-slate-600 leading-relaxed">{t(descKey)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16 scroll-mt-20">
                <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-3xl md:rounded-[2.5rem] p-6 md:p-16 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-4xl font-bold text-primary">
                                {t('landing.features.title')}
                            </h2>
                            <p className="text-lg text-slate-700">
                                {t('landing.features.subtitle')}
                            </p>
                            
                        </div>
                        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {FEATURE_ITEMS.map((item, idx) => {
                                const Icon = item.icon;

                                return (
                                    <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
                                        <Icon className={`w-8 h-8 mb-4 ${item.iconClassName}`} />
                                        <h3 className="font-['Bricolage_Grotesque',sans-serif] text-xl font-bold text-secondary mb-2">
                                            {t(item.titleKey)}
                                        </h3>
                                        <p className="text-slate-600">{t(item.descKey)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQs Section */}
            <section
                id="faq"
                className="py-24 px-8 scroll-mt-20"
                style={{
                    backgroundColor: '#0f172a',
                    backgroundImage: "radial-gradient(circle at 20% 20%, rgba(96, 165, 250, 0.08) 0, rgba(96, 165, 250, 0) 40%), radial-gradient(circle at 80% 80%, rgba(129, 140, 248, 0.08) 0, rgba(129, 140, 248, 0) 40%), repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.025) 0, rgba(255, 255, 255, 0.025) 1px, transparent 1px, transparent 36px), repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.025) 0, rgba(255, 255, 255, 0.025) 1px, transparent 1px, transparent 36px)",
                }}
            >
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-['Bricolage_Grotesque',sans-serif] text-4xl font-bold text-white mb-4">
                            {t('landing.faq.title')}
                        </h2>
                        <p className="text-lg text-slate-400">
                            {t('landing.faq.subtitle')}
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                        {FAQ_ITEMS.map((item, idx) => (
                            <details key={idx} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6 text-white">
                                    <span className="font-['Bricolage_Grotesque',sans-serif] text-lg font-bold">{t(item.qKey)}</span>
                                    <span className="transition group-open:rotate-180 text-slate-400">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" w="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="text-slate-300 px-6 pb-6 pt-0 leading-relaxed border-t border-white/10">
                                    {t(item.aKey)}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 px-8 text-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        {platform?.logo_url ? (
                            <div className="w-8 h-8 overflow-hidden bg-white/10 rounded p-1">
                                <img src={platform.logo_url} alt={platformName} className="w-full h-full object-contain" />
                            </div>
                        ) : (
                            <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-white text-lg">{platformName.charAt(0)}</span>
                        )}
                        {!platform?.logo_url && <span className="text-slate-500">|</span>}
                        <span>&copy; {new Date().getFullYear()} {platformName}. {t('common.all_rights_reserved')}</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <Link href={route('about')} className="hover:text-white transition">{t('landing.footer.about')}</Link>
                        <Link href={route('terms')} className="hover:text-white transition">{t('landing.footer.terms')}</Link>
                        <Link href={route('privacy')} className="hover:text-white transition">{t('landing.footer.privacy')}</Link>
                        <span className="w-1 h-1 bg-slate-700 rounded-full hidden md:block"></span>
                        <Link href={route('courses.index')} className="hover:text-white transition font-medium">{t('landing.footer.browse_courses')}</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
