"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { NoteList } from "@/components/note-list"
import { NoteEditor } from "@/components/note-editor"
import { AuthForm } from "@/components/auth/auth-form"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { Note, Notebook, Tag } from "@/lib/types"
import {
  getNotes,
  getNotebooks,
  getTags,
  createNote,
  updateNote,
  deleteNote,
  createNotebook,
  updateNotebook,
  deleteNotebook,
  createTag,
  updateTag,
  deleteTag,
} from "./actions"

type ActiveFilter = {
  type: "all" | "notebook" | "tag"
  id: string | null
}

type View = "list" | "editor"

export default function HomePage() {
  const { user, loading } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>({ type: "all", id: null })
  const [view, setView] = useState<View>("list")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load data when user is available
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const [notesData, notebooksData, tagsData] = await Promise.all([
        getNotes(user.id),
        getNotebooks(user.id),
        getTags(user.id),
      ])

      setNotes(notesData)
      setNotebooks(notebooksData)
      setTags(tagsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNote = async () => {
    if (!user) return

    try {
      const newNote = await createNote(user.id, "Untitled")
      setNotes((prev) => [newNote, ...prev])
      setActiveNote(newNote)
      setView("editor")
      setSidebarOpen(false)
    } catch (error) {
      console.error("Error creating note:", error)
    }
  }

  const handleUpdateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      const updatedNote = await updateNote(noteId, updates)
      setNotes((prev) => prev.map((note) => (note.id === noteId ? updatedNote : note)))
      if (activeNote?.id === noteId) {
        setActiveNote(updatedNote)
      }
    } catch (error) {
      console.error("Error updating note:", error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId)
      setNotes((prev) => prev.filter((note) => note.id !== noteId))
      if (activeNote?.id === noteId) {
        setActiveNote(null)
        setView("list")
      }
    } catch (error) {
      console.error("Error deleting note:", error)
    }
  }

  const handleNotebookCreated = async (name: string) => {
    if (!user) return
    try {
      const notebook = await createNotebook(user.id, name)
      setNotebooks((prev) => [...prev, notebook])
      return notebook
    } catch (error) {
      console.error("Error creating notebook:", error)
    }
  }

  const handleNotebookUpdated = async (notebookId: string, name: string) => {
    try {
      const updatedNotebook = await updateNotebook(notebookId, name)
      setNotebooks((prev) => prev.map((nb) => (nb.id === notebookId ? updatedNotebook : nb)))
    } catch (error) {
      console.error("Error updating notebook:", error)
    }
  }

  const handleNotebookDeleted = async (notebookId: string) => {
    try {
      await deleteNotebook(notebookId)
      setNotebooks((prev) => prev.filter((nb) => nb.id !== notebookId))
    } catch (error) {
      console.error("Error deleting notebook:", error)
    }
  }

  const handleTagCreated = async (name: string) => {
    if (!user) return
    try {
      const tag = await createTag(user.id, name)
      setTags((prev) => [...prev, tag])
      return tag.id
    } catch (error) {
      console.error("Error creating tag:", error)
    }
  }

  const handleTagUpdated = async (tagId: string, name: string) => {
    try {
      const updatedTag = await updateTag(tagId, name)
      setTags((prev) => prev.map((tag) => (tag.id === tagId ? updatedTag : tag)))
    } catch (error) {
      console.error("Error updating tag:", error)
    }
  }

  const handleTagDeleted = async (tagId: string) => {
    try {
      await deleteTag(tagId)
      setTags((prev) => prev.filter((tag) => tag.id !== tagId))
    } catch (error) {
      console.error("Error deleting tag:", error)
    }
  }

  const filteredNotes = notes.filter((note) => {
    if (activeFilter.type === "all") return true
    if (activeFilter.type === "notebook") return note.notebook_id === activeFilter.id
    if (activeFilter.type === "tag") {
      return note.tags?.includes(activeFilter.id!)
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading your notes...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80">
          <Sidebar
            notebooks={notebooks}
            tags={tags}
            onCreateNote={handleCreateNote}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onNavigateToList={() => setView("list")}
            onNotebookCreated={handleNotebookCreated}
            onNotebookUpdated={handleNotebookUpdated}
            onNotebookDeleted={handleNotebookDeleted}
            onTagCreated={handleTagCreated}
            onTagUpdated={handleTagUpdated}
            onTagDeleted={handleTagDeleted}
            user={user}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-80 flex-shrink-0">
        <Sidebar
          notebooks={notebooks}
          tags={tags}
          onCreateNote={handleCreateNote}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onNavigateToList={() => setView("list")}
          onNotebookCreated={handleNotebookCreated}
          onNotebookUpdated={handleNotebookUpdated}
          onNotebookDeleted={handleNotebookDeleted}
          onTagCreated={handleTagCreated}
          onTagUpdated={handleTagUpdated}
          onTagDeleted={handleTagDeleted}
          user={user}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {view === "list" ? (
          <NoteList
            notes={filteredNotes}
            onNoteSelect={(note) => {
              setActiveNote(note)
              setView("editor")
            }}
            onNoteDelete={handleDeleteNote}
            notebooks={notebooks}
            tags={tags}
          />
        ) : (
          <NoteEditor
            note={activeNote}
            onBack={() => setView("list")}
            onDelete={handleDeleteNote}
            onUpdate={handleUpdateNote}
            availableTags={tags}
            onCreateTag={handleTagCreated}
            user={user}
          />
        )}
      </div>
    </div>
  )
}
