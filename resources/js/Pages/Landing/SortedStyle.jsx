import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Calculator, PiggyBank, Target, WalletCards, Sparkles, BadgeCheck } from 'lucide-react';

const QUICK_TOOLS = [
    {
        title: 'Budget Planner',
        description: 'Map your monthly income, spending, and savings targets in minutes.',
        stat: '5 min setup',
        icon: WalletCards,
    },
    {
        title: 'Savings Goal Builder',
        description: 'Build a practical timeline for emergency funds and life milestones.',
        stat: '12 goal types',
        icon: PiggyBank,
    },
    {
        title: 'Debt Strategy Calculator',
        description: 'Compare repayment approaches and identify your fastest realistic path.',
        stat: '2 payoff methods',
        icon: Calculator,
    },
];

const LEARN_TRACKS = [
    {
        title: 'Money Basics',
        description: 'Understand cashflow, needs vs wants, and spending habits that actually stick.',
        gradient: 'from-[#ffe8b6] via-[#ffd7a8] to-[#ffc89a]',
    },
    {
        title: 'Borrowing & Credit',
        description: 'Learn how interest, credit scores, and loan terms affect your long-term money.',
        gradient: 'from-[#d9f5ff] via-[#c4ecff] to-[#a8ddff]',
    },
    {
        title: 'Growing Wealth',
        description: 'Get clear on risk, diversification, and steady wealth-building frameworks.',
        gradient: 'from-[#daf9e5] via-[#c7f3d9] to-[#b2eccd]',
    },
];

const STEPS = [
    'Pick your goal: spend better, clear debt, or grow savings.',
    'Use practical tools to test scenarios and compare choices.',
    'Follow a short learning path with actionable checkpoints.',
    'Track progress weekly and adjust with confidence.',
];

