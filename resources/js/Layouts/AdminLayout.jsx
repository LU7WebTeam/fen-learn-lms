import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    ScrollText,
    BookText,
    GraduationCap,
    Sun,
    Moon,
    LogOut,
    User,
    ChevronUp,
    ArrowLeft,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from '@/Components/ui/sidebar';
import { useTheme } from '@/Components/ThemeProvider';
import { cn } from '@/lib/utils';

const navMain = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Courses',   href: '/admin/courses',   icon: BookOpen        },
    { label: 'Users',     href: '/admin/users',     icon: Users           },
    { label: 'Documentation', href: '/admin/docs', icon: BookText },
    { label: 'Activity Logs', href: '/admin/activity-logs', icon: ScrollText },
];

const navSecondary = [
    { label: 'Settings', href: '/admin/settings', icon: Settings },
];

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function NavUser({ user }) {
    function logout() {
        router.post(route('logout'));
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.name}</span>
                                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                            </div>
                            <ChevronUp className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="top"
                        align="end"
                        sideOffset={4}
                        className="w-56"
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-2 py-1.5">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user.name}</span>
                                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={route('profile.edit')}>
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

function AppSidebar() {
    const { url } = usePage();

    function isActive(href) {
        return url.startsWith(href);
    }

    return (
        <Sidebar collapsible="icon">
            {/* ── Header: brand ── */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <GraduationCap className="h-4 w-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">FENLearn</span>
                                    <span className="truncate text-xs text-muted-foreground">Admin</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ── Content: main nav ── */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navMain.map(item => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                            tooltip={item.label}
                                        >
                                            <Link href={item.href}>
                                                <Icon />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* ── Secondary nav (pinned to bottom of content) ── */}
                <SidebarGroup className="mt-auto">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navSecondary.map(item => {
                                const Icon = item.icon;
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton asChild tooltip={item.label} isActive={isActive(item.href)}>
                                            <Link href={item.href}>
                                                <Icon />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Back to Learning">
                                    <Link href={route('dashboard')}>
                                        <ArrowLeft />
                                        <span>Back to Learning</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* ── Footer: user button ── */}
            <SidebarFooter>
                <NavUserFromPage />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}

function NavUserFromPage() {
    const { auth } = usePage().props;
    return <NavUser user={auth.user} />;
}

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {theme === 'dark'
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />
            }
        </Button>
    );
}

export default function AdminLayout({ title, children }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {/* ── Top header bar ── */}
                <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="h-4" />
                        <span className="text-sm font-medium text-muted-foreground">{title}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                        <ThemeToggle />
                    </div>
                </header>

                {/* ── Page content ── */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
