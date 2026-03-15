import { Link, usePage, router } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import { LogOut, User, ShieldCheck } from 'lucide-react';
import { useT } from '@/lib/i18n';

export default function UserMenu() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const t = useT();
    if (!user) return null;

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const isAdmin = user.role !== 'learner';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="mt-1 text-xs leading-none text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href={route('profile.edit')} className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t('user_menu.profile_settings')}
                    </Link>
                </DropdownMenuItem>

                {isAdmin && (
                    <DropdownMenuItem asChild>
                        <Link href={route('admin.dashboard')} className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            {t('user_menu.admin_panel')}
                        </Link>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => router.post(route('logout'))}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                    <LogOut className="h-4 w-4" />
                    {t('user_menu.log_out')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
