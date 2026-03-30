import { Head, Link, usePage } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';
import LangSwitcher from '@/Components/LangSwitcher';

function Section({ title, children }) {
    return (
        <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
        </section>
    );
}

export default function Privacy() {
    const { platform, auth } = usePage().props;
    const name = platform?.name || 'FEN Learn';
    const website = 'fen-learn.fenetwork.my';
    const country = 'Malaysia';
    const updatedOn = '16 March 2026';

    return (
        <>
            <Head>
                <title>{`Privacy Policy - ${name}`}</title>
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

                <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 space-y-10">
                    <div>
                        <h1 className="font-['Bricolage_Grotesque',sans-serif] text-3xl font-bold tracking-tight mb-2 text-slate-900">Privacy Policy</h1>
                        <p className="text-sm text-slate-500">Last updated: {updatedOn}</p>
                    </div>

                    <Section title="1. Scope of this Policy">
                        <p>
                            This Privacy Policy explains how {name} ("we", "our", "us") collects, uses,
                            stores, and protects personal data when you use our website at {website}
                            (the "Platform").
                        </p>
                        <p>
                            This policy applies to all learners, visitors, and registered users of the Platform in {country}.
                        </p>
                    </Section>

                    <Section title="2. Information We Collect">
                        <p>When you visit, register, or learn on {name}, we may collect:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Account information:</strong> full name, email address, login credentials</li>
                            <li><strong>Profile details:</strong> onboarding details that you choose to provide</li>
                            <li><strong>Learning records:</strong> enrolments, lesson progress, quiz attempts, results, and certificates</li>
                            <li><strong>Technical data:</strong> browser type, IP address, device and session activity logs</li>
                            <li><strong>Support communications:</strong> messages submitted through our support or contact channels</li>
                        </ul>
                    </Section>

                    <Section title="3. How We Use Your Information">
                        <p>We use personal data for legitimate operational and educational purposes, including to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>create and manage user accounts</li>
                            <li>deliver courses and track learner progress</li>
                            <li>generate and verify certificates</li>
                            <li>send service emails such as verification and password reset messages</li>
                            <li>monitor platform stability, security, and abuse prevention</li>
                            <li>improve course quality and user experience through analytics</li>
                        </ul>
                        <p>We do not sell your personal data to third parties.</p>
                    </Section>

                    <Section title="4. Legal Basis and Consent">
                        <p>
                            By creating an account or using the Platform, you consent to the collection and processing
                            of your information as described in this policy and in accordance with applicable laws in {country}.
                        </p>
                    </Section>

                    <Section title="5. Cookies and Similar Technologies">
                        <p>
                            We use essential cookies and session technologies to keep you signed in, protect forms,
                            and maintain secure access to learning features. We do not use third-party advertising cookies.
                        </p>
                    </Section>

                    <Section title="6. Data Sharing and Disclosure">
                        <p>We may share limited data only when necessary with:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>trusted service providers that help us operate the Platform</li>
                            <li>authorities where disclosure is required by law or lawful request</li>
                            <li>auditors or legal advisors under strict confidentiality obligations</li>
                        </ul>
                        <p>All such sharing is limited to what is necessary for the stated purpose.</p>
                    </Section>

                    <Section title="7. Data Retention">
                        <p>
                            We keep your data only as long as needed for learning operations, compliance,
                            and record-keeping. When no longer required, data is securely deleted or anonymized.
                        </p>
                    </Section>

                    <Section title="8. Security Measures">
                        <p>
                            We apply reasonable administrative, technical, and organisational safeguards to protect
                            personal data from unauthorised access, alteration, or loss. No online system can be guaranteed
                            as 100% secure, but we continuously improve our controls.
                        </p>
                    </Section>

                    <Section title="9. Your Rights">
                        <p>Subject to applicable law, you may request to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>access your personal data</li>
                            <li>correct inaccurate data</li>
                            <li>delete your account and related data where applicable</li>
                            <li>withdraw consent for non-essential processing</li>
                        </ul>
                    </Section>

                    <Section title="10. Changes to this Privacy Policy">
                        <p>
                            We may revise this policy from time to time. Updates will be posted on {website}
                            with a revised "Last updated" date.
                        </p>
                    </Section>

                    <Section title="11. Contact">
                        <p>
                            For privacy questions about {name}, please contact the platform administrator through
                            the official communication channels listed on {website}.
                        </p>
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
