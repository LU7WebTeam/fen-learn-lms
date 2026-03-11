import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    GraduationCap,
    ArrowRight,
    Image as ImageIcon,
    Sparkles,
    Circle,
    ChevronDown,
} from 'lucide-react';

function Heading({ as: Tag = 'h2', className = '', children }) {
    return <Tag className={`font-heading font-bold tracking-tight ${className}`}>{children}</Tag>;
}

function Nav({ auth }) {
    return (
        <nav className="sticky inset-x-0 top-0 z-50 border-b border-sky-100/80 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex shrink-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100">
                        <GraduationCap className="h-5 w-5 text-sky-700" />
                    </span>
                    <span className="font-heading text-lg font-bold text-slate-900">FENLearn</span>
                </Link>

                <div className="hidden flex-1 items-center gap-6 sm:flex">
                    <a href="#about" className="text-sm text-slate-600 transition-colors hover:text-slate-900">About</a>
                    <a href="#features" className="text-sm text-slate-600 transition-colors hover:text-slate-900">Features</a>
                    <Link href="/courses" className="text-sm text-slate-600 transition-colors hover:text-slate-900">Courses</Link>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    {auth?.user ? (
                        <Link
                            href={route('dashboard')}
                            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
                        >
                            My Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="rounded-lg px-4 py-2 text-sm text-slate-600 transition-colors hover:text-slate-900"
                            >
                                Log In
                            </Link>
                            <Link
                                href={route('register')}
                                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
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

function Hero({ auth }) {
    return (
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#99f6e4,transparent_38%),radial-gradient(circle_at_bottom_right,#fef08a,transparent_42%),#f8fafc] py-10 sm:py-14">
            <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
                <article className="relative overflow-hidden rounded-3xl border border-white bg-white p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1 lg:col-span-8 lg:p-10">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-sky-100" aria-hidden />
                    <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-amber-100" aria-hidden />

                    <div className="relative mb-4 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                        <Sparkles className="h-3.5 w-3.5" />
                        FEN E-Learning Platform
                    </div>

                    <Heading as="h1" className="relative text-3xl text-slate-900 sm:text-4xl lg:text-5xl">
                        Kickstart Your Financial Management Journey with FEN E-Learning Platform
                    </Heading>

                    <p className="relative mt-4 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
                        Secure and flexible e-learning platform to help you feel more confident to manage your finances
                    </p>

                    <div className="relative mt-8 flex flex-wrap gap-3">
                        <Link
                            href={auth?.user ? route('dashboard') : route('register')}
                            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-sky-500"
                        >
                            {auth?.user ? 'Continue Learning' : 'Start Learning Free'}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-6 py-3 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-50"
                        >
                            Browse Courses
                        </Link>
                    </div>
                </article>

                <article className="rounded-3xl border border-sky-200 bg-sky-50 p-6 lg:col-span-4 lg:p-8">
                    <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-sky-300 bg-white text-center text-sky-700">
                        <ImageIcon className="mb-3 h-8 w-8" />
                        <p className="text-sm font-medium">Hero Image Placeholder</p>
                        <p className="mt-1 px-4 text-xs text-sky-600">Use a portrait or campaign image here</p>
                    </div>
                </article>

                <article id="about" className="rounded-3xl border border-amber-200 bg-amber-50 p-8 lg:col-span-7">
                    <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">About FEN Learn</p>
                    <p className="mt-3 text-lg leading-relaxed text-slate-700">
                        FEN E-Learning Platform is brought to you by the Financial Education Network (FEN), an inter-agency platform comprising institutions and agencies committed to improving the financial literacy of Malaysians.
                    </p>
                </article>

                <article className="rounded-3xl border border-violet-200 bg-violet-50 p-6 lg:col-span-5">
                    <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">Image Placeholder</p>
                    <div className="mt-4 flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-violet-300 bg-white text-violet-500">
                        <ImageIcon className="mr-2 h-5 w-5" />
                        <span className="text-sm font-medium">Secondary Visual Placeholder</span>
                    </div>
                </article>
            </div>
        </section>
    );
}

function ImpactStats() {
    const stats = [
        { value: '200K', label: 'Registered Users', tone: 'bg-indigo-500 text-white' },
        { value: '10,000+', label: 'Module Completions', tone: 'bg-fuchsia-500 text-white' },
        { value: '300+', label: 'Learning Resources', tone: 'bg-emerald-500 text-white' },
    ];

    return (
        <section className="bg-white py-4 sm:py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-4 sm:grid-cols-3">
                    {stats.map((item) => (
                        <article
                            key={item.label}
                            className={`rounded-3xl p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 ${item.tone}`}
                        >
                            <p className="text-3xl font-bold leading-none">{item.value}</p>
                            <p className="mt-2 text-sm opacity-90">{item.label}</p>
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs">
                                <Circle className="h-2.5 w-2.5 fill-current" />
                                Placeholder metric note
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

const proaktifModules = [
    {
        title: 'Cash Flow Management',
        body: 'Learn how to keep track of your money so you always know where it is going and stay in control.',
        color: 'from-sky-500 to-cyan-500',
    },
    {
        title: 'Debt Management',
        body: 'Understand how to handle debt wisely and avoid money stress before it starts.',
        color: 'from-fuchsia-500 to-pink-500',
    },
    {
        title: 'Building Wealth',
        body: 'Discover ways to grow your money over time, even if you are just starting out.',
        color: 'from-emerald-500 to-teal-500',
    },
    {
        title: 'Financial Risk Management',
        body: 'Learn how to protect yourself and your future by managing financial risks confidently.',
        color: 'from-amber-500 to-orange-500',
    },
    {
        title: 'Digital Financial Literacy',
        body: 'Get smart about money in the digital era from online banking to staying safe from scams.',
        color: 'from-violet-500 to-indigo-500',
    },
];

function ProaktifSection() {
    return (
        <section className="bg-[radial-gradient(circle_at_top_left,#bae6fd,transparent_40%),radial-gradient(circle_at_bottom_right,#fef08a,transparent_42%),#ffffff] py-14 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-4 lg:grid-cols-12">
                    <article className="rounded-3xl border border-sky-100 bg-white p-8 shadow-sm lg:col-span-8 lg:p-10">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">Main Course</p>
                        <Heading as="h2" className="mt-2 text-3xl text-slate-900 sm:text-4xl">
                            About FEN PROAKTIF 2.0
                        </Heading>

                        <p className="mt-5 text-lg leading-relaxed text-slate-700">
                            FEN PROAKTIF 2.0 is an online financial education programme designed to help young Malaysians to build the money skills they need for the digital age and the first few years of working life. Achieving financial stability is not just about earning more, it is about being in control of what you have.
                        </p>

                        <p className="mt-6 text-lg leading-relaxed text-slate-700">
                            Achieve financial well-being, not burdens, by understanding your cash flow, protecting what matters, and making smarter decisions for your future. FEN PROAKTIF 2.0 helps you build the confidence you need to manage your finances from today onwards.
                        </p>

                        <div className="mt-7">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-sky-500 bg-sky-100 px-5 py-3 text-sm font-semibold text-sky-800 transition-colors hover:bg-sky-200"
                            >
                                Enroll to Proaktif 2.0 (Placeholder)
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </article>

                    <article className="rounded-3xl border border-violet-200 bg-violet-50 p-6 lg:col-span-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-700">Course Visual</p>
                        <div className="mt-4 flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-violet-300 bg-white text-violet-600">
                            <ImageIcon className="mr-2 h-5 w-5" />
                            <span className="text-sm font-medium">Proaktif 2.0 Image Placeholder</span>
                        </div>
                        <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-100/60 p-4 text-sm text-violet-800">
                            Highlight cards, learner profile, or module thumbnail can live here.
                        </div>
                    </article>
                </div>

                <article className="mt-4 w-full rounded-3xl border border-slate-200 bg-white p-7">
                    <Heading as="h3" className="text-2xl text-slate-900">What you will learn</Heading>

                    <ol className="mt-6 grid w-full list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
                        {proaktifModules.map((module, idx) => (
                            <li
                                key={module.title}
                                className={`group relative overflow-hidden rounded-2xl border p-5 ${
                                    idx === 0
                                        ? 'border-sky-200 bg-sky-50'
                                        : idx === 1
                                          ? 'border-fuchsia-200 bg-fuchsia-50'
                                          : idx === 2
                                            ? 'border-emerald-200 bg-emerald-50'
                                            : idx === 3
                                              ? 'border-amber-200 bg-amber-50'
                                              : 'border-violet-200 bg-violet-50'
                                }`}
                            >
                                <div className={`mb-4 inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white ${module.color}`}>
                                    {idx + 1}
                                </div>
                                <p className="text-base font-semibold text-slate-900">{module.title}</p>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{module.body}</p>
                                <div className="mt-4 text-xs uppercase tracking-wide text-slate-400">Icon Placeholder</div>
                            </li>
                        ))}
                    </ol>
                </article>
            </div>
        </section>
    );
}

const features = [
    {
        title: 'Learn anytime, anywhere',
        body: 'Learn at your own pace with fully flexible online programmes, making financial learning convenient and accessible for everyone.',
        tone: 'bg-white',
    },
    {
        title: 'Enrol anytime, free of charge',
        body: 'There are no fees and no fixed enrolment periods. Begin building essential financial skills, at no cost!',
        tone: 'bg-sky-50 border-sky-200',
    },
    {
        title: 'Receive a certificate of participation upon completion of the modules',
        body: 'Earn a certificate that validates your commitment to improving your financial literacy.',
        tone: 'bg-amber-50 border-amber-200',
    },
    {
        title: 'Designed by subject matter experts',
        body: "The content is developed by FEN's subject matter experts ensuring accuracy, quality, and relevance to the target segment.",
        tone: 'bg-emerald-50 border-emerald-200',
    },
];

function Features() {
    return (
        <section id="features" className="bg-slate-50 py-14 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 sm:mb-10">
                    <Heading as="h2" className="text-3xl text-slate-900 sm:text-4xl">
                        Why Learn with FEN
                    </Heading>
                    <p className="mt-2 text-slate-600">A brighter, faster experience designed around flexible learning outcomes.</p>
                </div>

                <div className="grid auto-rows-[minmax(180px,auto)] gap-4 lg:grid-cols-2 xl:grid-cols-12">
                    <article className="group relative overflow-hidden rounded-3xl border border-white bg-gradient-to-br from-sky-600 to-cyan-500 p-6 text-white shadow-sm transition-transform duration-300 hover:-translate-y-1 lg:col-span-2 xl:col-span-6 xl:row-span-2 lg:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">Signature Feature</p>
                        <Heading as="h3" className="mt-3 text-2xl">
                            {features[0].title}
                        </Heading>
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-sky-50">{features[0].body}</p>
                        <div className="mt-6 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs">Icon Placeholder</div>
                        <div className="pointer-events-none absolute -bottom-8 -right-8 h-36 w-36 rounded-full bg-white/20 transition-transform duration-300 group-hover:scale-110" aria-hidden />
                    </article>

                    <article className="rounded-3xl border border-violet-200 bg-violet-50 p-6 transition-transform duration-300 hover:-translate-y-1 lg:col-span-1 xl:col-span-3">
                        <Heading as="h3" className="text-lg text-slate-900">{features[1].title}</Heading>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{features[1].body}</p>
                        <p className="mt-4 text-xs uppercase tracking-wide text-violet-600">Icon Placeholder</p>
                    </article>

                    <article className="rounded-3xl border border-rose-200 bg-rose-50 p-6 transition-transform duration-300 hover:-translate-y-1 lg:col-span-1 xl:col-span-3">
                        <Heading as="h3" className="text-lg text-slate-900">{features[2].title}</Heading>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{features[2].body}</p>
                        <p className="mt-4 text-xs uppercase tracking-wide text-rose-600">Icon Placeholder</p>
                    </article>

                    <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 transition-transform duration-300 hover:-translate-y-1 lg:col-span-1 xl:col-span-4">
                        <Heading as="h3" className="text-lg text-slate-900">{features[3].title}</Heading>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{features[3].body}</p>
                        <p className="mt-4 text-xs uppercase tracking-wide text-emerald-600">Icon Placeholder</p>
                    </article>

                    <article className="rounded-3xl border border-slate-200 bg-white p-6 transition-transform duration-300 hover:-translate-y-1 lg:col-span-2 xl:col-span-8">
                        <div className="flex h-full min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
                            <ImageIcon className="mr-2 h-5 w-5" />
                            <span className="text-sm font-medium">Wide Feature Image Placeholder</span>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}

const faqs = [
    {
        question: '1. What do I need to register?',
        answer: 'Students: Full name, email, student ID, university/institution, field of study',
        answer2: 'Individuals: Full name and email',
    },
    {
        question: '2. What if I forget my password?',
        answer: 'You can reset it easily using the "Forgot Password" option.',
    },
    {
        question: '3. Do I need to follow the module order?',
        answer: 'Yes, you must complete each module before moving to the next.',
    },
    {
        question: '4. What is the passing score?',
        answer: 'You need at least 60% to earn a certificate. You may repeat the pre survey and post survey if you have not achieved the required score.',
    },
    {
        question: '5. How do I get my certificate?',
        answer: 'You can download it from the platform or receive it by email.',
    },
];

function FAQSection() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="bg-white py-14 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 sm:mb-10">
                    <Heading as="h2" className="text-3xl text-slate-900 sm:text-4xl">
                        Frequently Asked Questions
                    </Heading>
                    <p className="mt-2 text-slate-600">Quick answers to help learners get started smoothly.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-3">
                    {faqs.map((item, idx) => (
                        <article
                            key={item.question}
                            className={`rounded-3xl border p-6 shadow-sm ${
                                idx % 3 === 0
                                    ? 'border-sky-200 bg-sky-50'
                                    : idx % 3 === 1
                                      ? 'border-violet-200 bg-violet-50'
                                      : 'border-amber-200 bg-amber-50'
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                                className="flex w-full items-start justify-between gap-3 text-left"
                                aria-expanded={openIndex === idx}
                            >
                                <p className="text-base font-semibold text-slate-900">{item.question}</p>
                                <ChevronDown
                                    className={`mt-0.5 h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${
                                        openIndex === idx ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {openIndex === idx && (
                                <div className="mt-3 border-t border-slate-200/70 pt-3">
                                    <p className="text-sm leading-relaxed text-slate-700">{item.answer}</p>
                                    {item.answer2 && <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.answer2}</p>}
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-white py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100">
                            <GraduationCap className="h-4 w-4 text-sky-700" />
                        </span>
                        <span className="font-heading font-bold text-slate-900">FENLearn</span>
                    </div>
                    <p className="text-center text-xs text-slate-500">
                        © {new Date().getFullYear()} FEN Network. All rights reserved.
                    </p>
                    <div className="flex gap-5 text-xs text-slate-500">
                        <Link href={route('login')} className="transition-colors hover:text-slate-900">Log In</Link>
                        <Link href={route('register')} className="transition-colors hover:text-slate-900">Register</Link>
                        <Link href="/courses" className="transition-colors hover:text-slate-900">Courses</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="FENLearn - Kickstart Your Financial Management Journey" />
            <div className="font-sans antialiased">
                <Nav auth={auth} />
                <Hero auth={auth} />
                <ImpactStats />
                <ProaktifSection />
                <Features />
                <FAQSection />
                <Footer />
            </div>
        </>
    );
}
