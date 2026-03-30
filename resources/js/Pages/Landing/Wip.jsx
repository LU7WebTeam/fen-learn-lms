import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowRight,
    BookOpen,
    ChevronRight,
    CircleHelp,
    Clock3,
    GraduationCap,
    ImageIcon,
    Menu,
    ShieldCheck,
    Sparkles,
    X,
} from 'lucide-react';

const features = [
    {
        title: 'Learn anytime, anywhere',
        body: 'Learn at your own pace with fully flexible online programmes, making financial learning convenient and accessible for everyone.',
    },
    {
        title: 'Enrol anytime, free of charge',
        body: 'There are no fees and no fixed enrolment periods. Begin building essential financial skills, at no cost.',
    },
    {
        title: 'Receive a certificate of participation upon completion of the modules',
        body: 'Earn a certificate that validates your commitment to improving your financial literacy.',
    },
    {
        title: 'Designed by subject matter experts',
        body: 'The content is developed by FEN subject matter experts, ensuring accuracy, quality, and relevance for the target segment.',
    },
];

const modules = [
    {
        title: 'Cash Flow Management',
        body: 'Learn how to keep track of your money so you always know where it is going and stay in control.',
    },
    {
        title: 'Debt Management',
        body: 'Understand how to handle debt wisely and avoid money stress before it starts.',
    },
    {
        title: 'Building Wealth',
        body: 'Discover ways to grow your money over time, even if you are just starting out.',
    },
    {
        title: 'Financial Risk Management',
        body: 'Learn how to protect yourself and your future by managing financial risks confidently.',
    },
    {
        title: 'Digital Financial Literacy',
        body: 'Get smart about money in the digital era from online banking to staying safe from scams.',
    },
];

const faqs = [
    {
        q: 'What do I need to register?',
        a: 'Students: Full name, email, student ID, university or institution, and field of study. Individuals: Full name and email.',
    },
    {
        q: 'What if I forget my password?',
        a: 'You can reset it easily using the Forgot Password option.',
    },
    {
        q: 'Do I need to follow the module order?',
        a: 'Yes, you must complete each module before moving to the next.',
    },
    {
        q: 'What is the passing score?',
        a: 'You need at least 60% to earn a certificate. You may repeat the pre survey and post survey if you have not achieved the required score.',
    },
    {
        q: 'How do I get my certificate?',
        a: 'You can download it from the platform or receive it by email.',
    },
];

function VisualReserve({ label, hint, className = '' }) {
    return (
        <div className={`rounded-2xl border-2 border-dashed border-cyan-300 bg-white/70 p-6 ${className}`}>
            <div className="flex h-full min-h-52 flex-col items-center justify-center text-center">
                <ImageIcon className="mb-3 h-8 w-8 text-cyan-600" />
                <p className="font-heading text-base font-semibold text-slate-900">Reserved Placeholder</p>
                <p className="mt-1 text-sm text-slate-600">{label}</p>
                <p className="mt-2 text-xs text-slate-500">{hint}</p>
            </div>
        </div>
    );
}

