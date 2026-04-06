import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronDown,
    Clock,
    BookOpen,
    Award,
    CheckCircle,
} from 'lucide-react';
import LangSwitcher from '@/Components/LangSwitcher';
import { useT } from '@/lib/i18n';
import { useEffect, useState } from 'react';

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
    { iconSrc: '/images/cashflow.svg', titleKey: 'landing.learn.item1.title', descKey: 'landing.learn.item1.desc', iconBg: '#95C93D' },
    { iconSrc: '/images/debt.svg', titleKey: 'landing.learn.item2.title', descKey: 'landing.learn.item2.desc', iconBg: '#F26723' },
    { iconSrc: '/images/building-wealth.svg', titleKey: 'landing.learn.item3.title', descKey: 'landing.learn.item3.desc', iconBg: '#0651A0' },
    { iconSrc: '/images/risk-management.svg', titleKey: 'landing.learn.item4.title', descKey: 'landing.learn.item4.desc', iconBg: '#FDB930' },
    { iconSrc: '/images/digital-financial-literacy.svg', titleKey: 'landing.learn.item5.title', descKey: 'landing.learn.item5.desc', iconBg: '#B63393' },
];

const FAQ_ITEMS = [
    { qKey: 'landing.faq.item1.q', aKey: 'landing.faq.item1.a' },
    { qKey: 'landing.faq.item2.q', aKey: 'landing.faq.item2.a' },
    { qKey: 'landing.faq.item3.q', aKey: 'landing.faq.item3.a' },
    { qKey: 'landing.faq.item4.q', aKey: 'landing.faq.item4.a' },
    { qKey: 'landing.faq.item5.q', aKey: 'landing.faq.item5.a' },
];

