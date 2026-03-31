import { useCreateBlockNote, createReactBlockSpec } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import { normalizeBlockNoteInitialContent } from '@/lib/blocknote-content';
import '@blocknote/mantine/style.css';

function toEmbedUrl(url) {
    if (!url) return '';
    try {
        const u = new URL(url);
        // YouTube embed params
        const ytParams = 'controls=1&modestbranding=1&rel=0&showinfo=0';
        if ((u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') && u.searchParams.get('v')) {
            return `https://www.youtube.com/embed/${u.searchParams.get('v')}?${ytParams}`;
        }
        if (u.hostname === 'youtu.be') {
            return `https://www.youtube.com/embed${u.pathname}?${ytParams}`;
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
    const contentKey = JSON.stringify(initialContent);

    return <BlockNoteRendererInner key={contentKey} initialContent={initialContent} />;
}

import { useEffect, useRef } from 'react';

function BlockNoteRendererInner({ initialContent }) {
    const editor = useCreateBlockNote({
        schema,
        initialContent,
    });
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        // Patch: Insert spaces before/after inline marks and links if needed
        const markTags = ['STRONG', 'EM', 'U', 'MARK', 'A'];
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, null);
        let node;
        while ((node = walker.nextNode())) {
            if (markTags.includes(node.tagName)) {
                // Check previous sibling
                const prev = node.previousSibling;
                if (prev && prev.nodeType === Node.TEXT_NODE && !prev.textContent.endsWith(' ')) {
                    prev.textContent += ' ';
                }
                // Check next sibling
                const next = node.nextSibling;
                if (next && next.nodeType === Node.TEXT_NODE && !next.textContent.startsWith(' ')) {
                    next.textContent = ' ' + next.textContent;
                }
            }
        }
    }, [initialContent]);

    return (
        <div className="bn-renderer-wrap" ref={containerRef}>
            <BlockNoteView editor={editor} editable={false} theme="light" />
        </div>
    );
}
