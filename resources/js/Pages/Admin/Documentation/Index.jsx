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

function tokenizeMarkdownInline(markdownLine) {
    const pattern = /(\!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
    const tokens = [];
    let lastIndex = 0;

    for (const match of markdownLine.matchAll(pattern)) {
        const index = match.index ?? 0;
        const rawToken = match[0];

        if (index > lastIndex) {
            tokens.push({ text: markdownLine.slice(lastIndex, index), style: {} });
        }

        if (rawToken.startsWith('![')) {
            const imageMatch = rawToken.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
            if (imageMatch) {
                tokens.push({ text: imageMatch[1] || imageMatch[2], style: { italic: true } });
            }
        } else if (rawToken.startsWith('[')) {
            const linkMatch = rawToken.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (linkMatch) {
                tokens.push({ text: linkMatch[1], style: { link: true, href: linkMatch[2], underline: true, color: '#2563eb' } });
            }
        } else if (rawToken.startsWith('```')) {
            tokens.push({ text: rawToken.slice(3, -3), style: { code: true } });
        } else if (rawToken.startsWith('***')) {
            tokens.push({ text: rawToken.slice(3, -3), style: { bold: true, italic: true } });
        } else if (rawToken.startsWith('**') || rawToken.startsWith('__')) {
            tokens.push({ text: rawToken.slice(2, -2), style: { bold: true } });
        } else if (rawToken.startsWith('*') || rawToken.startsWith('_')) {
            tokens.push({ text: rawToken.slice(1, -1), style: { italic: true } });
        } else {
            tokens.push({ text: rawToken, style: {} });
        }

        lastIndex = index + rawToken.length;
    }

    if (lastIndex < markdownLine.length) {
        tokens.push({ text: markdownLine.slice(lastIndex), style: {} });
    }

    return tokens.filter((token) => token.text.length > 0);
}

function parseMarkdownBlocks(markdown) {
    const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    const blocks = [];
    let paragraphLines = [];
    let inCodeBlock = false;
    let codeLines = [];

    const flushParagraph = () => {
        const text = paragraphLines.join(' ').replace(/\s+/g, ' ').trim();
        if (text) {
            blocks.push({ type: 'paragraph', text });
        }
        paragraphLines = [];
    };

    for (const rawLine of lines) {
        const line = rawLine ?? '';
        const trimmed = line.trim();

        if (trimmed.startsWith('```')) {
            if (inCodeBlock) {
                blocks.push({ type: 'code', lines: codeLines.slice() });
                codeLines = [];
            } else {
                flushParagraph();
            }
            inCodeBlock = !inCodeBlock;
            continue;
        }

        if (inCodeBlock) {
            codeLines.push(line);
            continue;
        }

        if (!trimmed) {
            flushParagraph();
            continue;
        }

        const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            flushParagraph();
            blocks.push({
                type: 'heading',
                level: headingMatch[1].length,
                text: toPlainText(headingMatch[2]),
            });
            continue;
        }

        const bulletMatch = trimmed.match(/^([-*+])\s+(.+)$/);
        if (bulletMatch) {
            flushParagraph();
            blocks.push({
                type: 'listItem',
                ordered: false,
                text: toPlainText(bulletMatch[2]),
            });
            continue;
        }

        const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
        if (orderedMatch) {
            flushParagraph();
            blocks.push({
                type: 'listItem',
                ordered: true,
                index: Number(orderedMatch[1]),
                text: toPlainText(orderedMatch[2]),
            });
            continue;
        }

        const blockquoteMatch = trimmed.match(/^>\s+(.+)$/);
        if (blockquoteMatch) {
            flushParagraph();
            blocks.push({ type: 'blockquote', text: toPlainText(blockquoteMatch[1]) });
            continue;
        }

        paragraphLines.push(trimmed);
    }

    flushParagraph();

    if (codeLines.length) {
        blocks.push({ type: 'code', lines: codeLines.slice() });
    }

    return blocks;
}

function getPdfFontStyle(style) {
    if (style.bold && style.italic) return 'bolditalic';
    if (style.bold) return 'bold';
    if (style.italic) return 'italic';
    return 'normal';
}

function applyPdfTextStyle(pdf, style = {}) {
    pdf.setFont(style.fontFamily || 'helvetica', getPdfFontStyle(style));
    pdf.setFontSize(style.fontSize || 11);
    pdf.setTextColor(style.color || '#111827');
}

function splitStyledSegments(pdf, segments, maxWidth) {
    const lines = [];
    let currentLine = [];
    let currentWidth = 0;

    const pushLine = () => {
        if (currentLine.length) {
            lines.push(currentLine);
        }
        currentLine = [];
        currentWidth = 0;
    };

    for (const segment of segments) {
        const parts = String(segment.text || '').split(/(\s+)/);

        for (const part of parts) {
            if (!part) continue;

            if (part.includes('\n')) {
                const newlineParts = part.split('\n');
                newlineParts.forEach((newlinePart, index) => {
                    if (newlinePart) {
                        const textPart = { ...segment, text: newlinePart };
                        applyPdfTextStyle(pdf, textPart.style || segment.style || {});
                        const partWidth = pdf.getTextWidth(newlinePart);
                        if (currentWidth > 0 && currentWidth + partWidth > maxWidth && newlinePart.trim()) {
                            pushLine();
                        }
                        currentLine.push(textPart);
                        currentWidth += partWidth;
                    }

                    if (index < newlineParts.length - 1) {
                        pushLine();
                    }
                });
                continue;
            }

            const text = part;
            applyPdfTextStyle(pdf, segment.style || {});
            const partWidth = pdf.getTextWidth(text);

            if (currentWidth > 0 && currentWidth + partWidth > maxWidth && text.trim()) {
                pushLine();
            }

            if (!currentLine.length && !text.trim()) {
                continue;
            }

            currentLine.push({ ...segment, text });
            currentWidth += partWidth;
        }
    }

    if (currentLine.length) {
        lines.push(currentLine);
    }

    return lines.length ? lines : [[]];
}

