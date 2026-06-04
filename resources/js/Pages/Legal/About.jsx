import { Head, Link, usePage } from '@inertiajs/react';
import { GraduationCap, BookOpen, Award, Globe } from 'lucide-react';
import LangSwitcher from '@/Components/LangSwitcher';
import { useT } from '@/lib/i18n';

export default function About() {
    const { platform, auth } = usePage().props;
    const name = platform?.name || 'Free LMS';
    const t = useT();

    const features = [
        { icon: BookOpen, title: t('about.feature1.title'), desc: t('about.feature1.desc') },
        { icon: Award, title: t('about.feature2.title'), desc: t('about.feature2.desc') },
        { icon: Globe, title: t('about.feature3.title'), desc: t('about.feature3.desc') },
    ];

    return (
        <>
            <Head title={t('about.title', { name })} />

            <div className="min-h-screen bg-white text-slate-600">
                <nav className="flex justify-between items-center py-5 px-8 max-w-7xl mx-auto bg-white">
                    <Link href={route('home')} className="flex items-center gap-2">
                        {platform?.logo_url ? (
                            <div className="w-10 h-10 overflow-hidden flex items-center justify-center">
                                <img src={platform.logo_url} alt={name} className="w-full h-full object-contain" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                        )}
                        <span className="font-bold text-slate-900 text-xl">
                            {name}
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 font-medium">
                        <Link href={route('about')} className="hover:text-slate-900 transition">{t('nav.about')}</Link>
                        <Link href={route('terms')} className="hover:text-slate-900 transition">{t('nav.terms')}</Link>
                        <Link href={route('privacy')} className="hover:text-slate-900 transition">{t('nav.privacy')}</Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <a href="https://www.fenetwork.my" target="_blank" rel="noopener noreferrer" className="hidden sm:block">
                            <img src="/images/fen-logo-.png" alt="FEN Network" className="h-10 w-auto" />
                        </a>
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

                <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
                    <h1 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">{t('about.heading', { name })}</h1>
                    <p className="text-xl text-slate-600 mb-12 leading-relaxed">
                        {platform?.tagline || t('about.tagline')}
                    </p>

                    <div className="prose prose-gray max-w-none space-y-6 text-slate-600 leading-relaxed">
                        <p>{t('about.body1', { name })}</p>
                        <p>{t('about.body2')}</p>
                    </div>

                    <div className="mt-14 grid gap-6 sm:grid-cols-3">
                        {features.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                    <Icon className="h-4.5 w-4.5 text-primary" />
                                </div>
                                <h3 className="font-semibold text-sm text-slate-900">{title}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-14 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center space-y-4">
                        <h2 className="text-xl font-bold text-slate-900">{t('about.cta_heading')}</h2>
                        <p className="text-slate-600 text-sm">{t('about.cta_body')}</p>
                        <div className="flex gap-3 justify-center flex-wrap">
                            <Link href={route('courses.index')} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                                {t('about.cta_browse')}
                            </Link>
                            <Link href={route('register')} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-100 transition-colors">
                                {t('about.cta_register')}
                            </Link>
                        </div>
                    </div>
                </main>

                <footer className="bg-slate-900 text-slate-400 py-12 px-8 text-sm mt-16">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            {platform?.logo_url ? (
                                <div className="w-8 h-8 overflow-hidden bg-white/10 rounded p-1">
                                    <img src={platform.logo_url} alt={name} className="w-full h-full object-contain" />
                                </div>
                            ) : (
                                <span className="font-bold text-white text-lg">{name.charAt(0)}</span>
                            )}
                            {!platform?.logo_url && <span className="text-slate-500">|</span>}
                            <span>&copy; {new Date().getFullYear()} {name}. {t('common.all_rights_reserved')}</span>
                        </div>

                        <div className="flex flex-col items-center gap-2 md:items-end">
                            <div className="flex flex-wrap items-center justify-center gap-6 md:justify-end">
                                <Link href={route('about')} className="hover:text-white transition">{t('nav.about')}</Link>
                                <Link href={route('terms')} className="hover:text-white transition">{t('nav.terms')}</Link>
                                <Link href={route('privacy')} className="hover:text-white transition">{t('nav.privacy')}</Link>
                            </div>
                            <p className="text-center md:text-right">
                                {t('landing.footer.support_text')}{' '}
                                <a href="mailto:learn@fenetwork.my" className="hover:text-white transition">learn@fenetwork.my</a>
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
