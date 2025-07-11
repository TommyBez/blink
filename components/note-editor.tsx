"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { RichTextEditor } from "./rich-text-editor"
import { TagSelector } from "./tag-selector"
import { useDebounce } from "@/hooks/use-debounce"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import type { Note, Tag } from "@/lib/types"
import type { User } from "@supabase/supabase-js"
import { toast } from "sonner"

interface NoteEditorProps {
  note: Note | null
  onBack: () => void
  onDelete: (noteId: string) => void
  onUpdate: (noteId: string, updates: Partial<Note>) => void
  availableTags: Tag[]
  onCreateTag: (name: string) => Promise<string | undefined>
  user: User
}

export function NoteEditor({ note, onBack, onDelete, onUpdate, availableTags, onCreateTag, user }: NoteEditorProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const debouncedTitle = useDebounce(title, 500)
  const debouncedContent = useDebounce(content, 1000)

  // Initialize form when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setSelectedTags(note.tags || [])
      setHasUnsavedChanges(false)
    }
  }, [note])

  // Auto-save when debounced values change
  useEffect(() => {
    if (note && (debouncedTitle !== note.title || debouncedContent !== note.content)) {
      handleSave()
    }
  }, [debouncedTitle, debouncedContent])

  const handleSave = useCallback(async () => {
    if (!note) return

    setIsSaving(true)
    try {
      await onUpdate(note.id, {
        title: title || "Untitled",
        content,
        tags: selectedTags,
      })
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Error saving note:", error)
      toast.error("Failed to save note")
    } finally {
      setIsSaving(false)
    }
  }, [note, title, content, selectedTags, onUpdate])

  const handleDelete = async () => {
    if (!note) return

    if (confirm("Are you sure you want to delete this note?")) {
      try {
        await onDelete(note.id)
        toast.success("Note deleted successfully")
      } catch (error) {
        console.error("Error deleting note:", error)
        toast.error("Failed to delete note")
      }
    }
  }

  const handleTagsChange = async (newTags: string[]) => {
    setSelectedTags(newTags)
    setHasUnsavedChanges(true)

    if (note) {
      try {
        await onUpdate(note.id, { tags: newTags })
      } catch (error) {
        console.error("Error updating tags:", error)
        toast.error("Failed to update tags")
      }
    }
  }

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No note selected</h2>
          <p className="text-muted-foreground">Select a note from the list or create a new one to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            {isSaving && <span className="text-sm text-muted-foreground">Saving...</span>}
            {hasUnsavedChanges && !isSaving && <span className="text-sm text-muted-foreground">Unsaved changes</span>}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 space-y-4">
        {/* Title */}
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setHasUnsavedChanges(true)
          }}
          placeholder="Note title..."
          className="text-2xl font-semibold border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedTags.map((tagId) => {
            const tag = availableTags.find((t) => t.id === tagId)
            return tag ? (
              <Badge key={tagId} variant="secondary" style={{ backgroundColor: tag.color + "20" }}>
                <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </Badge>
            ) : null
          })}
          <TagSelector
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            onCreateTag={onCreateTag}
          />
        </div>

        {/* Editor */}
        <div className="flex-1">
          <RichTextEditor
            content={content}
            onChange={(newContent) => {
              setContent(newContent)
              setHasUnsavedChanges(true)
            }}
            placeholder="Start writing your note..."
          />
        </div>
      </div>
    </div>
  )
}
