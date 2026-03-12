import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookText, FileText, FolderOpen } from 'lucide-react';

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

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <CardTitle className="text-2xl">{selectedDocument.title}</CardTitle>
                            </div>
                            {selectedDocument.summary && (
                                <CardDescription>{selectedDocument.summary}</CardDescription>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-pre:overflow-x-auto prose-table:block prose-table:overflow-x-auto">
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
