import { Head, Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';

export default function InvitationInvalid() {
    const { props } = usePage();
    const platform = props.platform ?? {};

    return (
        <div className="flex min-h-screen bg-zinc-950 items-center justify-center p-6">
            <Head title="Invalid Invitation" />

            <div className="text-center space-y-5 max-w-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 mx-auto">
                    <ShieldAlert className="h-7 w-7 text-red-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Invitation expired or invalid</h1>
                    <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
                        This invitation link is no longer valid. It may have expired or already been used.
                        Please contact your administrator to request a new invitation.
                    </p>
                </div>
                <Link
                    href={route('admin.login')}
                    className="inline-block rounded-lg bg-zinc-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
                >
                    Go to admin login
                </Link>
            </div>
        </div>
    );
}
