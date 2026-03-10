import { useEffect } from 'react';
import InputError from '@/Components/InputError';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ShieldCheck, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';

export default function AdminLogin({ status, canResetPassword }) {
    const { props } = usePage();
    const platform = props.platform ?? {};
    const [showPass, setShowPass] = useState(false);

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
            <Head title="Admin Login" />

            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-zinc-900 border-r border-zinc-800">
                <div className="flex items-center gap-3">
                    {platform.logo_url ? (
                        <img src={platform.logo_url} alt={platform.name} className="h-8 w-auto" />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                            <ShieldCheck className="h-4 w-4 text-white" />
                        </div>
                    )}
                    <span className="text-white font-semibold text-lg">{platform.name || 'LMS Admin'}</span>
                </div>

                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-zinc-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Admin Portal
                    </div>
                    <h2 className="text-4xl font-bold text-white leading-tight">
                        Manage your<br />learning platform
                    </h2>
                    <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">
                        Access the admin dashboard to manage courses, learners, and platform settings.
                    </p>
                </div>

                <p className="text-xs text-zinc-600">
                    &copy; {new Date().getFullYear()} {platform.name || 'LMS'}. Admin access only.
                </p>
            </div>

            {/* Right panel — form */}
            <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8">
                <div className="w-full max-w-sm space-y-8">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-3 justify-center">
                        {platform.logo_url ? (
                            <img src={platform.logo_url} alt={platform.name} className="h-8 w-auto" />
                        ) : (
                            <ShieldCheck className="h-6 w-6 text-white" />
                        )}
                        <span className="text-white font-semibold">{platform.name || 'LMS Admin'}</span>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-white">Admin sign in</h1>
                        <p className="mt-1.5 text-sm text-zinc-400">
                            For administrators and content editors only.
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
                                Email address
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
                                Password
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
                                <span className="text-sm text-zinc-400">Remember me</span>
                            </label>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-50"
                        >
                            {processing ? 'Signing in…' : 'Sign in to admin'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-zinc-600">
                        Not an admin?{' '}
                        <Link href={route('login')} className="text-zinc-400 hover:text-white transition-colors">
                            Go to learner login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
