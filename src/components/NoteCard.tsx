import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Note } from '@/types/note';
import { formatDate } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  isSelected?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onClick,
  isSelected = false,
}) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card 
      className={`note-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-base line-clamp-2">
            {note.title}
          </h3>
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {formatDate(note.updated_at)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {note.content && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {truncateText(note.content, 150)}
          </p>
        )}
        
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{note.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};