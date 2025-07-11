export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Notebook {
  id: string
  name: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  title: string
  content: string
  snippet: string
  notebook_id: string
  user_id: string
  created_at: string
  updated_at: string
  tags?: string[]
  notebook?: { name: string }
}

export interface NoteTag {
  note_id: string
  tag_id: string
  created_at: string
}
