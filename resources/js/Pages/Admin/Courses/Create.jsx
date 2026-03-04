import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import InputError from '@/Components/InputError';
import { Loader2 } from 'lucide-react';

function Field({ label, error, children }) {
    return (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            {children}
            {error && <InputError message={error} />}
        </div>
    );
}

export default function CreateCourse() {
    const { data, setData, post, processing, errors } = useForm({
        title:       '',
        slug:        '',
        description: '',
        cover_image: '',
        category:    '',
        difficulty:  'beginner',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('admin.courses.store'));
    }

    function slugify(value) {
        return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    return (
        <AdminLayout title="New Course">
            <Head title="New Course — Admin" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">New Course</h2>
                    <p className="text-muted-foreground">Fill in the basics. You'll add sections and lessons next.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Course Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Field label="Title *" error={errors.title}>
                                <Input
                                    value={data.title}
                                    onChange={(e) => {
                                        setData('title', e.target.value);
                                        if (!data.slug) setData('slug', slugify(e.target.value));
                                    }}
                                    placeholder="e.g. Introduction to Python"
                                    autoFocus
                                />
                            </Field>

                            <Field label="Slug (URL identifier)" error={errors.slug}>
                                <Input
                                    value={data.slug}
                                    onChange={(e) => setData('slug', slugify(e.target.value))}
                                    placeholder="e.g. intro-to-python"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Auto-generated from the title. Must be unique.
                                </p>
                            </Field>

                            <Field label="Description" error={errors.description}>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="What will learners achieve by completing this course?"
                                    rows={4}
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Category" error={errors.category}>
                                    <Input
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        placeholder="e.g. Programming, Design"
                                    />
                                </Field>

                                <Field label="Difficulty *" error={errors.difficulty}>
                                    <Select value={data.difficulty} onValueChange={(v) => setData('difficulty', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">Beginner</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </div>

                            <Field label="Cover Image URL" error={errors.cover_image}>
                                <Input
                                    value={data.cover_image}
                                    onChange={(e) => setData('cover_image', e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    type="url"
                                />
                            </Field>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create & Build Curriculum
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
