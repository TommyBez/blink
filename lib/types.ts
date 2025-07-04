export interface Note {
  id: string
  title: string
  content: string
  snippet: string
  createdAt: string
  notebookId: string
  tags: string[]
}

export interface Notebook {
  id: string
  name: string
}

export interface Tag {
  id: string
  name: string
}
