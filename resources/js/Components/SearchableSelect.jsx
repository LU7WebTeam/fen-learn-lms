import { useMemo, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import { Check, ChevronDown, Search, X } from 'lucide-react';

function normalizeOption(option) {
    if (typeof option === 'string') {
        return { value: option, label: option };
    }

    return option;
}

export default function SearchableSelect({
    options,
    value,
    values,
    onChange,
    onValuesChange,
    multiple = false,
    placeholder = 'Select…',
    searchPlaceholder = 'Search…',
    emptyMessage = 'No matches found.',
    className = '',
    contentClassName = '',
    disabled = false,
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const normalizedOptions = useMemo(
        () => (options ?? []).map(normalizeOption),
        [options],
    );

    const filteredOptions = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return normalizedOptions;
        }

        return normalizedOptions.filter(option =>
            option.label.toLowerCase().includes(query),
        );
    }, [normalizedOptions, search]);

    const selectedValues = multiple ? (values ?? []) : [];
    const selectedLabels = normalizedOptions
        .filter(option => multiple ? selectedValues.includes(option.value) : option.value === value)
        .map(option => option.label);

    function toggleMultiValue(nextValue) {
        const nextValues = selectedValues.includes(nextValue)
            ? selectedValues.filter(item => item !== nextValue)
            : [...selectedValues, nextValue];

        onValuesChange?.(nextValues);
    }

    function clearSelection(event) {
        event.stopPropagation();

        if (multiple) {
            onValuesChange?.([]);
            return;
        }

        onChange?.('');
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={`w-full justify-between ${className}`}
                    disabled={disabled}
                >
                    <span className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden text-left">
                        {!selectedLabels.length ? (
                            <span className="truncate text-muted-foreground">{placeholder}</span>
                        ) : multiple ? (
                            <span className="flex flex-wrap gap-1 overflow-hidden">
                                {selectedLabels.slice(0, 2).map(label => (
                                    <Badge key={label} variant="secondary" className="max-w-[110px] truncate">
                                        {label}
                                    </Badge>
                                ))}
                                {selectedLabels.length > 2 && (
                                    <Badge variant="secondary">+{selectedLabels.length - 2}</Badge>
                                )}
                            </span>
                        ) : (
                            <span className="truncate">{selectedLabels[0]}</span>
                        )}
                    </span>
                    <span className="ml-2 flex items-center gap-1">
                        {(multiple ? selectedValues.length > 0 : !!value) && (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={clearSelection}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        clearSelection(event);
                                    }
                                }}
                                className="rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </span>
                        )}
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }} className={`p-0 ${contentClassName}`}>
                <div className="border-b p-2" onKeyDown={(event) => event.stopPropagation()}>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={searchPlaceholder}
                            className="h-8 pl-8"
                        />
                    </div>
                </div>

                <div className="max-h-64 overflow-y-auto p-1">
                    {filteredOptions.length === 0 ? (
                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                            {emptyMessage}
                        </div>
                    ) : filteredOptions.map(option => (
                        multiple ? (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => toggleMultiValue(option.value)}
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                            >
                                <Checkbox checked={selectedValues.includes(option.value)} />
                                <span className="truncate">{option.label}</span>
                            </button>
                        ) : (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange?.(option.value);
                                    setOpen(false);
                                }}
                                className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                            >
                                <span className="truncate">{option.label}</span>
                                {value === option.value && <Check className="h-4 w-4" />}
                            </button>
                        )
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}