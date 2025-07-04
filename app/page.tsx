"use client"

import { useState, useMemo, startTransition, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { NoteList } from "@/components/note-list"
import { NoteEditor } from "@/components/note-editor"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, PlusCircle, PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Note, Notebook, Tag } from "@/lib/types"
import { createNoteAction, deleteNoteAction, createTagAction } from "@/app/actions"

// Mock data - now used as initial state
const initialNotebooks: Notebook[] = [
  { id: "nb1", name: "Project Alpha" },
  { id: "nb2", name: "Meeting Notes" },
  { id: "nb3", name: "Personal Ideas" },
]

const initialTags: Tag[] = [
  { id: "t1", name: "work" },
  { id: "t2", name: "urgent" },
  { id: "t3", name: "inspiration" },
]

const initialNotes: Note[] = [
  {
    id: "n1",
    title: "Q3 Marketing Strategy",
    content:
      "<h2>Q3 Marketing Strategy Kick-off</h2><p>This document outlines the plan for our upcoming quarter's marketing initiatives. We will focus on three key areas:</p><ul><li>Content Marketing</li><li>Social Media Engagement</li><li>Paid Advertising</li></ul><p><strong>Key takeaway:</strong> Alignment across all teams is crucial for success.</p>",
    snippet: "Detailed plan for the upcoming quarter's marketing initiatives...",
    createdAt: "2024-07-20T10:00:00Z",
    notebookId: "nb1",
    tags: ["t1"],
  },
  {
    id: "n2",
    title: "Client Kick-off Meeting",
    content: "<h3>Meeting Agenda</h3><p>Agenda: introductions, project scope, timelines, and deliverables.</p>",
    snippet: "Agenda: introductions, project scope, timelines, and deliverables.",
    createdAt: "2024-07-19T14:30:00Z",
    notebookId: "nb2",
    tags: ["t1", "t2"],
  },
  {
    id: "n3",
    title: "Brainstorming Session",
    content: "<h1>New App Ideas</h1><p>A note-taking app with AI features.</p>",
    snippet: "A note-taking app with AI features.",
    createdAt: "2024-07-18T11:00:00Z",
    notebookId: "nb3",
    tags: ["t3"],
  },
]

