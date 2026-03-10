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

export default function Terms() {
    const { platform } = usePage().props;
    const name = platform?.name || 'Free LMS';

    return (
        <>
            <Head title={`Terms of Use — ${name}`} />

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
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Use</h1>
                        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>

                    <Section title="1. Acceptance of Terms">
                        <p>By accessing or using {name}, you agree to be bound by these Terms of Use. If you do not agree, please do not use the platform.</p>
                    </Section>

                    <Section title="2. Use of the Platform">
                        <p>This platform is provided free of charge for educational purposes. You may:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Register and create a personal account</li>
                            <li>Access and complete published courses</li>
                            <li>Download certificates for your own use</li>
                        </ul>
                        <p>You may not use the platform to violate any applicable laws, distribute spam, or attempt to gain unauthorised access to any system.</p>
                    </Section>

                    <Section title="3. User Accounts">
                        <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information when registering. We reserve the right to suspend accounts that violate these terms.</p>
                    </Section>

                    <Section title="4. Intellectual Property">
                        <p>All course content, including text, videos, images, and assessments, is the property of {name} or its content partners. You may not reproduce, distribute, or create derivative works without prior written permission.</p>
                    </Section>

                    <Section title="5. Certificates">
                        <p>Certificates issued by this platform are for educational recognition only. They do not constitute a formal qualification unless explicitly stated by the issuing organisation.</p>
                    </Section>

                    <Section title="6. Limitation of Liability">
                        <p>{name} is provided "as is" without any warranty of any kind. We do not guarantee the accuracy, completeness, or suitability of any course content. To the extent permitted by law, we are not liable for any direct or indirect damages arising from your use of the platform.</p>
                    </Section>

                    <Section title="7. Changes to Terms">
                        <p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the revised terms.</p>
                    </Section>

                    <Section title="8. Contact">
                        <p>For questions about these terms, please contact us at {platform?.contact_email || 'the contact email listed on the platform'}.</p>
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
