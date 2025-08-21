import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, X, Tag, Trash2 } from 'lucide-react';
import { Note, NoteFormData } from '@/types/note';
import { analytics } from '@/lib/analytics';

interface NoteEditorProps {
  note?: Note;
  onSave: (noteData: NoteFormData) => void;
  onDelete?: (noteId: string) => void;
  onCancel: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    const hasModifications = 
      title !== (note?.title || '') ||
      content !== (note?.content || '') ||
      JSON.stringify(tags) !== JSON.stringify(note?.tags || []);
    
    setHasChanges(hasModifications);
  }, [title, content, tags, note]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      return; // Don't save empty notes
    }

    onSave({
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      tags: tags.filter(tag => tag.trim()),
    });

    analytics.trackClick('note_save', { 
      is_new: !note,
      title_length: title.length,
      content_length: content.length,
      tags_count: tags.length
    });
  };

  const handleDelete = () => {
    if (note && onDelete && window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
      analytics.trackClick('note_delete', { note_id: note.id });
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
      analytics.trackClick('tag_add', { tag: trimmedTag });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    analytics.trackClick('tag_remove', { tag: tagToRemove });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--note-border))]">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          {hasChanges && (
            <Badge variant="secondary" className="text-xs">
              Unsaved changes
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {note && onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={!title.trim() && !content.trim()}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        {/* Title */}
        <Input
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-medium"
        />

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              className="flex-1"
            />
            <Button 
              size="sm" 
              variant="outline" 
              onClick={addTag}
              disabled={!tagInput.trim()}
            >
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeTag(tag)}
                >
                  {tag} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <Textarea
          placeholder="Start writing your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="note-editor flex-1 min-h-[300px]"
          style={{ resize: 'none' }}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[hsl(var(--note-border))] text-sm text-muted-foreground">
        {note && (
          <div className="flex justify-between">
            <span>Created: {new Date(note.created_at).toLocaleDateString()}</span>
            <span>Modified: {new Date(note.updated_at).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};