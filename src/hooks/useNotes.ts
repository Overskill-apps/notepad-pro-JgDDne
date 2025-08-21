import { useState, useEffect } from 'react';
import { Note, NoteFormData } from '@/types/note';
import { analytics } from '@/lib/analytics';

// Local storage key
const NOTES_STORAGE_KEY = 'notepad-pro-notes';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
      if (storedNotes) {
        const parsedNotes = JSON.parse(storedNotes);
        setNotes(parsedNotes);
        analytics.track('notes_loaded', { count: parsedNotes.length });
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      analytics.trackError(error as Error, { context: 'loading_notes' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
      } catch (error) {
        console.error('Error saving notes:', error);
        analytics.trackError(error as Error, { context: 'saving_notes' });
      }
    }
  }, [notes, loading]);

  const createNote = (noteData: NoteFormData): Note => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: noteData.title || 'Untitled Note',
      content: noteData.content,
      tags: noteData.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setNotes(prev => [newNote, ...prev]);
    analytics.track('note_created', { 
      title_length: newNote.title.length,
      content_length: newNote.content.length,
      has_tags: (newNote.tags?.length || 0) > 0
    });
    
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<NoteFormData>): Note | null => {
    let updatedNote: Note | null = null;
    
    setNotes(prev => prev.map(note => {
      if (note.id === id) {
        updatedNote = {
          ...note,
          ...updates,
          updated_at: new Date().toISOString(),
        };
        return updatedNote;
      }
      return note;
    }));

    if (updatedNote) {
      analytics.track('note_updated', { 
        note_id: id,
        title_length: (updatedNote as Note).title.length,
        content_length: (updatedNote as Note).content.length
      });
    }

    return updatedNote;
  };

  const deleteNote = (id: string): boolean => {
    const noteToDelete = notes.find(note => note.id === id);
    if (!noteToDelete) return false;

    setNotes(prev => prev.filter(note => note.id !== id));
    analytics.track('note_deleted', { 
      note_id: id,
      title_length: noteToDelete.title.length,
      content_length: noteToDelete.content.length
    });
    
    return true;
  };

  const getNote = (id: string): Note | undefined => {
    return notes.find(note => note.id === id);
  };

  const searchNotes = (query: string): Note[] => {
    if (!query.trim()) return notes;
    
    const lowercaseQuery = query.toLowerCase();
    const filteredNotes = notes.filter(note => 
      note.title.toLowerCase().includes(lowercaseQuery) ||
      note.content.toLowerCase().includes(lowercaseQuery) ||
      note.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );

    analytics.track('notes_searched', { 
      query_length: query.length,
      results_count: filteredNotes.length
    });

    return filteredNotes;
  };

  return {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    getNote,
    searchNotes,
  };
};