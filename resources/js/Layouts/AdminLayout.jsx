import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    GraduationCap,
    Menu,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/Components/ui/sheet';
import { Separator } from '@/Components/ui/separator';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Courses',   href: '/admin/courses',   icon: BookOpen        },
    { label: 'Users',     href: '/admin/users',     icon: Users           },
    { label: 'Settings',  href: '/admin/settings',  icon: Settings        },
];

function SidebarNav({ onNavigate }) {
    return (
        <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = window.location.pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.routeName}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                    >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                        {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                    </Link>
                );
            })}
        </nav>
    );
}

function Sidebar({ className }) {
    return (
        <aside className={cn('flex flex-col', className)}>
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    Free LMS
                </Link>
            </div>
            <div className="py-4">
                <p className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Admin
                </p>
                <SidebarNav />
            </div>
            <div className="mt-auto border-t p-4">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                    <Link href={route('dashboard')}>
                        ← Back to Learning
                    </Link>
                </Button>
            </div>
        </aside>
    );
}

export default function AdminLayout({ title, children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar className="hidden w-60 shrink-0 border-r lg:flex lg:flex-col" />

            <div className="flex flex-1 flex-col">
                <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-60 p-0">
                            <Sidebar className="flex flex-col" />
                        </SheetContent>
                    </Sheet>

                    <h1 className="text-lg font-semibold">{title}</h1>

                    <div className="ml-auto text-sm text-muted-foreground">
                        {user.name}
                    </div>
                </header>

                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
