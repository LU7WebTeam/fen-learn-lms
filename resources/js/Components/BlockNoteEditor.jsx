import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';

async function uploadImageToBN(file) {
    const formData = new FormData();
    formData.append('image', file);
    const token = document.cookie
        .split('; ')
        .find(r => r.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
    const res = await fetch('/admin/upload-image', {
        method: 'POST',
        headers: {
            'X-XSRF-TOKEN': token ? decodeURIComponent(token) : '',
        },
        body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const json = await res.json();
    return json.url;
}

export default function BlockNoteEditor({ initialContent, onChange }) {
    const editor = useCreateBlockNote({
        uploadFile: uploadImageToBN,
        initialContent: Array.isArray(initialContent) && initialContent.length > 0
            ? initialContent
            : undefined,
    });

    return (
        <div className="bn-editor-wrap">
            <BlockNoteView
                editor={editor}
                onChange={() => onChange?.(editor.document)}
                theme="light"
            />
        </div>
    );
}
