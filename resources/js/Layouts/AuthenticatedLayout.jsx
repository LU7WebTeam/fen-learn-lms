import { Link, usePage, router } from '@inertiajs/react';
import { BookOpen, LayoutDashboard, Menu, GraduationCap } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/Components/ui/sheet';
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';

function NavItems({ mobile = false }) {
    const linkClass = mobile
        ? 'flex items-center gap-3 px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md'
        : 'flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors';

    return (
        <>
            <Link href={route('dashboard')} className={linkClass}>
                <LayoutDashboard className="h-4 w-4" />
                My Learning
            </Link>
            <Link href={route('courses.index', [], false) || '/courses'} className={linkClass}>
                <BookOpen className="h-4 w-4" />
                Catalog
            </Link>
        </>
    );
}

export default function AuthenticatedLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    function handleLogout() {
        router.post(route('logout'));
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <span className="hidden sm:inline">Free LMS</span>
                    </Link>

                    <nav className="hidden flex-1 items-center gap-6 sm:flex">
                        <NavItems />
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        {user.role !== 'learner' && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('admin.dashboard')}>Admin Panel</Link>
                            </Button>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback>{initials}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="px-2 py-1.5">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={route('profile.edit')}>Profile Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                                    Log Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="sm:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72">
                                <div className="flex items-center gap-2 pb-4 font-bold">
                                    <GraduationCap className="h-6 w-6 text-primary" />
                                    Free LMS
                                </div>
                                <nav className="flex flex-col gap-1">
                                    <NavItems mobile />
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            <main>{children}</main>
        </div>
    );
}