export default function SortedStyle() {
    const { platform, auth } = usePage().props;
    const platformName = platform?.name || 'FEN Learn';

    return (
        <div className="min-h-screen bg-[#fcf8ef] text-[#1f2d2a] font-['Nunito_Sans',sans-serif]">
            <Head title={`${platformName} | Plan Your Money Better`}>
                <meta
                    name="description"
                    content="A practical public page for money planning and learning with tools, guides, and action-focused tracks."
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Nunito+Sans:wght@400;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <style>{`
                @keyframes riseIn {
                    from {
                        opacity: 0;
                        transform: translateY(24px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .rise-in {
                    opacity: 0;
                    animation: riseIn 680ms ease forwards;
                }

                .grain-bg {
                    background-image:
                        radial-gradient(circle at 0 0, rgba(255, 255, 255, 0.8) 0, rgba(255, 255, 255, 0) 48%),
                        radial-gradient(circle at 100% 100%, rgba(255, 240, 209, 0.62) 0, rgba(255, 240, 209, 0) 54%),
                        repeating-linear-gradient(45deg, rgba(27, 43, 38, 0.02) 0, rgba(27, 43, 38, 0.02) 2px, transparent 2px, transparent 9px);
                }
            `}</style>

            <header className="sticky top-0 z-50 border-b border-[#d8cfbf] bg-[#fcf8ef]/95 backdrop-blur-sm">
                <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-3">
                        {platform?.logo_url ? (
                            <img src={platform.logo_url} alt={platformName} className="h-9 w-auto object-contain" />
                        ) : (
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#115e59] font-bold text-white">
                                {platformName.charAt(0)}
                            </span>
                        )}
                        <span className="hidden text-sm font-extrabold uppercase tracking-[0.08em] text-[#115e59] sm:block">
                            Sorted Style WIP
                        </span>
                    </Link>

                    <div className="hidden items-center gap-8 text-sm font-bold text-[#2a3f39] lg:flex">
                        <a href="#tools" className="transition hover:text-[#115e59]">Tools</a>
                        <a href="#learn" className="transition hover:text-[#115e59]">Learn</a>
                        <a href="#start" className="transition hover:text-[#115e59]">Get Started</a>
                    </div>

                    <div className="flex items-center gap-3">
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-full bg-[#115e59] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#0f4d49]"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="hidden text-sm font-bold text-[#2a3f39] hover:text-[#115e59] sm:block">
                                    Login
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-full bg-[#115e59] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#0f4d49]"
                                >
                                    Start Free
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <main>
                <section className="grain-bg border-b border-[#d8cfbf]">
                    <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
                        <div className="space-y-7">
                            <p className="rise-in text-sm font-black uppercase tracking-[0.12em] text-[#1f6d66]" style={{ animationDelay: '40ms' }}>
                                Financial confidence starts here
                            </p>
                            <h1
                                className="rise-in font-['Fraunces',serif] text-5xl leading-[1.02] text-[#12312c] sm:text-6xl"
                                style={{ animationDelay: '140ms' }}
                            >
                                Clear money decisions for real life, not theory.
                            </h1>
                            <p className="rise-in max-w-xl text-lg leading-relaxed text-[#36524b]" style={{ animationDelay: '220ms' }}>
                                Explore practical tools, plain-language guides, and step-by-step learning tracks that help
                                you plan, spend, save, and grow with confidence.
                            </p>
                            <div className="rise-in flex flex-wrap gap-4" style={{ animationDelay: '300ms' }}>
                                <a
                                    href="#tools"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#115e59] px-7 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-[#0f4d49]"
                                >
                                    Explore Tools
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                                <a
                                    href="#learn"
                                    className="inline-flex items-center gap-2 rounded-full border-2 border-[#21423b] px-7 py-3 text-sm font-extrabold uppercase tracking-wide text-[#21423b] transition hover:bg-[#21423b] hover:text-white"
                                >
                                    Start Learning
                                </a>
                            </div>
                        </div>

                        <div className="rise-in rounded-[2rem] border border-[#d5cab7] bg-white p-6 shadow-[0_18px_50px_-25px_rgba(20,58,49,0.45)]" style={{ animationDelay: '360ms' }}>
                            <h2 className="font-['Fraunces',serif] text-3xl text-[#143a31]">Weekly Money Snapshot</h2>
                            <p className="mt-2 text-sm text-[#406058]">A quick framework to keep your money plan grounded.</p>
                            <div className="mt-6 space-y-4">
                                <div className="rounded-2xl bg-[#edf8f7] p-4">
                                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[#1f6d66]">Income</p>
                                    <p className="mt-1 text-2xl font-extrabold text-[#12312c]">$1,240 this week</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-2xl bg-[#fff4df] p-4">
                                        <p className="text-xs font-black uppercase tracking-[0.08em] text-[#8f5e00]">Essentials</p>
                                        <p className="mt-1 text-xl font-extrabold text-[#553d08]">$620</p>
                                    </div>
                                    <div className="rounded-2xl bg-[#ebf4ff] p-4">
                                        <p className="text-xs font-black uppercase tracking-[0.08em] text-[#1453aa]">Savings</p>
                                        <p className="mt-1 text-xl font-extrabold text-[#123a70]">$270</p>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-dashed border-[#8faca5] bg-[#f4fbf8] p-4">
                                    <p className="text-sm font-bold text-[#21423b]">Tip: Move savings first, then spend the rest.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="tools" className="border-b border-[#d8cfbf] bg-[#fffdf9]">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                        <div className="mb-8 flex items-end justify-between gap-6">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1f6d66]">Money Tools</p>
                                <h2 className="mt-2 font-['Fraunces',serif] text-4xl text-[#12312c]">Build your plan fast</h2>
                            </div>
                            <Sparkles className="hidden h-8 w-8 text-[#115e59] sm:block" />
                        </div>

                        <div className="grid gap-5 md:grid-cols-3">
                            {QUICK_TOOLS.map(({ title, description, stat, icon: Icon }) => (
                                <article
                                    key={title}
                                    className="group rounded-3xl border border-[#d8cfbf] bg-white p-6 transition hover:-translate-y-1 hover:border-[#9fb7b0] hover:shadow-[0_12px_30px_-20px_rgba(17,94,89,0.45)]"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e7f3f1] text-[#115e59]">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <span className="rounded-full bg-[#f5eee0] px-3 py-1 text-xs font-bold text-[#6a4b17]">{stat}</span>
                                    </div>
                                    <h3 className="mt-5 text-xl font-extrabold text-[#173f37]">{title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-[#44625b]">{description}</p>
                                    <button
                                        type="button"
                                        className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#115e59]"
                                    >
                                        Open tool
                                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                    </button>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="learn" className="border-b border-[#d8cfbf] bg-[#f8fbff]">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1453aa]">Learn by track</p>
                                <h2 className="mt-2 font-['Fraunces',serif] text-4xl text-[#12312c]">Progress one focused step at a time</h2>
                                <p className="mt-4 max-w-xl text-base leading-relaxed text-[#3d5952]">
                                    Bite-sized content, practical checklists, and scenario walkthroughs to help you make
                                    better day-to-day financial decisions.
                                </p>
                                <div className="mt-8 space-y-3">
                                    {STEPS.map((step, index) => (
                                        <div key={step} className="flex items-start gap-3 rounded-2xl bg-white/75 p-3">
                                            <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#115e59] text-xs font-black text-white">
                                                {index + 1}
                                            </span>
                                            <p className="text-sm font-semibold text-[#1f3d36]">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {LEARN_TRACKS.map(({ title, description, gradient }) => (
                                    <article key={title} className={`rounded-3xl bg-gradient-to-r ${gradient} p-[1px]`}>
                                        <div className="rounded-[calc(1.5rem-1px)] bg-white/95 p-5">
                                            <div className="flex items-center justify-between gap-3">
                                                <h3 className="text-xl font-extrabold text-[#173f37]">{title}</h3>
                                                <BadgeCheck className="h-5 w-5 text-[#145e59]" />
                                            </div>
                                            <p className="mt-2 text-sm leading-relaxed text-[#3d5952]">{description}</p>
                                            <button type="button" className="mt-4 text-sm font-extrabold text-[#145e59]">
                                                View track
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="start" className="bg-[#12312c] py-16 text-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-[2rem] border border-white/20 bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.2),rgba(255,255,255,0)_55%),radial-gradient(circle_at_100%_100%,rgba(153,238,225,0.2),rgba(153,238,225,0)_50%)] px-6 py-10 sm:px-10">
                            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                                <div className="max-w-2xl">
                                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#9be2d8]">Get started</p>
                                    <h2 className="mt-3 font-['Fraunces',serif] text-4xl leading-tight">
                                        Build a personal money system that fits your life.
                                    </h2>
                                    <p className="mt-3 text-white/85">
                                        Create your account, pick your first track, and use the toolset to turn plans into
                                        weekly actions.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-extrabold uppercase tracking-wide text-[#12312c] transition hover:bg-[#eef7f5]"
                                    >
                                        Create free account
                                        <Target className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href={route('courses.index')}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/60 px-7 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-white/10"
                                    >
                                        Browse courses
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
