import { Link } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';

export default function GuestLayout({ children, fullWidth = false }) {
    return (
        <div className={[
            'flex min-h-screen flex-col items-center bg-gray-100 pt-6',
            fullWidth ? 'sm:pt-6' : 'sm:justify-center sm:pt-0',
        ].join(' ')}>
            <div>
                <Link href="/" className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-gray-900">
                    <GraduationCap className="h-7 w-7 text-primary" />
                    <span className="text-lg font-semibold tracking-tight">Free LMS</span>
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
