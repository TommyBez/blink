"use client"

import { Book, TagIcon, PlusCircle, Settings, Trash2, StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateNotebookDialog } from "@/components/create-notebook-dialog"
import { CreateTagDialog } from "@/components/create-tag-dialog"
import { ManageNotebookDialog } from "@/components/manage-notebook-dialog"
import { ManageTagDialog } from "@/components/manage-tag-dialog"
import type { Notebook, Tag } from "@/lib/types"

type ActiveFilter = {
  type: "all" | "notebook" | "tag"
  id: string | null
}

interface SidebarProps {
  notebooks: Notebook[]
  tags: Tag[]
  onCreateNote: () => void
  activeFilter: ActiveFilter
  onFilterChange: (filter: ActiveFilter) => void
  onNavigateToList: () => void
  onNotebookCreated: (notebook: Notebook) => void
  onNotebookUpdated: (notebookId: string, name: string) => void
  onNotebookDeleted: (notebookId: string) => void
  onTagCreated: (tag: Tag) => void
  onTagUpdated: (tagId: string, name: string) => void
  onTagDeleted: (tagId: string) => void
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
}: SidebarProps) {
  return (
    <aside className="flex flex-col w-full h-full border-r bg-sidebar">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Notes</h1>
      </div>
      <div className="p-4">
        <Button className="w-full" onClick={onCreateNote}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>
      <nav className="flex-1 px-4 space-y-4 overflow-y-auto">
        <div>
          <Button
            variant={activeFilter.type === "all" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => {
              onFilterChange({ type: "all", id: null })
              onNavigateToList()
            }}
          >
            <StickyNote className="mr-2 h-4 w-4" />
            All Notes
          </Button>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-lg font-semibold tracking-tight">Notebooks</h2>
            <CreateNotebookDialog onNotebookCreated={onNotebookCreated} />
          </div>
          <div className="space-y-1">
            {notebooks.map((notebook) => (
              <div key={notebook.id} className="group flex items-center">
                <Button
                  variant={activeFilter.type === "notebook" && activeFilter.id === notebook.id ? "secondary" : "ghost"}
                  className="flex-1 justify-start"
                  onClick={() => onFilterChange({ type: "notebook", id: notebook.id })}
                >
                  <Book className="mr-2 h-4 w-4" />
                  {notebook.name}
                </Button>
                <ManageNotebookDialog
                  notebook={notebook}
                  onNotebookUpdated={onNotebookUpdated}
                  onNotebookDeleted={onNotebookDeleted}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-lg font-semibold tracking-tight">Tags</h2>
            <CreateTagDialog onTagCreated={onTagCreated} />
          </div>
          <div className="space-y-1">
            {tags.map((tag) => (
              <div key={tag.id} className="group flex items-center">
                <Button
                  variant={activeFilter.type === "tag" && activeFilter.id === tag.id ? "secondary" : "ghost"}
                  className="flex-1 justify-start"
                  onClick={() => onFilterChange({ type: "tag", id: tag.id })}
                >
                  <TagIcon className="mr-2 h-4 w-4" />
                  {tag.name}
                </Button>
                <ManageTagDialog tag={tag} onTagUpdated={onTagUpdated} onTagDeleted={onTagDeleted} />
              </div>
            ))}
          </div>
        </div>
      </nav>
      <div className="p-4 border-t mt-auto">
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start">
            <Trash2 className="mr-2 h-4 w-4" />
            Trash
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </aside>
  )
}
