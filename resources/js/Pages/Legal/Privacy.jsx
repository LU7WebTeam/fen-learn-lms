import { Head, Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

function Section({ title, children }) {
    return (
        <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
        </section>
    );
}

export default function Privacy() {
    const { platform } = usePage().props;
    const name = platform?.name || 'Free LMS';

    return (
        <>
            <Head title={`Privacy Policy — ${name}`} />

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
                        </nav>
                    </div>
                </header>

                <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 space-y-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
                        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>

                    <Section title="1. Information We Collect">
                        <p>When you register and use {name}, we collect:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Account data:</strong> name, email address, and password (stored encrypted)</li>
                            <li><strong>Profile data:</strong> gender, race, state, birthdate, occupation, and organisation (collected during onboarding)</li>
                            <li><strong>Learning data:</strong> course enrolments, lesson progress, quiz results, and certificates earned</li>
                            <li><strong>Usage data:</strong> login timestamps and general platform activity</li>
                        </ul>
                    </Section>

                    <Section title="2. How We Use Your Information">
                        <p>We use the collected data to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Provide and improve the learning experience</li>
                            <li>Track your progress and issue certificates</li>
                            <li>Send transactional emails (e.g. email verification, password resets)</li>
                            <li>Generate anonymised analytics to understand platform usage</li>
                        </ul>
                        <p>We do not sell your personal data to third parties.</p>
                    </Section>

                    <Section title="3. Data Storage & Security">
                        <p>Your data is stored securely. Passwords are hashed using industry-standard algorithms and are never stored in plain text. We implement appropriate technical measures to protect your information from unauthorised access.</p>
                    </Section>

                    <Section title="4. Cookies">
                        <p>We use session cookies that are essential for the platform to function (authentication, CSRF protection). We do not use tracking or advertising cookies.</p>
                    </Section>

                    <Section title="5. Data Retention">
                        <p>We retain your account data for as long as your account is active. You may request deletion of your account at any time from your profile settings. Upon deletion, your personal data will be removed from our systems within a reasonable period.</p>
                    </Section>

                    <Section title="6. Your Rights">
                        <p>You have the right to access, correct, or delete your personal data. To exercise these rights, please contact us at the email below.</p>
                    </Section>

                    <Section title="7. Changes to This Policy">
                        <p>We may update this Privacy Policy from time to time. We will notify users of significant changes by posting a notice on the platform.</p>
                    </Section>

                    <Section title="8. Contact">
                        <p>For privacy-related questions, please contact us at {platform?.contact_email || 'the contact email listed on the platform'}.</p>
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
