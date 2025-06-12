import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { documents, chunks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: documentId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required to delete documents' },
        { status: 401 }
      );
    }

    // Parse document ID
    const docId = parseInt(documentId);
    if (isNaN(docId)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    // Verify document ownership
    const [document] = await db
      .select()
      .from(documents)
      .where(and(
        eq(documents.id, docId),
        eq(documents.userId, session.user.id)
      ));

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Delete associated chunks first (due to foreign key constraint)
    await db
      .delete(chunks)
      .where(eq(chunks.documentId, docId));

    // Delete the document
    await db
      .delete(documents)
      .where(eq(documents.id, docId));

    return NextResponse.json({
      success: true,
      message: `Document "${document.title}" has been deleted successfully`
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: documentId } = await params;
    const body = await request.json();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required to update documents' },
        { status: 401 }
      );
    }

    // Parse document ID
    const docId = parseInt(documentId);
    if (isNaN(docId)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    // Verify document ownership
    const [document] = await db
      .select()
      .from(documents)
      .where(and(
        eq(documents.id, docId),
        eq(documents.userId, session.user.id)
      ));

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Update document (currently only supporting isPublic flag)
    const updates: any = {};
    if (typeof body.isPublic === 'boolean') {
      updates.isPublic = body.isPublic;
    }
    if (body.title && typeof body.title === 'string') {
      updates.title = body.title.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    const [updatedDocument] = await db
      .update(documents)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(documents.id, docId))
      .returning();

    return NextResponse.json({
      success: true,
      document: updatedDocument,
      message: 'Document updated successfully'
    });

  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
} 