import { Head, Link, usePage } from '@inertiajs/react';
import { Download, CheckCircle2, BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import CertificatePreview from '@/Components/CertificatePreview';
import { useT } from '@/lib/i18n';

export default function CertificateShow({ certificate, template, customFont }) {
    const { platform } = usePage().props;
    const t = useT();
    const {
        uuid,
        user_name,
        course_title,
        course_slug,
        completed_at,
        download_url,
    } = certificate;
    const platformName = platform?.name || 'FENLearn';
    const platformLogoUrl = platform?.logo_url || null;

    const dynamicValues = {
        recipient_name:  user_name,
        course_title:    course_title,
        completion_date: completed_at,
        certificate_id:  uuid,
    };

    return (
        <>
            <Head title={t('certificate.page_title', { course_title })} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
                {/* Top nav */}
                <div className="border-b bg-white/80 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm font-semibold tracking-widest text-indigo-700 uppercase"
                        >
                            {platformLogoUrl ? (
                                <img src={platformLogoUrl} alt={platformName} className="h-10 w-auto object-contain" />
                            ) : (
                                platformName
                            )}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            {t('certificate.verified_badge')}
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-4xl px-4 py-12">
                    {/* Certificate preview — matches the builder design */}
                    <div className="w-full overflow-x-auto rounded-xl shadow-2xl">
                        <CertificatePreview
                            template={template}
                            dynamicValues={dynamicValues}
                            customFonts={customFont ? [customFont] : []}
                            platformName={platformName}
                            width={896}
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button asChild size="lg" className="gap-2">
                            <a href={download_url} download>
                                <Download className="h-4 w-4" />
                                {t('certificate.download_pdf')}
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="gap-2">
                            <Link href={`/courses/${course_slug}`}>
                                <BookOpen className="h-4 w-4" />
                                {t('certificate.view_course')}
                            </Link>
                        </Button>
                    </div>

                    {/* Verification note */}
                    <div className="mt-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-5 py-4">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-green-800">{t('certificate.authentic_title')}</p>
                            <p className="text-sm text-green-700 mt-0.5">
                                {t('certificate.authentic_body', { platform_name: platformName })}
                            </p>
                        </div>
                    </div>

                    {/* Certificate meta */}
                    <div className="mt-4 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
                        <span>
                            {t('certificate.issued_on_label')} <strong className="text-foreground">{completed_at}</strong>
                        </span>
                        <span className="font-mono">{t('certificate.id_label')} {uuid}</span>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            {t('certificate.back_to_learning')}
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