type ActiveFilter = {
  type: "all" | "notebook" | "tag"
  id: string | null
}

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [notebooks, setNotebooks] = useState<Notebook[]>(initialNotebooks)
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id ?? null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>({ type: "all", id: null })
  const [sidebarOpen, setSidebarOpen] = useState(false) // Default closed

  const filteredNotes = useMemo(() => {
    let notesToFilter = notes

    // Apply notebook/tag filter first
    if (activeFilter.type === "notebook" && activeFilter.id) {
      notesToFilter = notes.filter((note) => note.notebookId === activeFilter.id)
    } else if (activeFilter.type === "tag" && activeFilter.id) {
      notesToFilter = notes.filter((note) => note.tags.includes(activeFilter.id))
    }

    // Then apply search query
    if (!searchQuery) {
      return notesToFilter
    }
    return notesToFilter.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.snippet.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [notes, searchQuery, activeFilter])

  useEffect(() => {
    if (selectedNoteId && !filteredNotes.some((n) => n.id === selectedNoteId)) {
      setSelectedNoteId(filteredNotes[0]?.id ?? null)
    }
  }, [filteredNotes, selectedNoteId])

  const selectedNote = useMemo(() => {
    return notes.find((note) => note.id === selectedNoteId) ?? null
  }, [notes, selectedNoteId])

  const handleCreateNote = async () => {
    startTransition(async () => {
      const { success, note } = await createNoteAction({})
      if (success && note) {
        setNotes((prev) => [note, ...prev])
        setSelectedNoteId(note.id)
      }
    })
  }

  const handleDeleteNote = async (noteId: string) => {
    const originalNotes = notes
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
    if (selectedNoteId === noteId) {
      const remainingNotes = originalNotes.filter((n) => n.id !== noteId)
      setSelectedNoteId(remainingNotes[0]?.id ?? null)
    }

    startTransition(async () => {
      const { success } = await deleteNoteAction({ noteId })
      if (!success) {
        setNotes(originalNotes)
      }
    })
  }

  const handleUpdateNote = (noteId: string, updates: Partial<Pick<Note, "title" | "content" | "tags">>) => {
    setNotes((prev) => prev.map((note) => (note.id === noteId ? { ...note, ...updates } : note)))
  }

  const handleNavigateToList = () => {
    setSelectedNoteId(null)
  }

  // Notebook handlers
  const handleNotebookCreated = (notebook: Notebook) => {
    setNotebooks((prev) => [...prev, notebook])
  }

  const handleNotebookUpdated = (notebookId: string, name: string) => {
    setNotebooks((prev) => prev.map((nb) => (nb.id === notebookId ? { ...nb, name } : nb)))
  }

  const handleNotebookDeleted = (notebookId: string) => {
    setNotebooks((prev) => prev.filter((nb) => nb.id !== notebookId))
    // Reset filter if the deleted notebook was active
    if (activeFilter.type === "notebook" && activeFilter.id === notebookId) {
      setActiveFilter({ type: "all", id: null })
    }
  }

  // Tag handlers
  const handleTagCreated = (tag: Tag) => {
    setTags((prev) => [...prev, tag])
  }

  const handleTagUpdated = (tagId: string, name: string) => {
    setTags((prev) => prev.map((t) => (t.id === tagId ? { ...t, name } : t)))
  }

  const handleTagDeleted = (tagId: string) => {
    setTags((prev) => prev.filter((t) => t.id !== tagId))
    // Reset filter if the deleted tag was active
    if (activeFilter.type === "tag" && activeFilter.id === tagId) {
      setActiveFilter({ type: "all", id: null })
    }
  }

  // Handle creating tags from within the note editor
  const handleCreateTagFromEditor = async (name: string): Promise<string | undefined> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        const { success, tag } = await createTagAction({ name })
        if (success && tag) {
          setTags((prev) => [...prev, tag])
          resolve(tag.id) // Return the new tag ID
        } else {
          resolve(undefined)
        }
      })
    })
  }

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <div
        className={cn("hidden lg:block transition-all duration-300 ease-in-out border-r", sidebarOpen ? "w-72" : "w-0")}
      >
        <div className={cn("w-72 h-full", sidebarOpen ? "block" : "hidden")}>
          <Sidebar
            notebooks={notebooks}
            tags={tags}
            onCreateNote={handleCreateNote}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onNavigateToList={handleNavigateToList}
            onNotebookCreated={handleNotebookCreated}
            onNotebookUpdated={handleNotebookUpdated}
            onNotebookDeleted={handleNotebookDeleted}
            onTagCreated={handleTagCreated}
            onTagUpdated={handleTagUpdated}
            onTagDeleted={handleTagDeleted}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <PanelLeft className="h-6 w-6" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleCreateNote}>
              <PlusCircle className="h-6 w-6" />
              <span className="sr-only">New Note</span>
            </Button>
          </div>
        </header>

        {/* Mobile/Tablet Header */}
        <header className="flex lg:hidden items-center justify-between p-2 border-b">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <Sidebar
                notebooks={notebooks}
                tags={tags}
                onCreateNote={handleCreateNote}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                onNavigateToList={handleNavigateToList}
                onNotebookCreated={handleNotebookCreated}
                onNotebookUpdated={handleNotebookUpdated}
                onNotebookDeleted={handleNotebookDeleted}
                onTagCreated={handleTagCreated}
                onTagUpdated={handleTagUpdated}
                onTagDeleted={handleTagDeleted}
              />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleCreateNote}>
              <PlusCircle className="h-6 w-6" />
              <span className="sr-only">New Note</span>
            </Button>
          </div>
        </header>

        <main className="flex flex-1 overflow-hidden">
          {/* Note List */}
          <div
            className={cn(
              "w-full md:w-80 lg:w-1/3 h-full border-r overflow-y-auto",
              "md:block",
              selectedNoteId ? "hidden md:block" : "block",
            )}
          >
            <NoteList
              notes={filteredNotes}
              selectedNoteId={selectedNoteId}
              onSelectNote={setSelectedNoteId}
              activeFilter={activeFilter}
              notebooks={notebooks}
              tags={tags}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Note Editor */}
          <div className={cn("flex-1 h-full", "md:block", selectedNoteId ? "block" : "hidden")}>
            <NoteEditor
              key={selectedNoteId}
              note={selectedNote}
              onBack={() => setSelectedNoteId(null)}
              onDelete={handleDeleteNote}
              onUpdate={handleUpdateNote}
              availableTags={tags}
              onCreateTag={handleCreateTagFromEditor}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
