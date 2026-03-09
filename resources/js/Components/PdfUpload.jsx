import { useRef } from 'react';
import { Button } from '@/Components/ui/button';
import { FileText, X, Upload } from 'lucide-react';

export default function PdfUpload({ value, onFileChange, onClear, className = '' }) {
    const inputRef = useRef();

    const isFile  = value instanceof File;
    const hasValue = isFile || (typeof value === 'string' && value);
    const displayName = isFile
        ? value.name
        : (typeof value === 'string' && value ? decodeURIComponent(value.split('/').pop()) : null);

    function handleFile(file) {
        if (!file) return;
        onFileChange?.(file);
    }

    return (
        <div className={`space-y-2 ${className}`}>
            {hasValue ? (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                    <FileText className="h-8 w-8 flex-shrink-0 text-red-500" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{displayName}</p>
                        {!isFile && value && (
                            <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                            >
                                View current file ↗
                            </a>
                        )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => inputRef.current?.click()}
                        >
                            <Upload className="mr-1.5 h-3.5 w-3.5" />
                            Replace
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onClear}
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    onClick={() => inputRef.current?.click()}
                    onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <FileText className="h-8 w-8" />
                    <p className="text-sm font-medium">Click to upload a PDF</p>
                    <p className="text-xs">PDF — up to 20 MB</p>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
            />
        </div>
    );
}
