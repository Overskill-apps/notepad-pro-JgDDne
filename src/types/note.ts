export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface NoteFormData {
  title: string;
  content: string;
  tags?: string[];
}