export default function WipLanding() {
    const { auth, platform } = usePage().props;
    const [open, setOpen] = useState(false);

    const platformName = platform?.name || 'FEN E-Learning Platform';

    return (
        <div className="min-h-screen bg-[linear-gradient(145deg,#ecfeff_0%,#eef2ff_45%,#f8fafc_100%)] text-slate-900">
            <Head title="WIP Landing Page" />

            <header className="sticky top-0 z-50 border-b border-cyan-100/80 bg-white/75 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-sm">
                            <GraduationCap className="h-5 w-5" />
                        </span>
                        <span className="font-heading text-lg font-bold">{platformName}</span>
                    </Link>

                    <nav className="ml-4 hidden items-center gap-5 text-sm md:flex">
                        <a href="#about" className="text-slate-600 transition hover:text-slate-900">About</a>
                        <a href="#features" className="text-slate-600 transition hover:text-slate-900">Why Choose FEN</a>
                        <a href="#course" className="text-slate-600 transition hover:text-slate-900">Featured Course</a>
                        <a href="#learn" className="text-slate-600 transition hover:text-slate-900">What You Will Learn</a>
                        <a href="#faq" className="text-slate-600 transition hover:text-slate-900">FAQ</a>
                        <Link href={route('courses.index')} className="text-slate-600 transition hover:text-slate-900">Courses</Link>
                    </nav>

                    <div className="ml-auto hidden items-center gap-2 md:flex">
                        {!auth?.user && (
                            <Link href={route('login')} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                                Log In
                            </Link>
                        )}
                        <Link
                            href={auth?.user ? route('dashboard') : route('register')}
                            className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-cyan-500 hover:to-blue-500"
                        >
                            {auth?.user ? 'Go to Dashboard' : 'Register for Free'}
                        </Link>
                    </div>

                    <button
                        type="button"
                        className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200 bg-white md:hidden"
                        onClick={() => setOpen(v => !v)}
                        aria-label="Toggle menu"
                    >
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {open && (
                    <div className="border-t border-cyan-100 bg-white md:hidden">
                        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
                            <a href="#about" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-cyan-50">About</a>
                            <a href="#features" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-cyan-50">Why Choose FEN</a>
                            <a href="#course" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-cyan-50">Featured Course</a>
                            <a href="#learn" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-cyan-50">What You Will Learn</a>
                            <a href="#faq" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-cyan-50">FAQ</a>
                            <Link href={route('courses.index')} className="rounded-lg px-3 py-2 text-sm hover:bg-cyan-50">Courses</Link>
                            {!auth?.user && <Link href={route('login')} className="rounded-lg px-3 py-2 text-sm hover:bg-cyan-50">Log In</Link>}
                            <Link
                                href={auth?.user ? route('dashboard') : route('register')}
                                className="mt-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-2 text-sm font-semibold text-white"
                            >
                                {auth?.user ? 'Go to Dashboard' : 'Register for Free'}
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            <main>
                <section id="hero" className="relative overflow-hidden px-4 pb-12 pt-10 sm:px-6 sm:pt-14 lg:px-8">
                    <div className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
                    <div className="pointer-events-none absolute -right-10 bottom-4 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />

                    <div className="mx-auto grid max-w-7xl items-stretch gap-6 lg:grid-cols-12">
                        <article className="rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl backdrop-blur-sm sm:p-8 lg:col-span-7">
                            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                                <Sparkles className="h-3.5 w-3.5" />
                                Work In Progress Landing Page
                            </span>
                            <h1 className="mt-4 font-heading text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                                Kickstart Your Financial Management Journey with FEN E-Learning Platform
                            </h1>
                            <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
                                Secure and flexible e-learning platform to help you feel more confident to manage your finances.
                            </p>
                            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                                FEN E-Learning Platform is brought to you by the Financial Education Network (FEN), an inter-agency platform comprising institutions and agencies committed to improving the financial literacy of Malaysians.
                            </p>

                            <div className="mt-7 flex flex-wrap items-center gap-3">
                                <Link
                                    href={auth?.user ? route('dashboard') : route('register')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:from-orange-400 hover:to-amber-400"
                                >
                                    Register for Free
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link href={route('courses.index')} className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-white px-5 py-3 text-sm font-medium text-cyan-700 transition hover:bg-cyan-50">
                                    Browse Courses
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </article>

                        <div className="lg:col-span-5">
                            <VisualReserve
                                label="Hero platform poster image"
                                hint="Reserve for a modern LMS screenshot or campaign poster"
                                className="h-full"
                            />
                        </div>
                    </div>
                </section>

                <section id="features" className="px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-7 max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Why Choose FEN</p>
                            <h2 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">Built to be practical, flexible, and free</h2>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {features.map((item) => (
                                <article key={item.title} className="rounded-2xl border border-cyan-100 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-dashed border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        Reserved icon slot
                                    </div>
                                    <h3 className="font-heading text-xl font-bold leading-snug">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.body}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="course" className="px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-12">
                        <article className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm sm:p-8 lg:col-span-7">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Featured Course Spotlight</p>
                            <h2 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">FEN PROAKTIF 2.0</h2>
                            <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
                                FEN PROAKTIF 2.0 is an online financial education programme designed to help young Malaysians build the financial management skills they need for the digital age and the first few years of working life.
                            </p>

                            <blockquote className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-slate-700">
                                "Achieving financial stability is not just about earning more, it is about being in control of what you have."
                            </blockquote>
                            <blockquote className="mt-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-slate-700">
                                "Achieve financial well-being, not burdens, by understanding your cash flow, protecting what matters, and making smarter decisions for your future."
                            </blockquote>
                            <blockquote className="mt-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-slate-700">
                                "FEN PROAKTIF 2.0 helps you build the confidence you need to manage your finances from today onwards."
                            </blockquote>

                            <div className="mt-6">
                                <Link href={route('courses.index')} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-blue-500 hover:to-indigo-500">
                                    View Course / Register and Enrol
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </article>

                        <div className="lg:col-span-5">
                            <VisualReserve
                                label="FEN PROAKTIF 2.0 dynamic course poster"
                                hint="Reserve for key visual image, 4:5 recommended"
                                className="h-full"
                            />
                        </div>
                    </div>
                </section>

                <section id="learn" className="px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl rounded-3xl border border-white/80 bg-white/85 p-6 shadow-xl backdrop-blur-sm sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">Curriculum Overview</p>
                        <h2 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">What You Will Learn</h2>

                        <div className="mt-7 space-y-5">
                            {modules.map((item, idx) => (
                                <article key={item.title} className="relative rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 sm:p-6">
                                    <div className="absolute left-4 top-5 hidden h-[calc(100%-2rem)] w-px bg-indigo-200 sm:block" />
                                    <div className="relative flex gap-4">
                                        <div className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-sm">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-heading text-lg font-bold">{item.title}</h3>
                                            <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.body}</p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="faq" className="px-4 py-12 pb-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-7 text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">FAQs</p>
                            <h2 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h2>
                        </div>

                        <div className="space-y-3">
                            {faqs.map((item) => (
                                <details key={item.q} className="group rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-semibold">
                                        <span>{item.q}</span>
                                        <CircleHelp className="h-4 w-4 shrink-0 text-cyan-600 transition group-open:rotate-45" />
                                    </summary>
                                    <p className="mt-3 pr-6 text-sm leading-relaxed text-slate-700">{item.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-cyan-100 bg-white px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <p className="text-xs text-slate-500">WIP page for planning and iteration only.</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <Link href={route('about')} className="hover:text-slate-900">About</Link>
                        <Link href={route('terms')} className="hover:text-slate-900">Terms</Link>
                        <Link href={route('privacy')} className="hover:text-slate-900">Privacy</Link>
                        <span className="inline-flex items-center gap-1 text-emerald-700"><ShieldCheck className="h-4 w-4" /> Responsive Ready</span>
                        <span className="inline-flex items-center gap-1 text-indigo-700"><Clock3 className="h-4 w-4" /> Work In Progress</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
