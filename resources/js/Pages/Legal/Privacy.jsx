import { Head, Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import ThemeToggleButton from '@/Components/ThemeToggleButton';

function Section({ title, children }) {
    return (
        <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
        </section>
    );
}

export default function Privacy() {
    const name = 'FEN Learn';
    const website = 'fen-learn.fenetwork.my';
    const country = 'Malaysia';
    const updatedOn = '16 March 2026';

    return (
        <>
            <Head title={`Privacy Policy - ${name}`} />

            <div className="min-h-screen bg-background">
                <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
                    <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
                        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
                            <BookOpen className="h-5 w-5 text-primary" />
                            {name}
                        </Link>
                        <nav className="flex items-center gap-4 text-sm">
                            <Link href="/courses" className="text-muted-foreground hover:text-foreground transition-colors">Catalog</Link>
                            <Link href={route('login')} className="text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
                            <ThemeToggleButton />
                        </nav>
                    </div>
                </header>

                <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 space-y-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
                        <p className="text-sm text-muted-foreground">Last updated: {updatedOn}</p>
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
                            <li><strong>Learning records:</strong> enrollments, lesson progress, quiz attempts, results, and certificates</li>
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
                            We apply reasonable administrative, technical, and organizational safeguards to protect
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

                <footer className="border-t mt-16">
                    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} {name}. All rights reserved.</p>
                        <div className="flex gap-4">
                            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
                            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
