import { Head, Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { BookOpen, Users, Award, Globe } from 'lucide-react';

export default function About() {
    const { platform } = usePage().props;
    const name = platform?.name || 'Free LMS';

    return (
        <>
            <Head title={`About — ${name}`} />

            <div className="min-h-screen bg-background">
                {/* Nav */}
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

                <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">About {name}</h1>
                    <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                        {platform?.tagline || 'Free, high-quality learning for everyone.'}
                    </p>

                    <div className="prose prose-gray max-w-none space-y-6 text-muted-foreground leading-relaxed">
                        <p>
                            {name} is a free, publicly accessible learning management system built to deliver high-quality educational content without barriers. Our courses cover a wide range of topics, and every learner can access all published content at no cost.
                        </p>
                        <p>
                            We believe that access to knowledge should be universal. Whether you are looking to upskill professionally, explore a new subject, or earn a certificate to demonstrate your learning, this platform is built for you.
                        </p>
                    </div>

                    <div className="mt-14 grid gap-6 sm:grid-cols-3">
                        {[
                            { icon: BookOpen, title: 'Free Courses',       desc: 'All published courses are free. No paywalls, no subscriptions.' },
                            { icon: Award,    title: 'Earn Certificates',  desc: 'Complete a course and automatically receive a PDF certificate.' },
                            { icon: Globe,    title: 'Bilingual Content',  desc: 'Courses available in English and Bahasa Melayu.' },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="rounded-xl border bg-card p-5 space-y-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                    <Icon className="h-4.5 w-4.5 text-primary" />
                                </div>
                                <h3 className="font-semibold text-sm">{title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-14 rounded-xl border bg-muted/40 p-8 text-center space-y-4">
                        <h2 className="text-xl font-bold">Start learning today</h2>
                        <p className="text-muted-foreground text-sm">Join thousands of learners and access free courses right now.</p>
                        <div className="flex gap-3 justify-center flex-wrap">
                            <Link href="/courses" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                                Browse courses
                            </Link>
                            <Link href={route('register')} className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold hover:bg-muted transition-colors">
                                Create account
                            </Link>
                        </div>
                    </div>
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
