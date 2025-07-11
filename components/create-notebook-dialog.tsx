"use client"

import type React from "react"

import { useState, startTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Notebook } from "@/lib/types"
import type { User } from "@supabase/supabase-js"
import { toast } from "sonner"

interface CreateNotebookDialogProps {
  children: React.ReactNode
  onNotebookCreated: (name: string) => Promise<Notebook | undefined>
  user: User
}

export function CreateNotebookDialog({ children, onNotebookCreated, user }: CreateNotebookDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    startTransition(async () => {
      try {
        const notebook = await onNotebookCreated(name.trim())
        if (notebook) {
          setName("")
          setOpen(false)
          toast.success("Notebook created successfully")
        }
      } catch (error) {
        console.error("Error creating notebook:", error)
        toast.error("Failed to create notebook")
      } finally {
        setIsLoading(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Notebook</DialogTitle>
          <DialogDescription>Create a new notebook to organize your notes.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Enter notebook name"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Creating..." : "Create Notebook"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