export default function Home() {
    const { auth, platform, locale } = usePage().props;
    const platformName = platform?.name || 'sorted';
    const platformDarkLogoUrl = platform?.logo_dark_url || platform?.logo_url || null;
    const t = useT();
    const posterLang = locale === 'ms' ? 'BM' : 'ENG';
    const posterSrc = posterLang === 'BM'
        ? '/images/FEN_PROAKTIF_20_BM.webp'
        : '/images/FEN_PROAKTIF_20_ENG.webp';
    const firstLearnItem = LEARN_ITEMS[0];
    const [isScrolled, setIsScrolled] = useState(false);
    const softCardTint = '#ffffff';

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        entry.target.addEventListener('animationend', () => {
                            entry.target.classList.remove('anim-card', 'in-view');
                            entry.target.style.opacity = '1';
                        }, { once: true });
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08 }
        );
        document.querySelectorAll('.anim-card').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const onScroll = () => {
            setIsScrolled(window.scrollY > 24);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#eceff3] text-[#0f1115] font-['Inter',sans-serif]">
            <Head title={platformName}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Young+Serif&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <style>{`
                .card-raise {
                    transition: transform 240ms ease, box-shadow 240ms ease;
                }

                .hero-home-bg {
                    background-image:
                        linear-gradient(180deg, rgba(7,8,11,0.12) 0%, rgba(7,8,11,0.35) 45%, rgba(7,8,11,0.78) 78%, rgba(7,8,11,0.92) 100%),
                        url('/images/FEN-Learn-hero-v2-mobile.webp');
                    background-size: cover;
                    background-position: center top;
                    background-repeat: no-repeat;
                    background-color: #0b1017;
                }

                .hero-home-content {
                    padding-top: 250px;
                }

                @media (min-width: 768px) {
                    .hero-home-bg {
                        background-image:
                            linear-gradient(180deg, rgba(7,8,11,0.08) 0%, rgba(7,8,11,0.28) 46%, rgba(7,8,11,0.7) 76%, rgba(7,8,11,0.9) 100%),
                            url('/images/FEN-Learn-hero-v2-desktop.webp');
                        background-size: cover;
                        background-position: center;
                        background-repeat: no-repeat;
                    }

                    .hero-home-content {
                        padding-top: 200px;
                    }
                }

                .card-raise:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 16px 36px -24px rgba(15, 17, 21, 0.65);
                }

                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(22px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .anim-card {
                    opacity: 0;
                }

                .anim-card.in-view {
                    animation: fadeSlideUp 0.75s ease forwards;
                }
            `}</style>

            <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
                <div className={`w-full rounded-2xl px-6 py-4 text-white shadow-[0_18px_45px_-28px_rgba(0,0,0,0.9)] backdrop-blur-md transition-colors duration-300 sm:px-7 ${isScrolled ? 'bg-black/45' : 'bg-black/30'}`}>
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-6">
                            {platformDarkLogoUrl ? (
                                <img src={platformDarkLogoUrl} alt={platformName} className="h-[24px] w-auto object-contain sm:h-[30px]" />
                            ) : (
                                <span className="text-3xl font-black tracking-tight">{platformName}</span>
                            )}
                            <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex">
                                <a href="#proaktif" className="opacity-95 transition hover:opacity-100">{t('landing.nav.proaktif')}</a>
                                <a href="#why-fen" className="opacity-80 transition hover:opacity-100">{t('landing.nav.why_fen')}</a>
                                <a href="#faq" className="opacity-80 transition hover:opacity-100">{t('landing.nav.faq')}</a>
                            </nav>
                        </div>

                        <div className="flex items-center gap-3 text-sm font-semibold">
                            <a href="https://www.fenetwork.my" target="_blank" rel="noopener noreferrer" className="hidden sm:block">
                                <img src="/images/fen-logo-.png" alt="FEN Network" className="h-7 w-auto" />
                            </a>
                            <div className="hidden sm:block">
                                <LangSwitcher className="border-white bg-white text-[#131722]" />
                            </div>
                            {auth?.user ? (
                                <Link href={route('courses.show', 'fen-proaktif')} className="inline-flex min-w-[132px] items-center justify-center rounded-full bg-[#b53391] px-4 py-2 font-['Inter',sans-serif] text-[1rem] font-semibold text-white transition hover:bg-[#9f2c80] sm:min-w-[160px] sm:px-5 sm:py-2.5">
                                    {t('landing.cta.my_dashboard')}
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="hidden opacity-90 transition hover:opacity-100 sm:inline-flex">
                                        {t('landing.cta.login')}
                                    </Link>
                                    <Link href={route('register')} className="inline-flex min-w-[132px] items-center justify-center rounded-full bg-[#b53391] px-4 py-2 font-['Inter',sans-serif] text-[1rem] font-semibold text-white transition hover:bg-[#9f2c80] sm:min-w-[160px] sm:px-5 sm:py-2.5">
                                        {t('landing.cta.register')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <section className="-mt-[84px] w-full px-4 pt-4 sm:px-6 lg:px-8">
                <div
                    className="hero-home-bg relative min-h-[70vh] overflow-hidden rounded-2xl"
                >
                    <div className="hero-home-content relative z-10 flex min-h-[70vh] w-full items-end px-6 pb-8 sm:px-8 sm:pb-12 lg:px-10">
                        <div className="max-w-full sm:max-w-[70%]">
                            <h1 className="font-['Inter',sans-serif] text-4xl font-extrabold leading-[0.95] text-white sm:text-6xl">
                            {t('landing.hero.title', { platform: platformName })}
                            </h1>
                            <p className="mt-5 text-lg font-semibold text-white/95">
                                {t('landing.hero.subtitle')}
                            </p>
                            <p className="mt-3 hidden text-base leading-relaxed text-white/85 sm:block sm:text-lg">
                                {t('landing.hero.description', { platform: platformName })}
                            </p>
                            <div className="mt-7">
                                <Link
                                    href={route('register')}
                                    className="inline-flex min-w-[160px] items-center justify-center rounded-full bg-[#b53391] px-5 py-2.5 font-['Inter',sans-serif] text-[1rem] font-semibold text-white transition hover:bg-[#9f2c80]"
                                >
                                    {t('landing.cta.register_free')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="mx-auto w-full max-w-[1440px] p-0">

                <section id="proaktif" className="mt-4 space-y-4 rounded-xl bg-[#ebedf1] p-4 scroll-mt-24 sm:p-5">
                    <div className="grid gap-4 lg:grid-cols-12">
                        <article
                            className="card-raise anim-card rounded-xl p-8 lg:col-span-6"
                            style={{
                                animationDelay: '0ms',
                                background: softCardTint,
                            }}
                        >
                            
                            <h2 className="mt-2 font-['Inter',sans-serif] text-4xl font-extrabold leading-[0.95] text-[#131722] sm:text-5xl">
                                {t('landing.spotlight.title')}
                            </h2>
                            <h4 className="mt-5 font-['Inter',sans-serif] text-2xl font-extrabold leading-tight text-[#2a3140] sm:text-3xl">
                                {t('landing.spotlight.highlight')}
                            </h4>
                            <p className="mt-3 text-[#505765]">{t('landing.spotlight.p1')}</p>
                            <p className="mt-3 text-[#505765]">{t('landing.spotlight.p2')}</p>
                            <p className="mt-3 text-[#505765]">{t('landing.spotlight.p3')}</p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href={route('register')}
                                    className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-full bg-[#b53391] px-5 py-2.5 font-['Inter',sans-serif] text-[1rem] font-semibold text-white transition hover:bg-[#9f2c80]"
                                >
                                    {t('landing.cta.register_enroll')}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href={route('courses.show', 'fen-proaktif')}
                                    className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-full bg-[#0353a1] px-5 py-2.5 font-['Inter',sans-serif] text-[1rem] font-semibold text-white transition hover:bg-[#024180]"
                                >
                                    {t('landing.cta.view_course')}
                                </Link>
                            </div>
                        </article>
                        <article className="card-raise anim-card overflow-hidden rounded-xl bg-[#c7dbe5] lg:col-span-6" style={{ animationDelay: '100ms' }}>
                            <img
                                src="/images/proaktif-01.webp"
                                alt="Proaktif 2.0"
                                className="h-full w-full object-cover"
                            />
                        </article>
                    </div>

                    <section id="learn" className="space-y-4 scroll-mt-24">
                        <div className="grid gap-4 lg:grid-cols-4">
                            <article
                                className="card-raise anim-card rounded-xl p-8 text-white lg:col-span-3"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(90deg, rgba(17,24,39,0.86) 0%, rgba(17,24,39,0.7) 48%, rgba(17,24,39,0.45) 100%), url(/images/wywl-01.webp)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    animationDelay: '0ms',
                                }}
                            >
                                <h3 className="mt-2 font-['Inter',sans-serif] text-4xl font-extrabold leading-[0.95] text-white sm:text-5xl">
                                    {t('landing.learn.title')}
                                </h3>
                                    <p className="mt-2 text-sm text-[#5b6070]">
                                        {t('landing.faq.help_contact')}{' '}
                                        <a href="mailto:learn@fenetwork.my" className="font-semibold text-[#b53391] hover:text-[#9f2c80]">
                                            learn@fenetwork.my
                                        </a>
                                    </p>
                                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/85 sm:text-base">
                                    {t('landing.learn.subtitle')}
                                </p>
                            </article>

                            <article
                                className="card-raise anim-card rounded-xl p-6"
                                style={{
                                    animationDelay: '100ms',
                                    background: softCardTint,
                                }}
                            >
                                <div className="inline-flex h-[80px] w-[80px] items-center justify-center rounded-full p-[15px]" style={{ backgroundColor: firstLearnItem.iconBg }}>
                                    <img
                                        src={firstLearnItem.iconSrc}
                                        alt={t(firstLearnItem.titleKey)}
                                        className="h-[50px] w-[50px] object-contain brightness-0 invert"
                                    />
                                </div>
                                <h4 className="mt-2 font-['Inter',sans-serif] text-2xl font-extrabold leading-tight text-[#1a1f2b]">
                                    {t(firstLearnItem.titleKey)}
                                </h4>
                                <p className="mt-3 text-base leading-relaxed text-[#545c6b]">
                                    {t(firstLearnItem.descKey)}
                                </p>
                            </article>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {LEARN_ITEMS.slice(1).map((item, i) => {
                                return (
                                    <article
                                        key={item.titleKey}
                                        className="card-raise anim-card rounded-xl p-6"
                                        style={{
                                            animationDelay: `${i * 100}ms`,
                                            background: softCardTint,
                                        }}
                                    >
                                        <div className="inline-flex h-[80px] w-[80px] items-center justify-center rounded-full p-[15px]" style={{ backgroundColor: item.iconBg }}>
                                            <img
                                                src={item.iconSrc}
                                                alt={t(item.titleKey)}
                                                className="h-[50px] w-[50px] object-contain brightness-0 invert"
                                            />
                                        </div>
                                        <h4 className="mt-2 font-['Inter',sans-serif] text-2xl font-extrabold leading-tight text-[#1a1f2b]">
                                            {t(item.titleKey)}
                                        </h4>
                                        <p className="mt-3 text-base leading-relaxed text-[#545c6b]">
                                            {t(item.descKey)}
                                        </p>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section
                        id="why-fen"
                        className="!mt-10 rounded-xl p-4 scroll-mt-24 sm:p-5"
                        style={{
                            background:
                                'radial-gradient(circle at 88% 22%, rgba(255,160,106,0.28) 0 14%, transparent 15%), radial-gradient(circle at 83% 70%, rgba(255,120,70,0.24) 0 11%, transparent 12%), linear-gradient(130deg, #f26a17, #d6599d)',
                        }}
                    >
                        <div className="grid items-center gap-5 border-b border-white/25 pb-4 md:grid-cols-[1fr,260px]">
                            <div>
                                <h2 className="font-['Inter',sans-serif] text-4xl font-extrabold text-white sm:text-5xl">{t('landing.features.title')}</h2>
                                <p className="mt-2 max-w-3xl text-base text-white/80">{t('landing.features.subtitle')}</p>
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=700&q=80"
                                alt="Why choose FEN Learning"
                                className="hidden h-[160px] w-full rounded-2xl object-cover md:block"
                            />
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            {FEATURE_ITEMS.map((item, i) => {
                                const Icon = item.icon;

                                return (
                                    <article key={item.titleKey} className="card-raise anim-card overflow-hidden rounded-xl bg-white p-6" style={{ animationDelay: `${i * 100}ms` }}>
                                        <div className="inline-flex h-[56px] w-[56px] items-center justify-center rounded-2xl bg-slate-100">
                                            <Icon className={`h-7 w-7 ${item.iconClassName}`} />
                                        </div>
                                        <h3 className="mt-4 font-['Inter',sans-serif] text-2xl font-extrabold leading-tight text-[#1a1f2b]">
                                            {t(item.titleKey)}
                                        </h3>
                                        <p className="mt-3 text-base leading-relaxed text-[#545c6b]">{t(item.descKey)}</p>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section id="faq" className="!mt-10 scroll-mt-24">
                        <div className="grid gap-4 lg:grid-cols-12">
                            <article
                                className="card-raise anim-card rounded-xl p-8 text-white lg:col-span-4"
                                style={{
                                    animationDelay: '0ms',
                                    background: 'linear-gradient(90deg, #4d45d6 0%, #924fef 100%)',
                                }}
                            >
                                <h2 className="mt-2 font-['Inter',sans-serif] text-4xl font-extrabold leading-[0.95] text-white sm:text-5xl">
                                    {t('landing.faq.title')}
                                </h2>
                                <p className="mt-3 text-base leading-relaxed text-white/85">
                                    {t('landing.faq.subtitle')}
                                </p>
                                <p className="mt-3 text-sm text-white/90">
                                    {t('landing.faq.help_contact')}{' '}
                                    <a href="mailto:learn@fenetwork.my" className="font-semibold text-white underline underline-offset-2 hover:text-white/90">
                                        learn@fenetwork.my
                                    </a>
                                </p>
                            </article>

                            <article className="card-raise anim-card rounded-xl bg-white p-4 lg:col-span-8 sm:p-5" style={{ animationDelay: '100ms' }}>
                                <div className="space-y-3">
                                    {FAQ_ITEMS.map((item) => (
                                        <details
                                            key={item.qKey}
                                            className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 [&_summary::-webkit-details-marker]:hidden"
                                        >
                                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4">
                                                <span className="font-['Inter',sans-serif] text-xl font-extrabold leading-tight text-[#1a1f2b]">
                                                    {t(item.qKey)}
                                                </span>
                                                <ChevronDown className="h-5 w-5 shrink-0 text-slate-500 transition group-open:rotate-180" />
                                            </summary>
                                            <div className="whitespace-pre-line border-t border-slate-200 px-4 py-4 text-base leading-relaxed text-[#545c6b]">
                                                {t(item.aKey)}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </article>
                        </div>
                    </section>
                </section>

            </main>

            <footer className="mt-4 w-full px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8">
                <div className="w-full rounded-2xl bg-[#17191f] px-6 py-7 text-[#d4d8e2] sm:px-8">
                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div className="flex items-center gap-3 text-sm">
                            {platformDarkLogoUrl ? (
                                <img src={platformDarkLogoUrl} alt={platformName} className="h-[24px] w-auto object-contain sm:h-[30px]" />
                            ) : (
                                <span className="text-lg font-bold text-white">{platformName.charAt(0)}</span>
                            )}
                            {!platformDarkLogoUrl && <span className="text-[#4a5060]">|</span>}
                            <span className="text-[#b8bdc8]">&copy; {new Date().getFullYear()} {platformName}. {t('common.all_rights_reserved')}</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                            <a href="https://www.fenetwork.my" target="_blank" rel="noreferrer" className="text-[#b8bdc8] transition hover:text-white">{t('landing.footer.about_fen')}</a>
                            <Link href={route('terms')} className="text-[#b8bdc8] transition hover:text-white">{t('landing.footer.terms')}</Link>
                            <Link href={route('privacy')} className="text-[#b8bdc8] transition hover:text-white">{t('landing.footer.privacy')}</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
