import React, { useState, useEffect } from 'react';
import { NoteSidebar } from '@/components/NoteSidebar';
import { NoteEditor } from '@/components/NoteEditor';
import { NoteCard } from '@/components/NoteCard';
import { Button } from '@/components/ui/button';
import { useNotes } from '@/hooks/useNotes';
import { Note } from '@/types/note';
import { FileText, Plus, Grid, List } from 'lucide-react';
import { analytics } from '@/lib/analytics';

type ViewMode = 'list' | 'grid';

export default function Index() {
  const { notes, loading, createNote, updateNote, deleteNote, searchNotes } = useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  // Update filtered notes when search query or notes change
  useEffect(() => {
    const filtered = searchNotes(searchQuery);
    setFilteredNotes(filtered);
  }, [searchQuery, notes, searchNotes]);

  // Track app usage
  useEffect(() => {
    analytics.track('app_opened', { 
      notes_count: notes.length,
      view_mode: viewMode
    });
  }, []);

  const handleNewNote = () => {
    setSelectedNote(null);
    setIsEditing(true);
    analytics.trackClick('new_note_button');
  };

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(false);
    analytics.trackClick('note_select', { note_id: note.id });
  };

  const handleEditNote = () => {
    setIsEditing(true);
    analytics.trackClick('edit_note_button', { 
      note_id: selectedNote?.id 
    });
  };

  const handleSaveNote = (noteData: any) => {
    if (selectedNote) {
      // Update existing note
      const updated = updateNote(selectedNote.id, noteData);
      if (updated) {
        setSelectedNote(updated);
      }
    } else {
      // Create new note
      const newNote = createNote(noteData);
      setSelectedNote(newNote);
    }
    setIsEditing(false);
  };

  const handleDeleteNote = (noteId: string) => {
    const success = deleteNote(noteId);
    if (success) {
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (!selectedNote) {
      // If we were creating a new note, clear selection
      setSelectedNote(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <NoteSidebar
        notes={filteredNotes}
        selectedNoteId={selectedNote?.id}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNoteSelect={handleNoteSelect}
        onNewNote={handleNewNote}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {isEditing ? (
          /* Note Editor */
          <NoteEditor
            note={selectedNote || undefined}
            onSave={handleSaveNote}
            onDelete={selectedNote ? handleDeleteNote : undefined}
            onCancel={handleCancelEdit}
          />
        ) : selectedNote ? (
          /* Note Detail View */
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--note-border))]">
              <div>
                <h1 className="text-2xl font-bold">{selectedNote.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(selectedNote.updated_at).toLocaleString()}
                </p>
              </div>
              <Button onClick={handleEditNote}>
                Edit Note
              </Button>
            </div>

            {/* Tags */}
            {selectedNote.tags && selectedNote.tags.length > 0 && (
              <div className="p-4 border-b border-[hsl(var(--note-border))]">
                <div className="flex flex-wrap gap-2">
                  {selectedNote.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 p-4">
              <div className="prose max-w-none">
                {selectedNote.content ? (
                  <pre className="whitespace-pre-wrap font-sans text-foreground">
                    {selectedNote.content}
                  </pre>
                ) : (
                  <p className="text-muted-foreground italic">
                    This note is empty. Click "Edit Note" to add content.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Notes Overview */
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--note-border))]">
              <div>
                <h1 className="text-2xl font-bold">All Notes</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setViewMode('grid');
                      analytics.trackClick('view_mode_change', { mode: 'grid' });
                    }}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setViewMode('list');
                      analytics.trackClick('view_mode_change', { mode: 'list' });
                    }}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <Button onClick={handleNewNote}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              </div>
            </div>

            {/* Notes Grid/List */}
            <div className="flex-1 p-4 overflow-auto">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    {searchQuery ? 'No notes found' : 'Welcome to NotePad Pro!'}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery 
                      ? 'Try adjusting your search terms or create a new note.'
                      : 'Start capturing your thoughts and ideas by creating your first note.'
                    }
                  </p>
                  <Button onClick={handleNewNote} size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Note
                  </Button>
                </div>
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                      : 'space-y-3'
                  }
                >
                  {filteredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={() => handleNoteSelect(note)}
                      isSelected={selectedNote?.id === note.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
