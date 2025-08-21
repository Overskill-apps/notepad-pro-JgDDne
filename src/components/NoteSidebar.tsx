import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, FileText, Calendar } from 'lucide-react';
import { Note } from '@/types/note';
import { formatDate } from '@/lib/utils';

interface NoteSidebarProps {
  notes: Note[];
  selectedNoteId?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNoteSelect: (note: Note) => void;
  onNewNote: () => void;
}

export const NoteSidebar: React.FC<NoteSidebarProps> = ({
  notes,
  selectedNoteId,
  searchQuery,
  onSearchChange,
  onNoteSelect,
  onNewNote,
}) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-80 border-r border-[hsl(var(--note-border))] bg-[hsl(var(--note-bg))] flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[hsl(var(--note-border))]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            NotePad Pro
          </h1>
          <Button size="sm" onClick={onNewNote}>
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 bg-muted/30 border-b border-[hsl(var(--note-border))]">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>{notes.length} notes</span>
          </div>
          {searchQuery && (
            <div className="flex items-center gap-1">
              <Search className="w-4 h-4" />
              <span>Searching: "{truncateText(searchQuery, 15)}"</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchQuery ? 'No notes found' : 'No notes yet'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery 
                  ? 'Try a different search term' 
                  : 'Create your first note to get started'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`sidebar-note ${
                    selectedNoteId === note.id ? 'active' : ''
                  }`}
                  onClick={() => onNoteSelect(note)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm line-clamp-1 flex-1">
                      {note.title}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDate(note.updated_at)}
                    </span>
                  </div>
                  
                  {note.content && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {truncateText(note.content, 80)}
                    </p>
                  )}
                  
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 2).map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="text-xs px-1 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{note.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};