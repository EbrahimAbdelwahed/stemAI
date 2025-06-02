'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface UserDocument {
  id: number;
  title: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentPrivacyNotice() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);

  const fetchDocuments = async () => {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: number) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
      } else {
        const error = await response.json();
        console.error('Failed to delete document:', error);
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const togglePublic = async (id: number, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      
      if (response.ok) {
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === id ? { ...doc, isPublic: !isPublic } : doc
          )
        );
      } else {
        const error = await response.json();
        console.error('Failed to update document:', error);
      }
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  };

  useEffect(() => {
    if (showDocuments && session?.user) {
      fetchDocuments();
    }
  }, [showDocuments, session?.user]);

  if (!session?.user) {
    return (
      <Card className="mb-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
        <CardHeader>
          <CardTitle className="text-yellow-800 dark:text-yellow-300 text-sm">
            ⚠️ Document Privacy Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            Documents uploaded without signing in are <strong>not private</strong> and may be accessible 
            to other users. <strong>Sign in to keep your documents private</strong> and secure.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
      <CardHeader>
        <CardTitle className="text-green-800 dark:text-green-300 text-sm flex items-center justify-between">
          <span>🔒 Document Privacy Protected</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDocuments(!showDocuments)}
          >
            {showDocuments ? 'Hide' : 'Manage'} Documents
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-green-700 dark:text-green-400 mb-3">
          Your documents are <strong>private by default</strong>. Only you can access them in your conversations.
        </p>
        
        {showDocuments && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Your Documents ({documents.length})</h4>
              {loading && <span className="text-sm text-muted-foreground">Loading...</span>}
            </div>
            
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.isPublic ? '🌍 Public' : '🔒 Private'} • 
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublic(doc.id, doc.isPublic)}
                        className="text-xs"
                      >
                        {doc.isPublic ? 'Make Private' : 'Make Public'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDocument(doc.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 