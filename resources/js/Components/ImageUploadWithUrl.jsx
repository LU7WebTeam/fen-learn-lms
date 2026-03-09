import { useRef, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { ImageIcon, X, Upload, Loader2 } from 'lucide-react';

function getCsrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export async function uploadImageFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(route('admin.upload.image'), {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': getCsrfToken() },
        body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const json = await res.json();
    return json.url;
}

export default function ImageUploadWithUrl({ value, onChange, className = '', aspectRatio = 'h-48' }) {
    const inputRef  = useRef();
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    const displaySrc = typeof value === 'string' && value ? value : null;

    async function handleFile(file) {
        if (!file) return;
        setLoading(true);
        setError(null);
        try {
            const url = await uploadImageFile(file);
            onChange(url);
        } catch {
            setError('Upload failed — try again.');
        } finally {
            setLoading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleFile(file);
    }

    return (
        <div className={`space-y-2 ${className}`}>
            {displaySrc ? (
                <div className="relative">
                    <img
                        src={displaySrc}
                        alt="Background preview"
                        className={`${aspectRatio} w-full rounded-lg object-cover border`}
                    />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : (
                <div
                    className={`flex ${aspectRatio} cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary ${loading ? 'opacity-60 pointer-events-none' : ''}`}
                    onClick={() => !loading && inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    {loading
                        ? <><Loader2 className="h-8 w-8 animate-spin" /><p className="text-sm">Uploading…</p></>
                        : <><ImageIcon className="h-10 w-10" /><p className="text-sm font-medium">Click or drag & drop to upload</p><p className="text-xs">PNG, JPG, WebP — up to 8 MB</p></>
                    }
                </div>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}

            {displaySrc && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => inputRef.current?.click()}
                >
                    {loading
                        ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Uploading…</>
                        : <><Upload className="mr-2 h-3.5 w-3.5" />Replace image</>
                    }
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