function renderStyledLine(pdf, segments, x, y) {
    let cursorX = x;

    for (const segment of segments) {
        const style = segment.style || {};
        applyPdfTextStyle(pdf, style);
        pdf.text(segment.text, cursorX, y);

        if (style.underline) {
            const width = pdf.getTextWidth(segment.text);
            pdf.setDrawColor(style.color || '#2563eb');
            pdf.setLineWidth(0.6);
            pdf.line(cursorX, y + 1.5, cursorX + width, y + 1.5);
        }

        cursorX += pdf.getTextWidth(segment.text);
    }
}

function renderWrappedStyledText(pdf, segments, options) {
    const { x, yStart, maxWidth, pageBottom, marginTop, lineHeight, blockGap = 0 } = options;
    const lines = splitStyledSegments(pdf, segments, maxWidth);
    let cursorY = yStart;

    for (const lineSegments of lines) {
        if (cursorY > pageBottom) {
            pdf.addPage();
            cursorY = marginTop;
        }

        renderStyledLine(pdf, lineSegments, x, cursorY);
        cursorY += lineHeight;
    }

    return cursorY + blockGap;
}

function renderPdfMarkdown(pdf, markdown, options) {
    const { pageW, pageH, marginX, marginTop, marginBottom } = options;
    const maxWidth = pageW - marginX * 2;
    const pageBottom = pageH - marginBottom;
    const blocks = parseMarkdownBlocks(markdown);
    let cursorY = marginTop;

    const ensurePageBreak = (neededSpace = 0) => {
        if (cursorY + neededSpace > pageBottom) {
            pdf.addPage();
            cursorY = marginTop;
        }
    };

    for (const block of blocks) {
        if (block.type === 'heading') {
            const headingSizes = { 1: 20, 2: 17, 3: 15, 4: 13, 5: 12, 6: 11 };
            const fontSize = headingSizes[block.level] || 15;
            const lineHeight = fontSize + 5;
            ensurePageBreak(lineHeight + 8);
            pdf.setFont('helvetica', 'bold');
            cursorY = renderWrappedStyledText(pdf, [{ text: block.text.toUpperCase(), style: { bold: true, fontSize } }], {
                x: marginX,
                yStart: cursorY,
                maxWidth,
                pageBottom,
                marginTop,
                lineHeight,
                blockGap: 4,
            });
            cursorY += 6;
            continue;
        }

        if (block.type === 'listItem') {
            const marker = block.ordered ? `${block.index}.` : '•';
            const indent = block.ordered ? 22 : 18;
            const lineHeight = 16;
            ensurePageBreak(lineHeight + 4);
            pdf.setFont('helvetica', 'normal');
            applyPdfTextStyle(pdf, { fontSize: 11 });
            pdf.text(marker, marginX, cursorY);
            cursorY = renderWrappedStyledText(pdf, tokenizeMarkdownInline(block.text), {
                x: marginX + indent,
                yStart: cursorY,
                maxWidth: maxWidth - indent,
                pageBottom,
                marginTop,
                lineHeight,
                blockGap: 2,
            });
            cursorY += 2;
            continue;
        }

        if (block.type === 'blockquote') {
            const lineHeight = 16;
            ensurePageBreak(lineHeight + 8);
            pdf.setTextColor('#475569');
            cursorY = renderWrappedStyledText(pdf, tokenizeMarkdownInline(block.text), {
                x: marginX + 14,
                yStart: cursorY,
                maxWidth: maxWidth - 14,
                pageBottom,
                marginTop,
                lineHeight,
                blockGap: 4,
            });
            pdf.setTextColor('#111827');
            pdf.setDrawColor('#d1d5db');
            pdf.setLineWidth(1);
            pdf.line(marginX + 2, cursorY - 20, marginX + 2, cursorY - 2);
            cursorY += 4;
            continue;
        }

        if (block.type === 'code') {
            const codeFontSize = 10;
            const lineHeight = 14;
            const blockHeight = block.lines.length * lineHeight + 12;
            ensurePageBreak(blockHeight + 8);
            pdf.setFillColor('#f3f4f6');
            pdf.setDrawColor('#e5e7eb');
            pdf.roundedRect(marginX - 4, cursorY - 10, maxWidth + 8, blockHeight, 4, 4, 'FD');
            pdf.setFont('courier', 'normal');
            pdf.setFontSize(codeFontSize);
            pdf.setTextColor('#111827');

            let codeY = cursorY;
            for (const codeLine of block.lines) {
                const wrappedCodeLines = pdf.splitTextToSize(codeLine, maxWidth - 8);
                for (const wrappedCodeLine of wrappedCodeLines) {
                    if (codeY > pageBottom) {
                        pdf.addPage();
                        codeY = marginTop;
                    }
                    pdf.text(wrappedCodeLine, marginX + 4, codeY);
                    codeY += lineHeight;
                }
            }

            cursorY = codeY + 4;
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor('#111827');
            continue;
        }

        if (block.type === 'paragraph') {
            const lineHeight = 16;
            ensurePageBreak(lineHeight + 4);
            cursorY = renderWrappedStyledText(pdf, tokenizeMarkdownInline(block.text), {
                x: marginX,
                yStart: cursorY,
                maxWidth,
                pageBottom,
                marginTop,
                lineHeight,
                blockGap: 4,
            });
            cursorY += 2;
        }
    }

    return cursorY;
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
