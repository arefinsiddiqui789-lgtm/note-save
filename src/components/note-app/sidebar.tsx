'use client';

import { useState, useCallback } from 'react';
import {
  FolderPlus,
  MoreHorizontal,
  Trash2,
  Pencil,
  FolderOpen,
  FolderClosed,
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  Hash,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNoteAppStore, Folder, Note } from '@/store/note-app';

const FOLDER_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#d946ef', '#ec4899',
];

interface SidebarProps {
  onCreateNote: (folderId: string | null) => void;
  onSelectNote: (noteId: string) => void;
}

export default function Sidebar({ onCreateNote, onSelectNote }: SidebarProps) {
  const {
    folders,
    notes,
    selectedFolderId,
    setSelectedFolderId,
    selectedNoteId,
    setSelectedNoteId,
    addFolder,
    updateFolder,
    removeFolder,
    removeNote,
  } = useNoteAppStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#6366f1');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const toggleFolderExpanded = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, color: newFolderColor }),
      });
      const folder = await res.json();
      addFolder(folder);
      setShowNewFolderDialog(false);
      setNewFolderName('');
      setNewFolderColor('#6366f1');
      setExpandedFolders((prev) => new Set([...prev, folder.id]));
      setSelectedFolderId(folder.id);
    } catch (e) {
      console.error('Failed to create folder:', e);
    }
  };

  const handleRenameFolder = async (folderId: string) => {
    if (!editFolderName.trim()) return;
    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editFolderName }),
      });
      const updated = await res.json();
      updateFolder(folderId, { name: updated.name });
      setEditingFolderId(null);
    } catch (e) {
      console.error('Failed to rename folder:', e);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await fetch(`/api/folders/${folderId}`, { method: 'DELETE' });
      removeFolder(folderId);
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
    } catch (e) {
      console.error('Failed to delete folder:', e);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      removeNote(noteId);
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
      }
    } catch (e) {
      console.error('Failed to delete note:', e);
    }
  };

  // Filter notes based on search and selected folder
  const getFilteredNotes = useCallback(() => {
    let filtered = notes;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query)
      );
    }

    // Folder filter (only when not searching globally)
    if (!searchQuery.trim()) {
      if (selectedFolderId) {
        filtered = filtered.filter((n) => n.folderId === selectedFolderId);
      }
    }

    return filtered;
  }, [notes, searchQuery, selectedFolderId]);

  const getNotesForFolder = (folderId: string | null) => {
    if (searchQuery.trim()) return [];
    return notes.filter((n) => n.folderId === folderId);
  };

  const unorganizedNotes = getNotesForFolder(null);
  const totalUnorganized = unorganizedNotes.length;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notes</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowNewFolderDialog(true)}
              title="New Folder"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onCreateNote(selectedFolderId)}
              title="New Note"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="h-8 pl-8 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* Folders */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* All Notes */}
          <button
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-accent ${
              selectedFolderId === null && !searchQuery.trim() ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground'
            }`}
            onClick={() => {
              setSelectedFolderId(null);
              setSearchQuery('');
            }}
          >
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span>All Notes</span>
            <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1.5">
              {notes.length}
            </Badge>
          </button>

          {/* Folder List */}
          {folders.map((folder) => {
            const folderNotes = getNotesForFolder(folder.id);
            const isExpanded = expandedFolders.has(folder.id);
            const isSelected = selectedFolderId === folder.id && !searchQuery.trim();

            return (
              <div key={folder.id}>
                <div className={`flex items-center group`}>
                  <button
                    className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-accent min-w-0 ${
                      isSelected ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground'
                    }`}
                    onClick={() => {
                      setSelectedFolderId(folder.id);
                      setSearchQuery('');
                    }}
                  >
                    <button
                      className="flex-shrink-0 p-0 hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFolderExpanded(folder.id);
                      }}
                    >
                      {folderNotes.length > 0 ? (
                        isExpanded ? (
                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        )
                      ) : (
                        <span className="w-3" />
                      )}
                    </button>
                    {isSelected || isExpanded ? (
                      <FolderOpen className="h-4 w-4 flex-shrink-0" style={{ color: folder.color }} />
                    ) : (
                      <FolderClosed className="h-4 w-4 flex-shrink-0" style={{ color: folder.color }} />
                    )}
                    <span className="truncate">{folder.name}</span>
                    <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1.5 flex-shrink-0">
                      {folder._count?.notes ?? folderNotes.length}
                    </Badge>
                  </button>

                  {/* Folder actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingFolderId(folder.id);
                          setEditFolderName(folder.name);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeletingFolderId(folder.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Notes under folder */}
                {isExpanded && folderNotes.length > 0 && (
                  <div className="ml-6 border-l border-border">
                    {folderNotes.map((note) => (
                      <NoteItem
                        key={note.id}
                        note={note}
                        isSelected={selectedNoteId === note.id}
                        onSelect={() => onSelectNote(note.id)}
                        onDelete={() => setDeletingNoteId(note.id)}
                      />
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-7 text-xs text-muted-foreground hover:text-foreground ml-1"
                      onClick={() => onCreateNote(folder.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add note
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Unorganized notes section (when no folder selected) */}
        {!searchQuery.trim() && selectedFolderId === null && (
          <>
            <Separator className="my-1" />
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Unorganized
                </span>
                <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                  {totalUnorganized}
                </Badge>
              </div>
              {unorganizedNotes.length === 0 && (
                <p className="text-xs text-muted-foreground px-2 py-4 text-center">
                  No unorganized notes
                </p>
              )}
              {unorganizedNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isSelected={selectedNoteId === note.id}
                  onSelect={() => onSelectNote(note.id)}
                  onDelete={() => setDeletingNoteId(note.id)}
                />
              ))}
            </div>
          </>
        )}

        {/* Search results */}
        {searchQuery.trim() && (
          <>
            <Separator className="my-1" />
            <div className="p-2">
              <p className="text-xs text-muted-foreground px-2 py-1">
                {getFilteredNotes().length} results
              </p>
              {getFilteredNotes().map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isSelected={selectedNoteId === note.id}
                  onSelect={() => onSelectNote(note.id)}
                  onDelete={() => setDeletingNoteId(note.id)}
                  showFolder
                />
              ))}
              {getFilteredNotes().length === 0 && (
                <p className="text-xs text-muted-foreground px-2 py-4 text-center">
                  No notes found
                </p>
              )}
            </div>
          </>
        )}

        {/* Notes for selected folder (when not expanded) */}
        {!searchQuery.trim() && selectedFolderId && !expandedFolders.has(selectedFolderId) && (
          <>
            <Separator className="my-1" />
            <div className="p-2">
              {getFilteredNotes().map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isSelected={selectedNoteId === note.id}
                  onSelect={() => onSelectNote(note.id)}
                  onDelete={() => setDeletingNoteId(note.id)}
                />
              ))}
              {getFilteredNotes().length === 0 && (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground mb-3">No notes yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => onCreateNote(selectedFolderId)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create Note
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </ScrollArea>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Folder Name</label>
              <Input
                placeholder="Enter folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-7 w-7 rounded-full border-2 cursor-pointer transition-all ${
                      newFolderColor === color ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewFolderColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button size="sm" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={editingFolderId !== null} onOpenChange={() => setEditingFolderId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={editFolderName}
              onChange={(e) => setEditFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && editingFolderId) {
                  handleRenameFolder(editingFolderId);
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button size="sm" onClick={() => editingFolderId && handleRenameFolder(editingFolderId)} disabled={!editFolderName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Confirmation */}
      <AlertDialog open={deletingFolderId !== null} onOpenChange={() => setDeletingFolderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this folder? Notes inside will be moved to unorganized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingFolderId) handleDeleteFolder(deletingFolderId);
                setDeletingFolderId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Note Confirmation */}
      <AlertDialog open={deletingNoteId !== null} onOpenChange={() => setDeletingNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingNoteId) handleDeleteNote(deletingNoteId);
                setDeletingNoteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Note Item Component
function NoteItem({
  note,
  isSelected,
  onSelect,
  onDelete,
  showFolder = false,
}: {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  showFolder?: boolean;
}) {
  // Extract plain text from HTML for preview
  const plainContent = note.content
    ? note.content.replace(/<[^>]*>/g, '').slice(0, 60)
    : 'Empty note';

  return (
    <div className="group flex items-center">
      <button
        className={`flex-1 flex items-start gap-2 px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-accent min-w-0 text-left ${
          isSelected ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground'
        }`}
        onClick={onSelect}
      >
        <FileText className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px]">{note.title || 'Untitled Note'}</div>
          <div className="truncate text-[11px] text-muted-foreground">{plainContent}</div>
          {showFolder && note.folder && (
            <div className="flex items-center gap-1 mt-0.5">
              <div
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: note.folder.color }}
              />
              <span className="text-[10px] text-muted-foreground">{note.folder.name}</span>
            </div>
          )}
        </div>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}
