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
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';

const PDF_SAFE_COLOR_VARS = {
    '--background': '#ffffff',
    '--foreground': '#111827',
    '--card': '#ffffff',
    '--card-foreground': '#111827',
    '--popover': '#ffffff',
    '--popover-foreground': '#111827',
    '--primary': '#2563eb',
    '--primary-foreground': '#ffffff',
    '--secondary': '#475569',
    '--secondary-foreground': '#ffffff',
    '--muted': '#f3f4f6',
    '--muted-foreground': '#374151',
    '--accent': '#e5e7eb',
    '--accent-foreground': '#111827',
    '--destructive': '#dc2626',
    '--destructive-foreground': '#ffffff',
    '--border': '#d1d5db',
    '--input': '#d1d5db',
    '--ring': '#2563eb',
    '--chart-1': '#2563eb',
    '--chart-2': '#475569',
    '--chart-3': '#d97706',
    '--chart-4': '#7c3aed',
    '--chart-5': '#dc2626',
};

function applyPdfSafeColorVars(doc) {
    const root = doc?.documentElement;
    if (!root) return;

    Object.entries(PDF_SAFE_COLOR_VARS).forEach(([name, value]) => {
        root.style.setProperty(name, value);
    });
}

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

function markdownToPdfLines(markdown) {
    const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    const pdfLines = [];
    let inCodeBlock = false;

    for (const rawLine of lines) {
        const line = rawLine ?? '';
        const trimmed = line.trim();

        if (trimmed.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
        }

        if (!trimmed) {
            pdfLines.push('');
            continue;
        }

        if (inCodeBlock) {
            pdfLines.push(line);
            continue;
        }

        const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            pdfLines.push(toPlainText(headingMatch[2]).toUpperCase());
            pdfLines.push('');
            continue;
        }

        const bulletMatch = trimmed.match(/^[-*+]\s+(.+)$/);
        if (bulletMatch) {
            pdfLines.push(`• ${toPlainText(bulletMatch[1])}`);
            continue;
        }

        const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
        if (orderedMatch) {
            pdfLines.push(`- ${toPlainText(orderedMatch[1])}`);
            continue;
        }

        pdfLines.push(toPlainText(trimmed));
    }

    return pdfLines;
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
        if (!selectedDocument) return;
        setIsExportingPdf(true);
        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const marginX = 48;
            const marginTop = 56;
            const marginBottom = 48;
            const maxWidth = pageW - marginX * 2;
            const pageBottom = pageH - marginBottom;
            const lineHeight = 16;
            const headingGap = 10;
            const bodyGap = 6;
            const contentLines = [];

            contentLines.push(selectedDocument.title.toUpperCase());
            if (selectedDocument.summary) {
                contentLines.push('');
                contentLines.push(toPlainText(selectedDocument.summary));
            }
            contentLines.push('');
            contentLines.push(...markdownToPdfLines(selectedDocument.content));

            pdf.setProperties({
                title: selectedDocument.title,
                subject: selectedDocument.summary || 'Documentation',
                author: 'fen-learn-lms',
            });

            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor('#111827');

            let cursorY = marginTop;
            for (const line of contentLines) {
                const trimmed = String(line || '').trimEnd();

                if (!trimmed) {
                    cursorY += bodyGap;
                    continue;
                }

                const isHeading = trimmed === trimmed.toUpperCase() && trimmed.length > 1 && !trimmed.startsWith('• ');
                if (isHeading) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(18);
                } else {
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(11);
                }

                const wrappedLines = pdf.splitTextToSize(trimmed, maxWidth);
                for (const wrappedLine of wrappedLines) {
                    if (cursorY > pageBottom) {
                        pdf.addPage();
                        cursorY = marginTop;
                    }

                    pdf.text(wrappedLine, marginX, cursorY);
                    cursorY += isHeading ? 24 : lineHeight;
                }

                if (isHeading) {
                    cursorY += headingGap;
                }
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
