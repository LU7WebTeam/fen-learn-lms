import { useState } from 'react';
import InputError from '@/Components/InputError';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff, BookOpen, Mail, Lock, User } from 'lucide-react';
import CaptchaField, { isCaptchaEnabled, resolveCaptchaToken } from '@/Components/CaptchaField';
import { useT } from '@/lib/i18n';

export default function Register() {
    const { props } = usePage();
    const platform = props.platform ?? {};
    const captchaConfig = props?.integrations?.captcha ?? {};
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [captchaClientError, setCaptchaClientError] = useState('');
    const t = useT();

    const { data, setData, post, transform, processing, errors, reset } = useForm({
        name:                 '',
        email:                '',
        password:             '',
        password_confirmation: '',
        captcha_token: '',
    });

    async function submit(e) {
        e.preventDefault();

        setCaptchaClientError('');

        const enabled = isCaptchaEnabled(captchaConfig, 'register');
        const token = await resolveCaptchaToken(captchaConfig, 'register', data.captcha_token);

        if (enabled && !token) {
            setCaptchaClientError(t('auth.captcha.required'));
            return;
        }

        transform((current) => ({ ...current, captcha_token: token || '' }))
            .post(route('register'), {
                onFinish: () => reset('password', 'password_confirmation'),
            });
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Head title="Create account" />

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
                            <span className="font-bold text-xl text-gray-900">{platform.name || 'LMS'}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('auth.register.title')}</h1>
                        <p className="text-sm text-gray-500">
                            {t('auth.register.subtitle')}
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700" htmlFor="name">
                                {t('auth.register.name')}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    autoComplete="name"
                                    autoFocus
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                    placeholder="Jane Smith"
                                />
                            </div>
                            <InputError message={errors.name} />
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700" htmlFor="email">
                                {t('auth.register.email')}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    autoComplete="username"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700" htmlFor="password">
                                {t('auth.register.password')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                    placeholder="••••••••"
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

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700" htmlFor="password_confirmation">
                                {t('auth.register.confirm_password')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="password_confirmation"
                                    type={showConfirm ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                    placeholder="••••••••"
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
                            {processing ? t('auth.register.submitting') : t('auth.register.submit')}
                        </button>

                        <CaptchaField
                            config={captchaConfig}
                            action="register"
                            token={data.captcha_token}
                            onTokenChange={(value) => setData('captcha_token', value)}
                            error={errors.captcha_token || captchaClientError}
                        />
                    </form>

                    <p className="text-center text-sm text-gray-500">
                        {t('auth.register.already_have_account')}{' '}
                        <Link href={route('login')} className="font-medium text-gray-800 hover:text-gray-900">
                            {t('auth.register.sign_in')}
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right panel — illustration / info */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gray-900">
                <div className="flex items-center gap-3">
                    {platform.logo_url ? (
                        <img src={platform.logo_url} alt={platform.name} className="h-8 w-auto brightness-0 invert" />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                            <BookOpen className="h-4 w-4 text-white" />
                        </div>
                    )}
                    <span className="text-white font-semibold">{platform.name || 'LMS'}</span>
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-white leading-tight">
                        Start your<br />learning journey
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
                        {platform.tagline || 'Access all your courses, track your progress, and earn certificates — all in one place.'}
                    </p>
                </div>

                <p className="text-xs text-gray-700">
                    &copy; {new Date().getFullYear()} {platform.name || 'LMS'}. All rights reserved.
                </p>
            </div>
        </div>
    );
}
