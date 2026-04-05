import { Head, Link } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import { useT } from '@/lib/i18n';

export default function InvitationInvalid() {
    const t = useT();

    return (
        <div className="flex min-h-screen bg-zinc-950 items-center justify-center p-6">
            <Head title={t('auth.invitation.invalid_title')} />

            <div className="text-center space-y-5 max-w-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 mx-auto">
                    <ShieldAlert className="h-7 w-7 text-red-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">{t('auth.invitation.invalid_heading')}</h1>
                    <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
                        {t('auth.invitation.invalid_description')}
                    </p>
                </div>
                <Link
                    href={route('login')}
                    className="inline-block rounded-lg bg-zinc-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
                >
                    {t('auth.invitation.go_to_login')}
                </Link>
            </div>
        </div>
    );
}
