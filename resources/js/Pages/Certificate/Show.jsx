import { Head, Link, usePage } from '@inertiajs/react';
import { Download, BookOpen, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import CertificatePreview from '@/Components/CertificatePreview';
import { useT } from '@/lib/i18n';
import LangSwitcher from '@/Components/LangSwitcher';
import ThemeToggleButton from '@/Components/ThemeToggleButton';
import UserMenu from '@/Components/UserMenu';

export default function CertificateShow({ certificate, template, customFont }) {
    const { platform, auth } = usePage().props;
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

            <div className="min-h-screen bg-[#eceff3] dark:bg-[#0b1020]">
                <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
                    <div className="w-full rounded-2xl bg-[#2a1548]/90 px-6 py-4 text-white shadow-[0_18px_45px_-28px_rgba(0,0,0,0.9)] backdrop-blur-md sm:px-7">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-6">
                                <Link href={route('home')}>
                                    {platformLogoUrl ? (
                                        <img src={platformLogoUrl} alt={platformName} className="h-[24px] w-auto object-contain sm:h-[30px]" />
                                    ) : (
                                        <span className="text-xl font-black tracking-tight">{platformName}</span>
                                    )}
                                </Link>

                                <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex">
                                    <Link href={route('courses.show', 'fen-proaktif')} className="flex items-center gap-1.5 text-white/90 transition hover:text-white">
                                        <LayoutDashboard className="h-4 w-4" />
                                        {t('nav.my_dashboard')}
                                    </Link>
                                </nav>
                            </div>

                            <div className="flex items-center gap-3">
                                <ThemeToggleButton className="h-9 w-9 text-white hover:bg-white/10 hover:text-white focus-visible:text-white active:text-white" />
                                <div className="hidden sm:block">
                                    <LangSwitcher className="border-white bg-white text-[#131722]" />
                                </div>
                                {auth?.user && <UserMenu />}
                            </div>
                        </div>
                    </div>
                </header>

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

                    {/* Certificate meta */}
                    <div className="mt-4 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
                        <span>
                            {t('certificate.issued_on_label')} <strong className="text-foreground">{completed_at}</strong>
                        </span>
                        <span className="font-mono">{t('certificate.id_label')} {uuid}</span>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href={route('courses.show', 'fen-proaktif')}
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
