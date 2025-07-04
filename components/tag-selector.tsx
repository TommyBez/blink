"use client"

import { useState } from "react"
import { X, Plus, TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import type { Tag } from "@/lib/types"

interface TagSelectorProps {
  availableTags: Tag[]
  selectedTagIds: string[]
  onTagsChange: (tagIds: string[]) => void
  onCreateTag?: (name: string) => Promise<string | undefined> // Return the new tag ID
}

export function TagSelector({ availableTags, selectedTagIds, onTagsChange, onCreateTag }: TagSelectorProps) {
  const [open, setOpen] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const selectedTags = availableTags.filter((tag) => selectedTagIds.includes(tag.id))
  const unselectedTags = availableTags.filter((tag) => !selectedTagIds.includes(tag.id))

  const handleAddTag = (tagId: string) => {
    if (!selectedTagIds.includes(tagId)) {
      onTagsChange([...selectedTagIds, tagId])
    }
    setOpen(false)
  }

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTagIds.filter((id) => id !== tagId))
  }

  const handleCreateNewTag = async () => {
    if (newTagName.trim() && onCreateTag) {
      setIsCreating(true)
      try {
        const newTagId = await onCreateTag(newTagName.trim())
        if (newTagId) {
          // Automatically add the new tag to the selected tags
          onTagsChange([...selectedTagIds, newTagId])
        }
        setNewTagName("")
        setOpen(false)
      } finally {
        setIsCreating(false)
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {selectedTags.map((tag) => (
        <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
          <TagIcon className="h-3 w-3" />
          {tag.name}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => handleRemoveTag(tag.id)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove tag</span>
          </Button>
        </Badge>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 px-2 bg-transparent">
            <Plus className="h-3 w-3 mr-1" />
            Add Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>
                <div className="p-2">
                  <p className="text-sm text-muted-foreground mb-2">No tags found.</p>
                  {onCreateTag && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="New tag name"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleCreateNewTag()
                          }
                        }}
                        className="h-8"
                        disabled={isCreating}
                      />
                      <Button size="sm" onClick={handleCreateNewTag} disabled={!newTagName.trim() || isCreating}>
                        {isCreating ? "..." : "Create"}
                      </Button>
                    </div>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {unselectedTags.map((tag) => (
                  <CommandItem key={tag.id} onSelect={() => handleAddTag(tag.id)}>
                    <TagIcon className="mr-2 h-4 w-4" />
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              {onCreateTag && unselectedTags.length > 0 && (
                <CommandGroup heading="Create New">
                  <div className="p-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="New tag name"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleCreateNewTag()
                          }
                        }}
                        className="h-8"
                        disabled={isCreating}
                      />
                      <Button size="sm" onClick={handleCreateNewTag} disabled={!newTagName.trim() || isCreating}>
                        {isCreating ? "..." : "Create"}
                      </Button>
                    </div>
                  </div>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
