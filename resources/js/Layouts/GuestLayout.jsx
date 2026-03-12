import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, fullWidth = false }) {
    return (
        <div className={[
            'flex min-h-screen flex-col items-center bg-gray-100 pt-6',
            fullWidth ? 'sm:pt-6' : 'sm:justify-center sm:pt-0',
        ].join(' ')}>
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                </Link>
            </div>

            <div className={[
                'mt-6 w-full',
                fullWidth
                    ? 'px-0'
                    : 'overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg',
            ].join(' ')}>
                {children}
            </div>

            <footer className="mt-8 pb-6 text-center text-xs text-gray-500 flex items-center gap-3">
                <Link href={route('about')} className="hover:text-gray-700 hover:underline">About</Link>
                <span>&middot;</span>
                <Link href={route('terms')} className="hover:text-gray-700 hover:underline">Terms</Link>
                <span>&middot;</span>
                <Link href={route('privacy')} className="hover:text-gray-700 hover:underline">Privacy</Link>
            </footer>
        </div>
    );
}
