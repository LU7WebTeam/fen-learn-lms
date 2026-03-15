import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { BookOpen, MailCheck } from 'lucide-react';
import InputError from '@/Components/InputError';
import AnalyticsTracker from '@/Components/AnalyticsTracker';
import { useT } from '@/lib/i18n';

export default function VerifyEmail({ status }) {
    const { props } = usePage();
    const platform = props.platform ?? {};
    const t = useT();

    const { post, processing, errors } = useForm({});

    function submit(e) {
        e.preventDefault();
        post(route('verification.send'));
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <AnalyticsTracker />
            <Head title={t('auth.verify_email.title')} />

            <div className="w-full max-w-sm space-y-8">
                {/* Logo */}
                <div className="flex flex-col items-center gap-2">
                    {platform.logo_url ? (
                        <img src={platform.logo_url} alt={platform.name} className="h-9 w-auto" />
                    ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <BookOpen className="h-5 w-5" />
                        </div>
                    )}
                    <span className="font-bold text-xl text-gray-900">{platform.name || 'LMS'}</span>
                </div>

                {/* Icon + heading */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                        <MailCheck className="h-7 w-7 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('auth.verify_email.title')}</h1>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                        {t('auth.verify_email.description')}
                    </p>
                </div>

                {/* Success message */}
                {status === 'verification-link-sent' && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 text-center">
                        {t('auth.verify_email.sent')}
                    </div>
                )}

                <InputError message={errors.email} />

                <form onSubmit={submit} className="space-y-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
                    >
                        {processing ? t('auth.verify_email.resending') : t('auth.verify_email.resend')}
                    </button>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 block text-center"
                    >
                        {t('auth.verify_email.logout')}
                    </Link>
                </form>
            </div>
        </div>
    );
}
