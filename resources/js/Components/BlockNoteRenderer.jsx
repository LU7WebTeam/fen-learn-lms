import { useCreateBlockNote, createReactBlockSpec } from '@blocknote/react';
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
            if (!raw) return null;
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

export default function BlockNoteRenderer({ content }) {
    const initialContent = normalizeBlockNoteInitialContent(content);

    const editor = useCreateBlockNote({
        schema,
        initialContent,
    });

    return (
        <div className="bn-renderer-wrap">
            <BlockNoteView editor={editor} editable={false} theme="light" />
        </div>
    );
}
