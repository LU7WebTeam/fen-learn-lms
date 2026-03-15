import { useState } from 'react';
import InputError from '@/Components/InputError';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff, BookOpen, Lock } from 'lucide-react';
import AnalyticsTracker from '@/Components/AnalyticsTracker';
import { useT } from '@/lib/i18n';

export default function ResetPassword({ token, email }) {
    const { props } = usePage();
    const platform = props.platform ?? {};
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const t = useT();

    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <AnalyticsTracker />
            <Head title={t('auth.reset_password.title')} />

            <div className="w-full max-w-sm space-y-8">
                {/* Logo */}
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-6">
                        {platform.logo_url ? (
                            <img src={platform.logo_url} alt={platform.name} className="h-9 w-auto" />
                        ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                <BookOpen className="h-5 w-5" />
                            </div>
                        )}
                        <span className="font-bold text-xl text-gray-900">{platform.name || 'LMS'}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('auth.reset_password.title')}</h1>
                    <p className="text-sm text-gray-500">{t('auth.reset_password.subtitle')}</p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700" htmlFor="email">
                            {t('auth.reset_password.email')}
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            autoComplete="username"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* New password */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700" htmlFor="password">
                            {t('auth.reset_password.password')}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                id="password"
                                type={showPass ? 'text' : 'password'}
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                autoComplete="new-password"
                                autoFocus
                                className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                tabIndex={-1}
                            >
                                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700" htmlFor="password_confirmation">
                            {t('auth.reset_password.confirm_password')}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                id="password_confirmation"
                                type={showConfirm ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                                className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                tabIndex={-1}
                            >
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
                    >
                        {processing ? t('auth.reset_password.submitting') : t('auth.reset_password.submit')}
                    </button>
                </form>
            </div>
        </div>
    );
}
