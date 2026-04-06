import { useEffect } from 'react';
import InputError from '@/Components/InputError';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ShieldCheck, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/lib/i18n';

export default function AdminLogin({ status, canResetPassword }) {
    const { props } = usePage();
    const platform = props.platform ?? {};
    const platformDarkLogoUrl = platform.logo_dark_url ?? null;
    const [showPass, setShowPass] = useState(false);
    const t = useT();

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => reset('password');
    }, []);

    function submit(e) {
        e.preventDefault();
        post(route('admin.login'));
    }

    return (
        <div className="flex min-h-screen bg-zinc-950">
            <Head title={t('auth.admin.title')} />

            {/* Left panel — branding */}
            <div
                className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-cover bg-center bg-no-repeat relative"
                style={{ backgroundImage: "url('/images/admin-login-bg.webp')" }}
            >
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/60" />

                <div className="relative z-10" />

                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-zinc-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {t('auth.admin.portal_badge')}
                    </div>
                    <h2 className="text-4xl font-bold text-white leading-tight">
                        {t('auth.admin.hero_heading').split('\n').map((line, index) => (
                            <span key={index}>
                                {index > 0 && <br />}
                                {line}
                            </span>
                        ))}
                    </h2>
                </div>

                <p className="relative z-10 text-xs text-zinc-400">
                    &copy; {new Date().getFullYear()} {platform.name || 'LMS'}. {t('auth.admin.footer_note')}
                </p>
            </div>

            {/* Right panel — form */}
            <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8">
                <div className="w-full max-w-sm space-y-8">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-3 justify-center">
                        {platform.logo_url ? (
                            <img src={platformDarkLogoUrl || platform.logo_url} alt={platform.name} className="h-8 w-auto" />
                        ) : (
                            <ShieldCheck className="h-6 w-6 text-white" />
                        )}
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-white">{t('auth.admin.title')}</h1>
                        <p className="mt-1.5 text-sm text-zinc-400">
                            {t('auth.admin.subtitle')}
                        </p>
                    </div>

                    {status && (
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300" htmlFor="email">
                                {t('auth.login.email')}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    autoComplete="username"
                                    autoFocus
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                                    placeholder="admin@example.com"
                                />
                            </div>
                            <InputError message={errors.email} className="text-red-400" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300" htmlFor="password">
                                {t('auth.login.password')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    autoComplete="current-password"
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                    tabIndex={-1}
                                >
                                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <InputError message={errors.password} className="text-red-400" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-white"
                                />
                                <span className="text-sm text-zinc-400">{t('auth.login.remember_me')}</span>
                            </label>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                                >
                                    {t('auth.login.forgot_password')}
                                </Link>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-50"
                        >
                            {processing ? t('auth.admin.submitting') : t('auth.admin.submit')}
                        </button>
                    </form>

                    <p className="text-center text-sm text-zinc-600">
                        {t('auth.admin.not_admin')}{' '}
                        <Link href={route('login')} className="text-zinc-400 hover:text-white transition-colors">
                            {t('auth.admin.learner_login')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
