import { Moon, Sun } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { useTheme } from '@/Components/ThemeProvider';

export default function ThemeToggleButton({ className = '' }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={className || 'h-8 w-8'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    );
}
