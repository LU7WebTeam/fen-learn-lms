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

export default function Terms() {
    const { platform, auth } = usePage().props;
    const name = platform?.name || 'FEN Learn';
    const website = 'fen-learn.fenetwork.my';
    const country = 'Malaysia';
    const updatedOn = '16 March 2026';

    return (
        <>
            <Head>
                <title>{`Terms & Conditions - ${name}`}</title>
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
                        <h1 className="font-['Bricolage_Grotesque',sans-serif] text-3xl font-bold tracking-tight mb-2 text-slate-900">Terms & Conditions</h1>
                        <p className="text-sm text-slate-500">Last updated: {updatedOn}</p>
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
