import { Link, usePage, router } from '@inertiajs/react';
import { BookOpen, LayoutDashboard, Menu, GraduationCap } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/Components/ui/sheet';
import { Button } from '@/Components/ui/button';
import UserMenu from '@/Components/UserMenu';

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
            <Link href="/courses" className={linkClass}>
                <BookOpen className="h-4 w-4" />
                Catalog
            </Link>
        </>
    );
}

export default function AuthenticatedLayout({ children }) {
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
                        <UserMenu />

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
