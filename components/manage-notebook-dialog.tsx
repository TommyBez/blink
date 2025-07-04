"use client"

import type React from "react"

import { useState, startTransition } from "react"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateNotebookAction, deleteNotebookAction } from "@/app/actions"
import type { Notebook } from "@/lib/types"

interface ManageNotebookDialogProps {
  notebook: Notebook
  onNotebookUpdated: (notebookId: string, name: string) => void
  onNotebookDeleted: (notebookId: string) => void
}

export function ManageNotebookDialog({ notebook, onNotebookUpdated, onNotebookDeleted }: ManageNotebookDialogProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [name, setName] = useState(notebook.name)
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    startTransition(async () => {
      const { success } = await updateNotebookAction({ notebookId: notebook.id, name: name.trim() })
      if (success) {
        onNotebookUpdated(notebook.id, name.trim())
        setEditOpen(false)
      }
      setIsLoading(false)
    })
  }

  const handleDelete = async () => {
    setIsLoading(true)
    startTransition(async () => {
      const { success } = await deleteNotebookAction({ notebookId: notebook.id })
      if (success) {
        onNotebookDeleted(notebook.id)
        setDeleteOpen(false)
      }
      setIsLoading(false)
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Manage notebook</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Notebook</DialogTitle>
              <DialogDescription>Update the name of your notebook.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!name.trim() || isLoading}>
                {isLoading ? "Updating..." : "Update Notebook"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Notebook</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{notebook.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete Notebook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
