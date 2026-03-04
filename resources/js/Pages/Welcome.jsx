import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    GraduationCap, BookOpen, Shield, TrendingUp, Wallet, Smartphone,
    Clock, Award, Users, ChevronDown, ArrowRight, CheckCircle2,
    BarChart3, Landmark, Coins, Globe, Star, Zap,
} from 'lucide-react';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Heading({ as: Tag = 'h2', className = '', children }) {
    return (
        <Tag className={`font-heading font-bold tracking-tight ${className}`}>
            {children}
        </Tag>
    );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav({ auth }) {
    return (
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-indigo-950/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2.5 shrink-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400">
                        <GraduationCap className="h-5 w-5 text-indigo-950" />
                    </span>
                    <span className="font-heading text-lg font-bold text-white">FENLearn</span>
                </Link>

                <div className="hidden flex-1 items-center gap-6 sm:flex">
                    <a href="#features" className="text-sm font-light text-indigo-200 hover:text-white transition-colors">Features</a>
                    <a href="#topics"   className="text-sm font-light text-indigo-200 hover:text-white transition-colors">Topics</a>
                    <a href="#faq"      className="text-sm font-light text-indigo-200 hover:text-white transition-colors">FAQ</a>
                    <Link href="/courses" className="text-sm font-light text-indigo-200 hover:text-white transition-colors">Courses</Link>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    {auth?.user ? (
                        <Link
                            href={route('dashboard')}
                            className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-indigo-950 hover:bg-amber-300 transition-colors"
                        >
                            My Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="rounded-lg px-4 py-2 text-sm font-light text-indigo-200 hover:text-white transition-colors"
                            >
                                Log In
                            </Link>
                            <Link
                                href={route('register')}
                                className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-indigo-950 hover:bg-amber-300 transition-colors"
                            >
                                Register Free
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ auth }) {
    return (
        <section className="relative overflow-hidden bg-indigo-950 pt-16">
            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-blue-800/10 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
                <div className="mx-auto max-w-3xl text-center">
                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-700 bg-indigo-900/60 px-4 py-1.5 text-sm text-indigo-300">
                        <Zap className="h-3.5 w-3.5 text-amber-400" />
                        FEN Proaktif 2.0 — Now Available
                    </div>

                    <Heading as="h1" className="text-4xl text-white sm:text-5xl lg:text-7xl">
                        Kickstart Your{' '}
                        <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            Financial&nbsp;Management
                        </span>{' '}
                        Journey
                    </Heading>

                    <p className="mt-6 text-lg font-light leading-relaxed text-indigo-200 sm:text-xl">
                        Kuasai Wang Anda, Bina Masa Depan yang Sejahtera.<br />
                        <span className="text-indigo-300/80">
                            Master your money and build a prosperous future — free, flexible, expert-led.
                        </span>
                    </p>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href={auth?.user ? route('dashboard') : route('register')}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-8 py-3.5 text-base font-semibold text-indigo-950 shadow-lg shadow-amber-500/20 hover:bg-amber-300 transition-all hover:shadow-amber-400/30 hover:scale-105"
                        >
                            {auth?.user ? 'Continue Learning' : 'Daftar Sekarang — Free'}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-2 rounded-xl border border-indigo-600 bg-indigo-900/40 px-8 py-3.5 text-base font-light text-indigo-200 hover:bg-indigo-800/60 hover:text-white transition-all"
                        >
                            <BookOpen className="h-4 w-4" />
                            Browse Courses
                        </Link>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm font-light text-indigo-400">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 100% Free</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> No credit card</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Certificate included</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Backed by FEN Network</span>
                    </div>
                </div>
            </div>

            {/* Wave divider */}
            <div className="relative h-16">
                <svg viewBox="0 0 1440 64" className="absolute bottom-0 w-full" preserveAspectRatio="none" aria-hidden>
                    <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" fill="white" />
                </svg>
            </div>
        </section>
    );
}

// ─── USP Bar ─────────────────────────────────────────────────────────────────

const usps = [
    { icon: Clock,   color: 'bg-violet-100 text-violet-600',  title: 'Learn Anytime, Anywhere',       body: 'Self-paced modules that fit your schedule.' },
    { icon: Award,   color: 'bg-amber-100  text-amber-600',   title: 'Free Certificate',               body: 'Earn a certificate of participation upon completion.' },
    { icon: Users,   color: 'bg-emerald-100 text-emerald-600',title: 'Expert-Designed Content',        body: 'Built by certified financial management experts.' },
    { icon: Star,    color: 'bg-rose-100   text-rose-600',    title: 'Enrol Free of Charge',           body: 'No fees, no barriers — open to everyone.' },
];

function USPBar() {
    return (
        <section className="bg-white py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {usps.map(({ icon: Icon, color, title, body }) => (
                        <div key={title} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-6">
                            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                                <Icon className="h-5 w-5" />
                            </span>
                            <div>
                                <Heading as="h3" className="text-sm font-semibold text-slate-900">{title}</Heading>
                                <p className="mt-1 text-xs font-light leading-relaxed text-slate-500">{body}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Bento Features ───────────────────────────────────────────────────────────

function BentoFeatures() {
    return (
        <section id="features" className="bg-slate-50 py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <Heading as="h2" className="text-3xl text-slate-900 sm:text-4xl">
                        Everything you need to take control
                    </Heading>
                    <p className="mt-4 font-light text-slate-500">
                        Designed for Malaysians at every stage of their financial journey.
                    </p>
                </div>

                {/* Bento grid */}
                <div className="grid auto-rows-[200px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    {/* Card 1 — large, spans 2 rows */}
                    <div className="relative row-span-2 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white sm:col-span-1">
                        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
                        <div className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-white/5" />
                        <Wallet className="relative h-10 w-10 text-amber-300" />
                        <Heading as="h3" className="relative mt-4 text-2xl">Cash Flow Management</Heading>
                        <p className="relative mt-3 font-light leading-relaxed text-indigo-200 text-sm">
                            Track income and expenses, build budgets that work, and stop living paycheck-to-paycheck. Learn to manage your money flow with confidence.
                        </p>
                        <div className="relative mt-6 flex gap-2 flex-wrap">
                            <span className="rounded-full bg-white/15 px-3 py-1 text-xs">Budgeting</span>
                            <span className="rounded-full bg-white/15 px-3 py-1 text-xs">Expenses</span>
                            <span className="rounded-full bg-white/15 px-3 py-1 text-xs">Savings</span>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="relative overflow-hidden rounded-3xl bg-amber-400 p-7">
                        <BarChart3 className="h-8 w-8 text-amber-900" />
                        <Heading as="h3" className="mt-3 text-xl text-amber-950">Wealth & Investment</Heading>
                        <p className="mt-2 text-sm font-light leading-relaxed text-amber-800">
                            Grow your assets with smart investment strategies suited for beginners and beyond.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="relative overflow-hidden rounded-3xl bg-emerald-500 p-7 text-white">
                        <Shield className="h-8 w-8 text-emerald-100" />
                        <Heading as="h3" className="mt-3 text-xl">Protection Planning</Heading>
                        <p className="mt-2 text-sm font-light leading-relaxed text-emerald-100">
                            Understand insurance and risk coverage to safeguard what you've built.
                        </p>
                    </div>

                    {/* Card 4 — wide */}
                    <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-7 text-white sm:col-span-2 lg:col-span-1">
                        <Globe className="h-8 w-8 text-sky-400" />
                        <Heading as="h3" className="mt-3 text-xl">Digital Financial Literacy</Heading>
                        <p className="mt-2 text-sm font-light leading-relaxed text-slate-400">
                            Navigate e-wallets, online banking, fintech platforms, and digital scams safely.
                        </p>
                        <div className="mt-4 flex gap-2">
                            <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs text-sky-300">E-Wallets</span>
                            <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs text-sky-300">Fintech</span>
                            <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs text-sky-300">Scam Awareness</span>
                        </div>
                    </div>

                    {/* Card 5 — accent */}
                    <div className="relative overflow-hidden rounded-3xl bg-rose-500 p-7 text-white sm:col-span-1">
                        <Landmark className="h-8 w-8 text-rose-100" />
                        <Heading as="h3" className="mt-3 text-xl">Debt Management</Heading>
                        <p className="mt-2 text-sm font-light leading-relaxed text-rose-100">
                            Strategies to reduce and eliminate debt while building healthy financial habits.
                        </p>
                    </div>

                    {/* Card 6 — certificate highlight */}
                    <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-amber-300 bg-amber-50 p-7 sm:col-span-1">
                        <Award className="h-8 w-8 text-amber-500" />
                        <Heading as="h3" className="mt-3 text-xl text-amber-900">Get Certified</Heading>
                        <p className="mt-2 text-sm font-light leading-relaxed text-amber-700">
                            Complete all modules and earn a verifiable certificate of participation — download or share instantly.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Topics Deep-Dive ─────────────────────────────────────────────────────────

const topics = [
    { icon: Wallet,     label: 'Cash Flow Management',    desc: 'Pengurusan Aliran Tunai',        color: 'from-indigo-500 to-blue-600' },
    { icon: Coins,      label: 'Debt Management',          desc: 'Pengurusan Hutang',              color: 'from-rose-500 to-pink-600' },
    { icon: TrendingUp, label: 'Building Wealth',          desc: 'Pembinaan Aset & Pelaburan',     color: 'from-emerald-500 to-teal-600' },
    { icon: Shield,     label: 'Financial Risk',           desc: 'Pengurusan Risiko Kewangan',     color: 'from-violet-500 to-purple-700' },
    { icon: Smartphone, label: 'Digital Literacy',         desc: 'Literasi Kewangan Digital',      color: 'from-amber-500 to-orange-600' },
];

function Topics() {
    return (
        <section id="topics" className="bg-white py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <Heading as="h2" className="text-3xl text-slate-900 sm:text-4xl">
                        What You'll Learn in&nbsp;
                        <span className="text-indigo-600">FEN Proaktif 2.0</span>
                    </Heading>
                    <p className="mt-4 font-light text-slate-500">
                        Five comprehensive modules. One transformative programme.
                    </p>
                </div>

                {/* Bento — 2 wide on top, 3 below on lg */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {topics.map(({ icon: Icon, label, desc, color }, i) => (
                        <div
                            key={label}
                            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${color} p-8 text-white
                                ${i === 0 ? 'lg:col-span-2' : ''}
                                ${i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
                        >
                            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 transition-transform group-hover:scale-150" />
                            <Icon className="relative h-9 w-9 text-white/80" />
                            <Heading as="h3" className="relative mt-5 text-xl">{label}</Heading>
                            <p className="relative mt-1 text-sm font-light text-white/70">{desc}</p>

                            <div className="relative mt-6 flex items-center gap-2 text-sm font-light text-white/80">
                                <CheckCircle2 className="h-4 w-4 text-white/60" />
                                Included in free enrolment
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const faqs = [
    {
        q: 'What do I need to register?',
        a: 'Students: full name, email, student ID, university/institution, and field of study. Individuals: full name and email only. Registration is quick and completely free.',
    },
    {
        q: 'What if I forget my password?',
        a: 'Simply click "Forgot Password" on the login page and follow the steps. A reset link will be sent to your registered email address.',
    },
    {
        q: 'Do I need to follow the module order?',
        a: 'Yes — modules are structured progressively. You need to complete each module before moving on to the next to ensure you build a solid foundation.',
    },
    {
        q: 'What is the passing score?',
        a: 'You need at least 60% to earn a certificate. You may retake assessments as many times as needed until you achieve the required score.',
    },
    {
        q: 'How do I get my certificate?',
        a: 'Once you successfully complete all modules and meet the passing score, your certificate will be available to download directly from the platform or sent to your email.',
    },
];

function FAQ() {
    const [open, setOpen] = useState(null);

    return (
        <section id="faq" className="bg-slate-50 py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <Heading as="h2" className="text-3xl text-slate-900 sm:text-4xl">
                        Got Questions? We've Got Answers.
                    </Heading>
                    <p className="mt-4 font-light text-slate-500">
                        Frequently asked questions about FENLearn.
                    </p>
                </div>

                <div className="space-y-3">
                    {faqs.map(({ q, a }, i) => (
                        <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                className="flex w-full items-center justify-between px-6 py-5 text-left"
                            >
                                <Heading as="span" className="text-base font-semibold text-slate-900">{q}</Heading>
                                <ChevronDown
                                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {open === i && (
                                <div className="border-t border-slate-100 px-6 py-5">
                                    <p className="text-sm font-light leading-relaxed text-slate-600">{a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function CTA({ auth }) {
    return (
        <section className="bg-indigo-950 py-24">
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-8 py-16 text-center sm:px-16">
                <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden />

                <Heading as="h2" className="relative text-3xl text-white sm:text-4xl lg:text-5xl">
                    Start your journey<br />
                    <span className="text-amber-300">today — it's free.</span>
                </Heading>
                <p className="relative mt-5 font-light leading-relaxed text-indigo-200 sm:text-lg">
                    Join thousands of Malaysians building better financial futures through FENLearn.
                </p>

                <div className="relative mt-10 flex flex-wrap justify-center gap-4">
                    <Link
                        href={auth?.user ? route('dashboard') : route('register')}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-8 py-3.5 text-base font-semibold text-indigo-950 shadow-lg shadow-black/20 hover:bg-amber-300 transition-all hover:scale-105"
                    >
                        {auth?.user ? 'Go to My Dashboard' : 'Create Free Account'}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    {!auth?.user && (
                        <Link
                            href={route('login')}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-base font-light text-white hover:bg-white/20 transition-all"
                        >
                            Already have an account? Log In
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
    return (
        <footer className="bg-indigo-950 border-t border-indigo-900 py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400">
                            <GraduationCap className="h-4 w-4 text-indigo-950" />
                        </span>
                        <span className="font-heading font-bold text-white">FENLearn</span>
                    </div>
                    <p className="text-center text-xs font-light text-indigo-500">
                        © {new Date().getFullYear()} FEN Network. All rights reserved.
                        &nbsp;·&nbsp; Backed by FEN Proaktif 2.0
                    </p>
                    <div className="flex gap-5 text-xs font-light text-indigo-400">
                        <Link href={route('login')}    className="hover:text-white transition-colors">Log In</Link>
                        <Link href={route('register')} className="hover:text-white transition-colors">Register</Link>
                        <Link href="/courses"           className="hover:text-white transition-colors">Courses</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="FENLearn — Kickstart Your Financial Management Journey" />
            <div className="font-sans antialiased">
                <Nav auth={auth} />
                <Hero auth={auth} />
                <USPBar />
                <BentoFeatures />
                <Topics />
                <FAQ />
                <CTA auth={auth} />
                <Footer />
            </div>
        </>
    );
}
