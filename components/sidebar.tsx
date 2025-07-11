"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CreateNotebookDialog } from "./create-notebook-dialog"
import { CreateTagDialog } from "./create-tag-dialog"
import { ManageNotebookDialog } from "./manage-notebook-dialog"
import { ManageTagDialog } from "./manage-tag-dialog"
import { useAuth } from "./auth/auth-provider"
import { Search, Plus, BookOpen, Tag, Settings, LogOut, FileText } from "lucide-react"
import type { Notebook, Tag as TagType } from "@/lib/types"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface SidebarProps {
  notebooks: Notebook[]
  tags: TagType[]
  onCreateNote: () => void
  activeFilter: { type: "all" | "notebook" | "tag"; id: string | null }
  onFilterChange: (filter: { type: "all" | "notebook" | "tag"; id: string | null }) => void
  onNavigateToList: () => void
  onNotebookCreated: (name: string) => Promise<Notebook | undefined>
  onNotebookUpdated: (id: string, name: string) => void
  onNotebookDeleted: (id: string) => void
  onTagCreated: (name: string) => Promise<string | undefined>
  onTagUpdated: (id: string, name: string) => void
  onTagDeleted: (id: string) => void
  user: SupabaseUser
}

export function Sidebar({
  notebooks,
  tags,
  onCreateNote,
  activeFilter,
  onFilterChange,
  onNavigateToList,
  onNotebookCreated,
  onNotebookUpdated,
  onNotebookDeleted,
  onTagCreated,
  onTagUpdated,
  onTagDeleted,
  user,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { signOut } = useAuth()

  const filteredNotebooks = notebooks.filter((notebook) =>
    notebook.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredTags = tags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Notes</h1>
          <Button onClick={onCreateNote} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search notebooks and tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* All Notes */}
          <div>
            <Button
              variant={activeFilter.type === "all" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                onFilterChange({ type: "all", id: null })
                onNavigateToList()
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              All Notes
            </Button>
          </div>

          <Separator />

          {/* Notebooks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Notebooks</h3>
              <CreateNotebookDialog onNotebookCreated={onNotebookCreated} user={user}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </CreateNotebookDialog>
            </div>
            <div className="space-y-1">
              {filteredNotebooks.map((notebook) => (
                <div key={notebook.id} className="flex items-center group">
                  <Button
                    variant={
                      activeFilter.type === "notebook" && activeFilter.id === notebook.id ? "secondary" : "ghost"
                    }
                    className="flex-1 justify-start"
                    onClick={() => {
                      onFilterChange({ type: "notebook", id: notebook.id })
                      onNavigateToList()
                    }}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span className="truncate">{notebook.name}</span>
                  </Button>
                  <ManageNotebookDialog notebook={notebook} onUpdate={onNotebookUpdated} onDelete={onNotebookDeleted}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </ManageNotebookDialog>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
              <CreateTagDialog onTagCreated={onTagCreated} user={user}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </CreateTagDialog>
            </div>
            <div className="space-y-1">
              {filteredTags.map((tag) => (
                <div key={tag.id} className="flex items-center group">
                  <Button
                    variant={activeFilter.type === "tag" && activeFilter.id === tag.id ? "secondary" : "ghost"}
                    className="flex-1 justify-start"
                    onClick={() => {
                      onFilterChange({ type: "tag", id: tag.id })
                      onNavigateToList()
                    }}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    <span className="truncate">{tag.name}</span>
                    <Badge variant="secondary" className="ml-auto" style={{ backgroundColor: tag.color + "20" }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                    </Badge>
                  </Button>
                  <ManageTagDialog tag={tag} onUpdate={onTagUpdated} onDelete={onTagDeleted}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </ManageTagDialog>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
