import { useState } from 'react';
import InputError from '@/Components/InputError';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff, BookOpen, Mail, Lock } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { props } = usePage();
    const platform = props.platform ?? {};
    const [showPass, setShowPass] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email:    '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Head title="Log in" />

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
                        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                        <p className="text-sm text-gray-500">
                            Sign in to continue your learning journey.
                        </p>
                    </div>

                    {status && (
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700" htmlFor="email">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    autoComplete="username"
                                    autoFocus
                                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700" htmlFor="password">
                                    Password
                                </label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="text-xs text-gray-500 hover:text-gray-800 transition-colors">
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    autoComplete="current-password"
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

                        <div className="flex items-center gap-2">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={e => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-gray-900"
                            />
                            <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                                Remember me
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
                        >
                            {processing ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    <div className="space-y-3 text-center text-sm text-gray-500">
                        <p>
                            Don't have an account?{' '}
                            <Link href={route('register')} className="font-medium text-gray-800 hover:text-gray-900">
                                Register
                            </Link>
                        </p>
                        <p>
                            Are you an admin?{' '}
                            <Link href={route('admin.login')} className="font-medium text-gray-800 hover:text-gray-900">
                                Admin login
                            </Link>
                        </p>
                    </div>
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
                        Learn at your<br />own pace
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
