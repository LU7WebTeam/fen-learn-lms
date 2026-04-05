import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { BookOpen, Lock, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import InputError from '@/Components/InputError';
import { useT } from '@/lib/i18n';

export default function TwoFactorVerification({ email }) {
    const { props } = usePage();
    const platform = props.platform ?? {};
    const flash = props.flash ?? {};
    const t = useT();
    const [showSuccess, setShowSuccess] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
    });

    async function handleSubmit(e) {
        e.preventDefault();
        
        post(route('two-factor.verify.post'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowSuccess(true);
                // Redirect will happen automatically from the server
            },
        });
    }

    async function handleResend(e) {
        e.preventDefault();
        post(route('two-factor.resend'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Head title={`${t('auth.two_factor.title')} - ${platform.name || 'LMS'}`} />

            {/* Left panel — form */}
            <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8">
                <div className="w-full max-w-sm space-y-8">

                    {/* Logo / branding */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-6">
                            {platform.logo_url ? (
                                <img src={platform.logo_url} alt={platform.name} className="h-9 w-auto" />
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('auth.two_factor.title')}</h1>
                        <p className="text-sm text-gray-500">
                            {t('auth.two_factor.sent_to')} <strong>{email}</strong>
                        </p>
                    </div>

                    {flash.success && (
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    {Object.keys(errors).length > 0 && (
                        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                            <p className="font-medium mb-1">{t('auth.two_factor.failed_title')}</p>
                            <p>{Object.values(errors)[0]}</p>
                        </div>
                    )}

                    {showSuccess && (
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-3 text-sm text-emerald-700">
                            <CheckCircle className="h-5 w-5 flex-shrink-0" />
                            <span>{t('auth.two_factor.success_redirecting')}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700" htmlFor="code">
                                {t('auth.two_factor.code_label')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="code"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength="6"
                                    value={data.code}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setData('code', val);
                                    }}
                                    autoComplete="off"
                                    autoFocus
                                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 tracking-widest text-center text-xl font-semibold"
                                    placeholder="000000"
                                />
                            </div>
                            <InputError message={errors.code} />
                            <p className="text-xs text-gray-500 mt-1.5">
                                {t('auth.two_factor.code_hint')}
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={processing || data.code.length !== 6}
                            className="w-full relative inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 font-medium transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t('auth.two_factor.verifying')}
                                </>
                            ) : (
                                <>
                                    {t('auth.two_factor.verify')}
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <button
                            onClick={handleResend}
                            disabled={processing}
                            type="button"
                            className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {processing ? t('auth.two_factor.sending') : t('auth.two_factor.resend')}
                        </button>
                    </div>

                </div>
            </div>

            {/* Right panel — decorative */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary/10 to-primary/5 flex-col items-center justify-center p-8 text-center">
                <div className="max-w-md space-y-6">
                    <div className="mx-auto h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
                        <Lock className="h-12 w-12 text-primary/60" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('auth.two_factor.secure_title')}</h2>
                        <p className="text-gray-600">
                            {t('auth.two_factor.secure_desc')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
