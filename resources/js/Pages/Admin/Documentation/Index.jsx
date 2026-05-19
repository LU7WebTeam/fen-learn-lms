import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookText, FileText, FolderOpen, FileDown } from 'lucide-react';
import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';

function sanitizeFileName(value) {
    return String(value || 'document')
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function toPlainText(markdownLine) {
    return markdownLine
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1 ($2)')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .trim();
}

function markdownToDocxParagraphs(markdown) {
    const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    const paragraphs = [];
    let inCodeBlock = false;

    for (const rawLine of lines) {
        const line = rawLine ?? '';
        const trimmed = line.trim();

        if (trimmed.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
        }

        if (!trimmed) {
            paragraphs.push(new Paragraph({}));
            continue;
        }

        if (inCodeBlock) {
            paragraphs.push(
                new Paragraph({
                    children: [new TextRun({ text: line, font: 'Courier New' })],
                })
            );
            continue;
        }

        const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            const levelMap = {
                1: HeadingLevel.HEADING_1,
                2: HeadingLevel.HEADING_2,
                3: HeadingLevel.HEADING_3,
                4: HeadingLevel.HEADING_4,
                5: HeadingLevel.HEADING_5,
                6: HeadingLevel.HEADING_6,
            };
            const level = headingMatch[1].length;
            paragraphs.push(
                new Paragraph({
                    heading: levelMap[level],
                    children: [new TextRun(toPlainText(headingMatch[2]))],
                })
            );
            continue;
        }

        const bulletMatch = trimmed.match(/^[-*+]\s+(.+)$/);
        if (bulletMatch) {
            paragraphs.push(
                new Paragraph({
                    bullet: { level: 0 },
                    children: [new TextRun(toPlainText(bulletMatch[1]))],
                })
            );
            continue;
        }

        const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
        if (orderedMatch) {
            paragraphs.push(
                new Paragraph({
                    children: [new TextRun(`- ${toPlainText(orderedMatch[1])}`)],
                })
            );
            continue;
        }

        paragraphs.push(
            new Paragraph({
                children: [new TextRun(toPlainText(trimmed))],
            })
        );
    }

    return paragraphs;
}

function DocSidebar({ documentsByCategory, selectedSlug }) {
    return (
        <Card className="lg:sticky lg:top-20">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <BookText className="h-5 w-5 text-primary" />
                    <CardTitle>Documentation</CardTitle>
                </div>
                <CardDescription>Internal admin reference loaded from markdown files.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {Object.entries(documentsByCategory).map(([category, documents]) => (
                    <div key={category} className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <FolderOpen className="h-3.5 w-3.5" />
                            {category}
                        </div>
                        <div className="space-y-1">
                            {documents.map((document) => (
                                <Link
                                    key={document.slug}
                                    href={route('admin.docs.index', document.slug)}
                                    className={[
                                        'block rounded-md border px-3 py-2 text-sm transition-colors',
                                        selectedSlug === document.slug
                                            ? 'border-primary bg-primary/5 text-foreground'
                                            : 'border-transparent hover:border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground',
                                    ].join(' ')}
                                >
                                    <div className="font-medium">{document.title}</div>
                                    {document.summary && (
                                        <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{document.summary}</div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default function DocumentationIndex({ documentsByCategory, selectedDocument }) {
    const previewRef = useRef(null);
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const handleDownloadPdf = async () => {
        const el = previewRef.current;
        if (!el || !selectedDocument) return;
        setIsExportingPdf(true);
        try {
            const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const margin = 40;
            const contentW = pageW - margin * 2;
            const imgH = (canvas.height * contentW) / canvas.width;
            let remainingH = imgH;
            let yOffset = margin;
            let srcYPx = 0;
            while (remainingH > 0) {
                const sliceH = Math.min(remainingH, pageH - margin * 2);
                const srcHPx = (sliceH / imgH) * canvas.height;
                const sliceCanvas = document.createElement('canvas');
                sliceCanvas.width = canvas.width;
                sliceCanvas.height = Math.round(srcHPx);
                const ctx = sliceCanvas.getContext('2d');
                ctx.drawImage(canvas, 0, srcYPx, canvas.width, Math.round(srcHPx), 0, 0, canvas.width, Math.round(srcHPx));
                pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, yOffset, contentW, sliceH);
                remainingH -= sliceH;
                srcYPx += Math.round(srcHPx);
                if (remainingH > 0) { pdf.addPage(); yOffset = margin; }
            }
            pdf.save(`${sanitizeFileName(selectedDocument.title)}.pdf`);
        } finally {
            setIsExportingPdf(false);
        }
    };

    const handleDownloadDocx = async () => {
        try {
            setIsExportingDocx(true);
            const doc = new Document({
                sections: [
                    {
                        children: [
                            new Paragraph({
                                heading: HeadingLevel.TITLE,
                                children: [new TextRun(selectedDocument.title)],
                            }),
                            ...(selectedDocument.summary
                                ? [
                                      new Paragraph({
                                          children: [new TextRun(selectedDocument.summary)],
                                      }),
                                      new Paragraph({}),
                                  ]
                                : []),
                            ...markdownToDocxParagraphs(selectedDocument.content),
                        ],
                    },
                ],
            });

            const blob = await Packer.toBlob(doc);
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `${sanitizeFileName(selectedDocument.slug || selectedDocument.title)}.docx`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            window.URL.revokeObjectURL(url);
        } finally {
            setIsExportingDocx(false);
        }
    };

    return (
        <AdminLayout title="Documentation">
            <Head title={`Documentation - ${selectedDocument.title}`} />

            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <DocSidebar documentsByCategory={documentsByCategory} selectedSlug={selectedDocument.slug} />

                <Card>
                    <CardHeader className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{selectedDocument.category}</Badge>
                            <Badge variant="outline">Updated {selectedDocument.updated_at}</Badge>
                            <Badge variant="outline">{selectedDocument.path}</Badge>
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-2xl">{selectedDocument.title}</CardTitle>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isExportingPdf}>
                                        <FileDown className="mr-2 h-4 w-4" />
                                        {isExportingPdf ? 'Generating PDF...' : 'Download PDF'}
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" onClick={handleDownloadDocx} disabled={isExportingDocx}>
                                        <FileDown className="mr-2 h-4 w-4" />
                                        {isExportingDocx ? 'Generating...' : 'Download DOCX'}
                                    </Button>
                                </div>
                            </div>
                            {selectedDocument.summary && (
                                <CardDescription>{selectedDocument.summary}</CardDescription>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div ref={previewRef} className="prose prose-sm max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-pre:overflow-x-auto prose-table:block prose-table:overflow-x-auto">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {selectedDocument.content}
                            </ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
