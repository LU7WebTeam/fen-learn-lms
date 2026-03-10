import { useState } from 'react';
import InputError from '@/Components/InputError';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ShieldCheck, Eye, EyeOff, User, Lock } from 'lucide-react';

const ROLE_LABELS = {
    super_admin:    'Super Admin',
    content_editor: 'Content Editor',
};

export default function AcceptInvitation({ token, email, role }) {
    const { props } = usePage();
    const platform = props.platform ?? {};
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name:                  '',
        password:              '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('invitations.accept', token));
    }

    return (
        <div className="flex min-h-screen bg-zinc-950 items-center justify-center p-6">
            <Head title="Accept Invitation" />

            <div className="w-full max-w-md">
                <div className="mb-8 text-center space-y-3">
                    {platform.logo_url ? (
                        <img src={platform.logo_url} alt={platform.name} className="h-10 w-auto mx-auto" />
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 mx-auto">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-white">Set up your account</h1>
                        <p className="text-zinc-400 mt-1 text-sm">
                            You've been invited as a{' '}
                            <span className="font-medium text-white">{ROLE_LABELS[role] ?? role}</span> on{' '}
                            <span className="font-medium text-white">{platform.name || 'the platform'}</span>.
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 space-y-6">
                    <div className="rounded-lg bg-zinc-800/60 border border-zinc-700 px-4 py-3">
                        <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium mb-0.5">Signing up as</p>
                        <p className="text-sm text-white font-medium">{email}</p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300" htmlFor="name">
                                Full name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    autoFocus
                                    autoComplete="name"
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                                    placeholder="Your full name"
                                />
                            </div>
                            <InputError message={errors.name} className="text-red-400" />
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
                                    autoComplete="new-password"
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                                    placeholder="Min. 8 characters"
                                />
                                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300" tabIndex={-1}>
                                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <InputError message={errors.password} className="text-red-400" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300" htmlFor="password_confirmation">
                                Confirm password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <input
                                    id="password_confirmation"
                                    type={showConfirm ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                                    placeholder="Repeat your password"
                                />
                                <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300" tabIndex={-1}>
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} className="text-red-400" />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-50"
                        >
                            {processing ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-zinc-600 mt-6">
                    Already have an account?{' '}
                    <a href={route('admin.login')} className="text-zinc-400 hover:text-white transition-colors">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}
