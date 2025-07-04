"use client"

import { useState, useEffect } from "react"
import { MoreVertical, ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RichTextEditor } from "@/components/rich-text-editor"
import { TagSelector } from "@/components/tag-selector"
import type { Note, Tag } from "@/lib/types"
import { updateNoteAction } from "@/app/actions"
import { useDebounce } from "@/hooks/use-debounce"

interface NoteEditorProps {
  note: Note | null
  onBack: () => void
  onDelete: (noteId: string) => void
  onUpdate: (noteId: string, updates: Partial<Pick<Note, "title" | "content" | "tags">>) => void
  availableTags: Tag[]
  onCreateTag: (name: string) => Promise<string | undefined> // Return the new tag ID
}

export function NoteEditor({ note, onBack, onDelete, onUpdate, availableTags, onCreateTag }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "")
  const [content, setContent] = useState(note?.content || "")
  const [tags, setTags] = useState<string[]>(note?.tags || [])

  const debouncedTitle = useDebounce(title, 500)
  const debouncedContent = useDebounce(content, 1000)
  const debouncedTags = useDebounce(tags, 500)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setTags(note.tags)
    }
  }, [note])

  useEffect(() => {
    if (note && debouncedTitle !== note.title) {
      onUpdate(note.id, { title: debouncedTitle })
      updateNoteAction({ noteId: note.id, title: debouncedTitle })
    }
  }, [debouncedTitle, note, onUpdate])

  useEffect(() => {
    if (note && debouncedContent !== note.content) {
      onUpdate(note.id, { content: debouncedContent })
      updateNoteAction({ noteId: note.id, content: debouncedContent })
    }
  }, [debouncedContent, note, onUpdate])

  useEffect(() => {
    if (note && JSON.stringify(debouncedTags) !== JSON.stringify(note.tags)) {
      onUpdate(note.id, { tags: debouncedTags })
      updateNoteAction({ noteId: note.id, tags: debouncedTags })
    }
  }, [debouncedTags, note, onUpdate])

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags)
  }

  const handleCreateTagFromEditor = async (name: string): Promise<string | undefined> => {
    const newTagId = await onCreateTag(name)
    return newTagId
  }

  if (!note) {
    return (
      <div className="hidden md:flex flex-1 items-center justify-center h-full text-muted-foreground">
        <p>Select a note to view or create a new one.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to notes</span>
          </Button>
          <div className="flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Note"
              className="h-auto p-0 text-xl lg:text-2xl font-bold border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {new Date(note.createdAt).toLocaleString()}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Note</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <TagSelector
            availableTags={availableTags}
            selectedTagIds={tags}
            onTagsChange={handleTagsChange}
            onCreateTag={handleCreateTagFromEditor}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <RichTextEditor content={content} onChange={setContent} />
      </div>
    </div>
  )
}
