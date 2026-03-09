import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';

export default function BlockNoteRenderer({ content }) {
    const editor = useCreateBlockNote({
        initialContent: Array.isArray(content) && content.length > 0
            ? content
            : undefined,
    });

    return (
        <div className="bn-renderer-wrap">
            <BlockNoteView editor={editor} editable={false} theme="light" />
        </div>
    );
}
