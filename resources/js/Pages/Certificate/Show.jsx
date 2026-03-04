import { Head, Link } from '@inertiajs/react';
import { Award, Download, ExternalLink, CheckCircle2, BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';

export default function CertificateShow({ certificate }) {
    const {
        uuid,
        user_name,
        course_title,
        course_slug,
        category,
        completed_at,
        download_url,
    } = certificate;

    return (
        <>
            <Head title={`Certificate — ${course_title}`} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
                {/* Top nav */}
                <div className="border-b bg-white/80 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm font-semibold tracking-widest text-indigo-700 uppercase"
                        >
                            FENLearn
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Verified Certificate
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-4xl px-4 py-12">
                    {/* Certificate card */}
                    <Card className="overflow-hidden shadow-2xl border-0">
                        {/* Crimson header bar */}
                        <div className="bg-[#8B1A4A] px-10 py-6 text-center text-white">
                            <p className="text-xs tracking-[0.3em] uppercase text-[#F0D9A8] mb-1">FEN Network · FENLearn Platform</p>
                            <h1 className="text-3xl font-bold tracking-tight">Certificate of Achievement</h1>
                        </div>

                        {/* Gold accent line */}
                        <div className="h-1 bg-[#C8A96E]" />

                        <CardContent className="px-10 py-10 text-center">
                            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">
                                This is proudly presented to
                            </p>

                            <Separator className="w-20 mx-auto mb-6 bg-[#C8A96E]" />

                            <h2 className="text-4xl font-bold text-[#8B1A4A] mb-4 leading-tight">
                                {user_name}
                            </h2>

                            <p className="text-muted-foreground mb-3 text-sm">
                                for successfully completing the course
                            </p>

                            <h3 className="text-xl font-bold text-foreground mb-4 leading-snug max-w-xl mx-auto">
                                {course_title}
                            </h3>

                            {category && (
                                <Badge variant="secondary" className="mb-6">
                                    {category}
                                </Badge>
                            )}

                            <div className="flex flex-wrap justify-center gap-10 mt-2 mb-8">
                                <div className="text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Completion Date</p>
                                    <div className="w-28 border-b border-muted mb-2" />
                                    <p className="text-sm font-semibold">{completed_at}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Certificate ID</p>
                                    <div className="w-56 border-b border-muted mb-2" />
                                    <p className="text-xs font-mono font-semibold text-muted-foreground truncate max-w-[14rem]">
                                        {uuid}
                                    </p>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Button asChild size="lg" className="bg-[#8B1A4A] hover:bg-[#7a1740] text-white gap-2">
                                    <a href={download_url} download>
                                        <Download className="h-4 w-4" />
                                        Download PDF
                                    </a>
                                </Button>

                                <Button asChild variant="outline" size="lg" className="gap-2">
                                    <Link href={`/courses/${course_slug}`}>
                                        <BookOpen className="h-4 w-4" />
                                        View Course
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>

                        {/* Footer bar */}
                        <div className="bg-[#8B1A4A] px-10 py-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#F0D9A8]">
                                <span>Issued on {completed_at}</span>
                                <span className="text-center text-white font-semibold tracking-widest uppercase text-[10px]">
                                    Certificate of Completion
                                </span>
                                <span className="font-mono truncate max-w-xs">ID: {uuid}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Verification note */}
                    <div className="mt-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-5 py-4">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-green-800">Authentic Certificate</p>
                            <p className="text-sm text-green-700 mt-0.5">
                                This certificate is verified by FENLearn. Share this page URL or the certificate ID
                                to allow anyone to confirm its authenticity.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to My Learning
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
