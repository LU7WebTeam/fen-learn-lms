import { useRef, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { ImageIcon, X, Upload } from 'lucide-react';

export default function ImageUpload({ value, onFileChange, onClear, className = '' }) {
    const inputRef = useRef();
    const [preview, setPreview] = useState(null);

    const displaySrc = preview || (typeof value === 'string' && value ? value : null);

    function handleFile(file) {
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        onFileChange?.(file);
    }

    function handleDrop(e) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleFile(file);
    }

    function handleClear() {
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
        onClear?.();
    }

    return (
        <div className={`space-y-2 ${className}`}>
            {displaySrc ? (
                <div className="relative">
                    <img
                        src={displaySrc}
                        alt="Cover preview"
                        className="h-48 w-full rounded-lg object-cover border"
                    />
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : (
                <div
                    className="flex h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                >
                    <ImageIcon className="h-10 w-10" />
                    <p className="text-sm font-medium">Click or drag & drop to upload</p>
                    <p className="text-xs">PNG, JPG, WebP — up to 5 MB</p>
                </div>
            )}

            {displaySrc && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                >
                    <Upload className="mr-2 h-3.5 w-3.5" />
                    Replace image
                </Button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
            />
        </div>
    );
}
