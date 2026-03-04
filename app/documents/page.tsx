'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface UserDocument {
  id: number;
  title: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents ?? []);
      } else if (res.status === 401) {
        setDocuments([]);
      }
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadFile = useCallback(async (file: File) => {
    const allowed = /\.(pdf|txt|doc|docx)$/i;
    if (!allowed.test(file.name)) {
      toast.error('Only PDF, TXT, DOC, and DOCX files are supported');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10 MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/documents', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        toast.success(`"${file.name}" uploaded successfully`);
        fetchDocuments();
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [fetchDocuments]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  }, [uploadFile]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const deleteDocument = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`"${title}" deleted`);
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      } else {
        const data = await res.json();
        toast.error(data.error || 'Delete failed');
      }
    } catch {
      toast.error('Delete failed');
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <AppLayout showSidebar={false}>
      <div className="min-h-screen bg-neutral-950 text-white">
        {/* Header */}
        <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
          <div>
            <Typography variant="h2" className="text-white text-xl font-semibold">
              Documents
            </Typography>
            <p className="text-neutral-500 text-sm mt-0.5">
              Upload files to give the AI context from your documents
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !session}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          {/* Upload area */}
          {session ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-neutral-700 hover:border-neutral-500 bg-neutral-900/50'
              }`}
            >
              <svg
                className="w-10 h-10 mx-auto mb-3 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-neutral-400">
                {isDragging ? 'Drop files here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-neutral-600 mt-1">PDF, TXT, DOC, DOCX — max 10 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.doc,.docx"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
          ) : (
            <Card className="border-neutral-800 bg-neutral-900 p-6 text-center">
              <p className="text-neutral-400 text-sm">
                Sign in to upload and manage your documents.
              </p>
            </Card>
          )}

          {/* Document list */}
          <div>
            <Typography variant="h3" className="text-neutral-300 text-sm font-medium mb-3">
              Your documents ({documents.length})
            </Typography>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-lg bg-neutral-800 animate-pulse" />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <Card className="border-neutral-800 bg-neutral-900 p-8 text-center">
                <p className="text-neutral-500 text-sm">
                  {session ? 'No documents uploaded yet.' : 'Sign in to see your documents.'}
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3"
                  >
                    <svg className="w-5 h-5 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{doc.title}</p>
                      <p className="text-xs text-neutral-500">{formatDate(doc.createdAt)}</p>
                    </div>
                    <Badge variant={doc.isPublic ? 'default' : 'secondary'} className="text-xs shrink-0">
                      {doc.isPublic ? 'Public' : 'Private'}
                    </Badge>
                    <button
                      onClick={() => deleteDocument(doc.id, doc.title)}
                      className="text-neutral-600 hover:text-red-400 transition-colors shrink-0"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
