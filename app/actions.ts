"use server"

import { createClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import type { Note, Notebook, Tag } from "@/lib/types"

// Note actions
export async function getNotes(userId: string): Promise<Note[]> {
  const supabase = await createClient()

  const { data: notes, error } = await supabase
    .from("notes")
    .select(`
      *,
      notebook:notebooks(name),
      tags:note_tags(tag:tags(*))
    `)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching notes:", error)
    return []
  }

  return (
    notes.map((note) => ({
      ...note,
      tags: note.tags?.map((t: any) => t.tag.id) || [],
    })) || []
  )
}

export async function createNote(userId: string, title: string, notebookId?: string): Promise<Note> {
  const supabase = await createClient()

  // Get the user's first notebook if no notebookId provided
  let targetNotebookId = notebookId
  if (!targetNotebookId) {
    const { data: notebooks } = await supabase.from("notebooks").select("id").eq("user_id", userId).limit(1)

    if (notebooks && notebooks.length > 0) {
      targetNotebookId = notebooks[0].id
    }
  }

  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      title,
      content: "",
      snippet: "No additional text",
      notebook_id: targetNotebookId,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create note: ${error.message}`)
  }

  revalidatePath("/")
  return note
}

export async function updateNote(noteId: string, updates: Partial<Note>): Promise<Note> {
  const supabase = await createClient()

  const { data: note, error } = await supabase
    .from("notes")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update note: ${error.message}`)
  }

  revalidatePath("/")
  return note
}

export async function deleteNote(noteId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("notes").delete().eq("id", noteId)

  if (error) {
    throw new Error(`Failed to delete note: ${error.message}`)
  }

  revalidatePath("/")
}

// Notebook actions
export async function getNotebooks(userId: string): Promise<Notebook[]> {
  const supabase = await createClient()

  const { data: notebooks, error } = await supabase
    .from("notebooks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching notebooks:", error)
    return []
  }

  return notebooks || []
}

export async function createNotebook(userId: string, name: string): Promise<Notebook> {
  const supabase = await createClient()

  const { data: notebook, error } = await supabase
    .from("notebooks")
    .insert({
      name,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create notebook: ${error.message}`)
  }

  revalidatePath("/")
  return notebook
}

export async function updateNotebook(notebookId: string, name: string): Promise<Notebook> {
  const supabase = await createClient()

  const { data: notebook, error } = await supabase
    .from("notebooks")
    .update({ name })
    .eq("id", notebookId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update notebook: ${error.message}`)
  }

  revalidatePath("/")
  return notebook
}

export async function deleteNotebook(notebookId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("notebooks").delete().eq("id", notebookId)

  if (error) {
    throw new Error(`Failed to delete notebook: ${error.message}`)
  }

  revalidatePath("/")
}

// Tag actions
export async function getTags(userId: string): Promise<Tag[]> {
  const supabase = await createClient()

  const { data: tags, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching tags:", error)
    return []
  }

  return tags || []
}

export async function createTag(userId: string, name: string, color = "#3b82f6"): Promise<Tag> {
  const supabase = await createClient()

  const { data: tag, error } = await supabase
    .from("tags")
    .insert({
      name,
      color,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create tag: ${error.message}`)
  }

  revalidatePath("/")
  return tag
}

export async function updateTag(tagId: string, name: string, color?: string): Promise<Tag> {
  const supabase = await createClient()

  const updates: any = { name }
  if (color) updates.color = color

  const { data: tag, error } = await supabase.from("tags").update(updates).eq("id", tagId).select().single()

  if (error) {
    throw new Error(`Failed to update tag: ${error.message}`)
  }

  revalidatePath("/")
  return tag
}

export async function deleteTag(tagId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("tags").delete().eq("id", tagId)

  if (error) {
    throw new Error(`Failed to delete tag: ${error.message}`)
  }

  revalidatePath("/")
}

// Note-Tag relationship actions
export async function addTagToNote(noteId: string, tagId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("note_tags").insert({
    note_id: noteId,
    tag_id: tagId,
  })

  if (error) {
    throw new Error(`Failed to add tag to note: ${error.message}`)
  }

  revalidatePath("/")
}

export async function removeTagFromNote(noteId: string, tagId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("note_tags").delete().eq("note_id", noteId).eq("tag_id", tagId)

  if (error) {
    throw new Error(`Failed to remove tag from note: ${error.message}`)
  }

  revalidatePath("/")
}

// Authentication actions
export async function signOut(): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(`Failed to sign out: ${error.message}`)
  }

  revalidatePath("/")
}
