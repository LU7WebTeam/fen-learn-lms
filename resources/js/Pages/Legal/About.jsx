import { Head, Link, usePage } from '@inertiajs/react';
import { GraduationCap, BookOpen, Award, Globe } from 'lucide-react';
import LangSwitcher from '@/Components/LangSwitcher';

export default function About() {
    const { platform, auth } = usePage().props;
    const name = platform?.name || 'Free LMS';

    return (
        <>
            <Head>
                <title>{`About — ${name}`}</title>
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
                        <Link href={route('about')} className="hover:text-slate-900 transition">About</Link>
                        <Link href={route('courses.index')} className="hover:text-slate-900 transition">Courses</Link>
                        <Link href={route('terms')} className="hover:text-slate-900 transition">Terms</Link>
                        <Link href={route('privacy')} className="hover:text-slate-900 transition">Privacy</Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <LangSwitcher />
                        {auth?.user ? (
                            <Link href={route('dashboard')} className="bg-primary text-white px-6 py-2.5 rounded-full hover:bg-primary/90 transition font-medium">
                                My Dashboard
                            </Link>
                        ) : (
                            <div className="flex gap-4 items-center">
                                <Link href={route('login')} className="font-medium hover:text-slate-900 hidden sm:block">
                                    Log In
                                </Link>
                                <Link href={route('register')} className="bg-primary text-white px-6 py-2.5 rounded-full hover:bg-primary/90 transition font-medium">
                                    Register Free
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>

                <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
                    <h1 className="font-['Bricolage_Grotesque',sans-serif] text-4xl font-bold tracking-tight mb-4 text-slate-900">About {name}</h1>
                    <p className="text-xl text-slate-600 mb-12 leading-relaxed">
                        {platform?.tagline || 'Free, high-quality learning for everyone.'}
                    </p>

                    <div className="prose prose-gray max-w-none space-y-6 text-slate-600 leading-relaxed">
                        <p>
                            {name} is a free, publicly accessible learning management system built to deliver high-quality educational content without barriers. Our courses cover a wide range of topics, and every learner can access all published content at no cost.
                        </p>
                        <p>
                            We believe that access to knowledge should be universal. Whether you are looking to upskill professionally, explore a new subject, or earn a certificate to demonstrate your learning, this platform is built for you.
                        </p>
                    </div>

                    <div className="mt-14 grid gap-6 sm:grid-cols-3">
                        {[
                            { icon: BookOpen, title: 'Free Courses', desc: 'All published courses are free. No paywalls, no subscriptions.' },
                            { icon: Award, title: 'Earn Certificates', desc: 'Complete a course and automatically receive a PDF certificate.' },
                            { icon: Globe, title: 'Bilingual Content', desc: 'Courses available in English and Bahasa Melayu.' },
                        ].map(({ icon: Icon, title, desc }) => (
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
                        <h2 className="text-xl font-bold text-slate-900">Start learning today</h2>
                        <p className="text-slate-600 text-sm">Join thousands of learners and access free courses right now.</p>
                        <div className="flex gap-3 justify-center flex-wrap">
                            <Link href={route('courses.index')} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                                Browse courses
                            </Link>
                            <Link href={route('register')} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-100 transition-colors">
                                Create account
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
                                <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-white text-lg">{name.charAt(0)}</span>
                            )}
                            {!platform?.logo_url && <span className="text-slate-500">|</span>}
                            <span>&copy; {new Date().getFullYear()} {name}. All rights reserved.</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <Link href={route('about')} className="hover:text-white transition">About</Link>
                            <Link href={route('terms')} className="hover:text-white transition">Terms</Link>
                            <Link href={route('privacy')} className="hover:text-white transition">Privacy</Link>
                            <span className="w-1 h-1 bg-slate-700 rounded-full hidden md:block"></span>
                            <Link href={route('courses.index')} className="hover:text-white transition font-medium">Browse courses</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
