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

export default function Terms() {
    const name = 'FEN Learn';
    const website = 'fen-learn.fenetwork.my';
    const country = 'Malaysia';
    const updatedOn = '16 March 2026';

    return (
        <>
            <Head title={`Terms & Conditions - ${name}`} />

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
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Terms & Conditions</h1>
                        <p className="text-sm text-muted-foreground">Last updated: {updatedOn}</p>
                    </div>

                    <Section title="1. Acceptance of Terms">
                        <p>
                            By accessing or using {website} (the "Platform"), you agree to be bound by these
                            Terms & Conditions. If you do not agree, do not use the Platform.
                        </p>
                    </Section>

                    <Section title="2. Eligibility and Accounts">
                        <p>
                            You must provide accurate information when creating an account and keep your login credentials secure.
                            You are responsible for all activities under your account.
                        </p>
                    </Section>

                    <Section title="3. Permitted Use">
                        <p>{name} is provided for lawful educational use. You may:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Register and create a personal account</li>
                            <li>Access and complete published courses</li>
                            <li>Download certificates for your own use</li>
                        </ul>
                        <p>You may not:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>use the Platform for unlawful, fraudulent, or abusive activity</li>
                            <li>attempt unauthorised access, probing, or disruption of systems</li>
                            <li>copy, redistribute, or resell learning materials without permission</li>
                            <li>upload content that is harmful, infringing, or violates others' rights</li>
                        </ul>
                    </Section>

                    <Section title="4. Intellectual Property">
                        <p>
                            Unless otherwise stated, course content, branding, visuals, text, and software on {name}
                            are owned by or licensed to us and are protected by applicable intellectual property laws.
                        </p>
                    </Section>

                    <Section title="5. Certificates and Outcomes">
                        <p>
                            Certificates issued through the Platform are evidence of course completion only and do not
                            automatically represent professional licensing or government accreditation unless expressly stated.
                        </p>
                    </Section>

                    <Section title="6. Platform Availability">
                        <p>
                            We may update, suspend, or discontinue parts of the Platform at any time, including for maintenance,
                            security, or operational reasons.
                        </p>
                    </Section>

                    <Section title="7. Disclaimer and Limitation of Liability">
                        <p>
                            The Platform is provided on an "as is" and "as available" basis. To the fullest extent
                            permitted by law, we disclaim warranties and are not liable for indirect, incidental,
                            special, or consequential losses arising from use of the Platform.
                        </p>
                    </Section>

                    <Section title="8. Suspension and Termination">
                        <p>
                            We may suspend or terminate access to the Platform if these Terms are violated,
                            to protect users, or where required by law.
                        </p>
                    </Section>

                    <Section title="9. Changes to these Terms">
                        <p>
                            We may revise these Terms from time to time. Updated Terms will be posted on {website}
                            with the latest revision date. Continued use after updates means you accept the revised Terms.
                        </p>
                    </Section>

                    <Section title="10. Governing Law and Jurisdiction">
                        <p>
                            These Terms are governed by the laws of {country}. Any disputes related to these Terms
                            will be subject to the exclusive jurisdiction of the courts of {country}.
                        </p>
                    </Section>

                    <Section title="11. Contact">
                        <p>
                            For questions regarding these Terms & Conditions, contact the platform administrator through
                            the official contact channels listed on {website}.
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
