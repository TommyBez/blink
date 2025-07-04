"use client"

import { useMemo } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, TagIcon } from "lucide-react"
import type { Note, Notebook, Tag } from "@/lib/types"
import { cn } from "@/lib/utils"

type ActiveFilter = {
  type: "all" | "notebook" | "tag"
  id: string | null
}

interface NoteListProps {
  notes: Note[]
  selectedNoteId: string | null
  onSelectNote: (id: string) => void
  activeFilter: ActiveFilter
  notebooks: Notebook[]
  tags: Tag[]
  searchQuery: string
  onSearchChange: (query: string) => void
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  activeFilter,
  notebooks,
  tags,
  searchQuery,
  onSearchChange,
}: NoteListProps) {
  const listTitle = useMemo(() => {
    if (activeFilter.type === "notebook") {
      return notebooks.find((nb) => nb.id === activeFilter.id)?.name || "Notes"
    }
    if (activeFilter.type === "tag") {
      const tagName = tags.find((t) => t.id === activeFilter.id)?.name
      return tagName ? `#${tagName}` : "Notes"
    }
    return "All Notes"
  }, [activeFilter, notebooks, tags])

  const getNoteTags = (note: Note) => {
    return tags.filter((tag) => note.tags.includes(tag.id))
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b space-y-4">
        <div>
          <h2 className="text-xl font-bold">{listTitle}</h2>
          <p className="text-sm text-muted-foreground">{notes.length} notes</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notes.length > 0 ? (
          <div className="p-2 space-y-2">
            {notes.map((note) => {
              const noteTags = getNoteTags(note)
              return (
                <Card
                  key={note.id}
                  className={cn("cursor-pointer hover:bg-muted/50", note.id === selectedNoteId && "bg-muted")}
                  onClick={() => onSelectNote(note.id)}
                >
                  <CardHeader className="p-4">
                    <div className="space-y-2">
                      <div>
                        <CardTitle className="text-lg truncate">{note.title}</CardTitle>
                        <CardDescription>{formatDate(note.createdAt)}</CardDescription>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{note.snippet}</p>
                      {noteTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {noteTags.slice(0, 3).map((tag) => (
                            <Badge key={tag.id} variant="outline" className="text-xs h-5 px-1.5">
                              <TagIcon className="h-2.5 w-2.5 mr-1" />
                              {tag.name}
                            </Badge>
                          ))}
                          {noteTags.length > 3 && (
                            <Badge variant="outline" className="text-xs h-5 px-1.5 text-muted-foreground">
                              +{noteTags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <p>No notes found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
