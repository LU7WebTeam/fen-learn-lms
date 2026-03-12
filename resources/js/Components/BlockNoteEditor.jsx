import { useCreateBlockNote, createReactBlockSpec, getDefaultReactSlashMenuItems, SuggestionMenuController } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import { normalizeBlockNoteInitialContent } from '@/lib/blocknote-content';
import '@blocknote/mantine/style.css';

function toEmbedUrl(url) {
    if (!url) return '';
    try {
        const u = new URL(url);
        if ((u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') && u.searchParams.get('v')) {
            return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
        }
        if (u.hostname === 'youtu.be') {
            return `https://www.youtube.com/embed${u.pathname}`;
        }
        if (u.hostname.includes('vimeo.com')) {
            const id = u.pathname.split('/').filter(Boolean).pop();
            return `https://player.vimeo.com/video/${id}`;
        }
    } catch {}
    return url;
}

const VideoEmbedBlock = createReactBlockSpec(
    { type: 'videoEmbed', propSchema: { url: { default: '' } }, content: 'none' },
    {
        render: ({ block }) => {
            const raw = block.props.url;
            if (!raw) return <p style={{ color: '#888', fontSize: 14, padding: '8px 0' }}>No video URL — click to edit</p>;
            const url = toEmbedUrl(raw);
            const isDirect = url === raw;
            if (isDirect) {
                return <video src={url} controls style={{ width: '100%', borderRadius: 6, display: 'block' }} />;
            }
            return (
                <div style={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
                    <iframe
                        src={url}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', borderRadius: 6 }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            );
        },
    }
);

const schema = BlockNoteSchema.create({
    blockSpecs: {
        ...defaultBlockSpecs,
        videoEmbed: VideoEmbedBlock(),
    },
});

async function uploadImageToBN(file) {
    const formData = new FormData();
    formData.append('file', file);
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
    return json.url.startsWith('http') ? json.url : (window.location.origin + json.url);
}

export default function BlockNoteEditor({ initialContent, onChange }) {
    const normalizedInitialContent = normalizeBlockNoteInitialContent(initialContent);

    const editor = useCreateBlockNote({
        schema,
        uploadFile: uploadImageToBN,
        initialContent: normalizedInitialContent,
    });

    return (
        <div className="bn-editor-wrap" style={{ minHeight: '420px' }}>
            <BlockNoteView
                editor={editor}
                onChange={() => onChange?.(editor.document)}
                theme="light"
                slashMenu={false}
            >
                <SuggestionMenuController
                    triggerCharacter="/"
                    getItems={async (query) => {
                        const defaults = getDefaultReactSlashMenuItems(editor);
                        const embedItem = {
                            title: 'Video Embed',
                            subtext: 'Embed YouTube, Vimeo, or direct .mp4 URL',
                            onItemClick: () => {
                                const url = window.prompt('Paste video URL (YouTube, Vimeo, or direct .mp4):');
                                if (!url) return;
                                editor.insertBlocks(
                                    [{ type: 'videoEmbed', props: { url } }],
                                    editor.getTextCursorPosition().block,
                                    'after'
                                );
                            },
                            group: 'Media',
                            icon: <span style={{ fontSize: 18 }}>🎬</span>,
                        };
                        const all = [...defaults, embedItem];
                        return query
                            ? all.filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
                            : all;
                    }}
                />
            </BlockNoteView>
        </div>
    );
}
