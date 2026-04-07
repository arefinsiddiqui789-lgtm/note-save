'use client';

import { useState } from 'react';
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
  Search,
  StickyNote,
  Hash,
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
import { useStore, Note } from '@/store/note-app';

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899',
];

interface Props {
  onCreateNote: (folderId: string | null) => void;
  onSelectNote: (id: string) => void;
}

export default function Sidebar({ onCreateNote, onSelectNote }: Props) {
  const {
    folders, notes, selectedFolderId, selectedNoteId,
    setSelectedFolderId, addFolder, updateFolder, removeFolder, removeNote,
  } = useStore();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#22d3ee');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [delFolderId, setDelFolderId] = useState<string | null>(null);
  const [delNoteId, setDelNoteId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpanded((p) => { const n = new Set(p); if (n.has(id)) { n.delete(id); } else { n.add(id); } return n; });

  const createFolder = async () => {
    if (!newName.trim()) return;
    const res = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, color: newColor }),
    });
    const folder = await res.json();
    addFolder(folder);
    setShowNewFolder(false);
    setNewName('');
    setNewColor('#22d3ee');
    setExpanded((p) => new Set([...p, folder.id]));
    setSelectedFolderId(folder.id);
  };

  const renameFolder = async (id: string) => {
    if (!editName.trim()) return;
    const res = await fetch(`/api/folders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    });
    const f = await res.json();
    updateFolder(id, { name: f.name });
    setEditId(null);
  };

  const deleteFolder = async (id: string) => {
    await fetch(`/api/folders/${id}`, { method: 'DELETE' });
    removeFolder(id);
    if (selectedFolderId === id) setSelectedFolderId(null);
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    removeNote(id);
  };

  const folderNotes = (fid: string | null) => notes.filter((n) => n.folderId === fid);
  const unorganized = folderNotes(null);

  const filteredNotes = search.trim()
    ? notes.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 pb-2 sm:pb-3">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400/80 uppercase tracking-[0.2em]">
            Explorer
          </h2>
          <div className="flex gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-7 sm:w-7 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5" onClick={() => setShowNewFolder(true)}>
              <FolderPlus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-7 sm:w-7 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5" onClick={() => onCreateNote(selectedFolderId)}>
              <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-3.5 sm:w-3.5 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search notes..."
            className="h-9 sm:h-8 pl-8 sm:pl-8 text-xs bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500/40 focus:ring-emerald-500/20 rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Separator className="bg-slate-200 dark:bg-white/5" />

      <ScrollArea className="flex-1 px-2 py-1">
        {/* All Notes */}
        <button
          className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[13px] transition-all ${
            selectedFolderId === null && !search.trim()
              ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white active:bg-slate-100 dark:active:bg-white/10'
          }`}
          onClick={() => { setSelectedFolderId(null); setSearch(''); }}
        >
          <Hash className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <span className="flex-1 text-left">All Notes</span>
          <Badge className="text-[10px] h-4 px-1.5 bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 border-0 font-normal">
            {notes.length}
          </Badge>
        </button>

        {/* Folders */}
        {folders.map((folder) => {
          const fNotes = folderNotes(folder.id);
          const isExp = expanded.has(folder.id);
          const isSel = selectedFolderId === folder.id && !search.trim();
          return (
            <div key={folder.id}>
              <div className="group flex items-center">
                <button
                  className={`flex-1 flex items-center gap-2 px-2.5 py-2.5 rounded-lg text-[13px] transition-all ${
                    isSel
                      ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white active:bg-slate-100 dark:active:bg-white/10'
                  }`}
                  onClick={() => { setSelectedFolderId(folder.id); setSearch(''); }}
                >
                  <span
                    className="p-0 hover:bg-transparent flex-shrink-0 h-5 w-5 flex items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); toggle(folder.id); }}
                  >
                    {fNotes.length > 0 ? (
                      isExp ? <ChevronDown className="h-3 w-3 text-slate-400 dark:text-slate-500" /> : <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                    ) : <span className="w-3" />}
                  </span>
                  {isSel || isExp ? (
                    <FolderOpen className="h-4 w-4 flex-shrink-0" style={{ color: folder.color }} />
                  ) : (
                    <FolderClosed className="h-4 w-4 flex-shrink-0" style={{ color: folder.color }} />
                  )}
                  <span className="truncate flex-1 text-left">{folder.name}</span>
                  <Badge className="text-[10px] h-4 px-1.5 bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 border-0 font-normal flex-shrink-0">
                    {folder._count?.notes ?? fNotes.length}
                  </Badge>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-6 sm:w-6 md:opacity-0 md:group-hover:opacity-100 text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4 sm:h-3 sm:w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
                    <DropdownMenuItem className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-white/10 focus:text-slate-900 dark:focus:text-white" onClick={() => { setEditId(folder.id); setEditName(folder.name); }}>
                      <Pencil className="h-3.5 w-3.5 mr-2" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-300" onClick={() => setDelFolderId(folder.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {isExp && fNotes.length > 0 && (
                <div className="ml-5 pl-3 border-l border-slate-200 dark:border-white/5">
                  {fNotes.map((note) => (
                    <NoteItem key={note.id} note={note} active={selectedNoteId === note.id} onSelect={() => onSelectNote(note.id)} onDelete={() => setDelNoteId(note.id)} />
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-9 sm:h-7 text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 ml-0"
                    onClick={() => onCreateNote(folder.id)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add note
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {/* Unorganized (when "All Notes" selected) */}
        {!search.trim() && selectedFolderId === null && (
          <>
            <Separator className="my-2 bg-slate-200 dark:bg-white/5" />
            <div className="px-2.5 py-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em]">Unorganized</span>
              <Badge className="text-[10px] h-4 px-1.5 bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 border-0 font-normal">{unorganized.length}</Badge>
            </div>
            {unorganized.length === 0 && (
              <p className="text-[11px] text-slate-400 dark:text-slate-600 px-3 py-3 text-center italic">No unorganized notes</p>
            )}
            {unorganized.map((n) => (
              <NoteItem key={n.id} note={n} active={selectedNoteId === n.id} onSelect={() => onSelectNote(n.id)} onDelete={() => setDelNoteId(n.id)} />
            ))}
          </>
        )}

        {/* Search results */}
        {search.trim() && (
          <>
            <Separator className="my-2 bg-slate-200 dark:bg-white/5" />
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em] px-2.5 py-1">
              {filteredNotes.length} result{filteredNotes.length !== 1 ? 's' : ''}
            </p>
            {filteredNotes.length === 0 && (
              <p className="text-[11px] text-slate-400 dark:text-slate-600 px-3 py-3 text-center italic">No matches found</p>
            )}
            {filteredNotes.map((n) => (
              <NoteItem key={n.id} note={n} active={selectedNoteId === n.id} onSelect={() => onSelectNote(n.id)} onDelete={() => setDelNoteId(n.id)} showFolder />
            ))}
          </>
        )}

        {/* Notes in selected folder (collapsed) */}
        {!search.trim() && selectedFolderId && !expanded.has(selectedFolderId) && (
          <>
            <Separator className="my-2 bg-slate-200 dark:bg-white/5" />
            {folderNotes(selectedFolderId).length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <FileText className="h-7 w-7 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-[11px] text-slate-400 dark:text-slate-600 mb-3">No notes in this folder</p>
                <Button variant="outline" size="sm" className="text-[11px] h-8 sm:h-7 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5" onClick={() => onCreateNote(selectedFolderId)}>
                  <Plus className="h-3 w-3 mr-1" /> Create Note
                </Button>
              </div>
            ) : (
              folderNotes(selectedFolderId).map((n) => (
                <NoteItem key={n.id} note={n} active={selectedNoteId === n.id} onSelect={() => onSelectNote(n.id)} onDelete={() => setDelNoteId(n.id)} />
              ))
            )}
          </>
        )}
      </ScrollArea>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg">Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-500 dark:text-slate-400">Folder Name</label>
              <Input
                placeholder="e.g. Work, Personal..."
                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500/40 rounded-lg"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createFolder()}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-500 dark:text-slate-400">Color</label>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`h-8 w-8 sm:h-7 sm:w-7 rounded-full border-2 cursor-pointer transition-all hover:scale-110 ${
                      newColor === c ? 'border-slate-900 dark:border-white scale-110 shadow-lg' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white">Cancel</Button>
            </DialogClose>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={createFolder} disabled={!newName.trim()}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={editId !== null} onOpenChange={() => setEditId(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white mx-4">
          <DialogHeader><DialogTitle>Rename Folder</DialogTitle></DialogHeader>
          <div className="py-2">
            <Input
              className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-emerald-500/40 rounded-lg"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && editId) renameFolder(editId); }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5">Cancel</Button>
            </DialogClose>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => editId && renameFolder(editId)} disabled={!editName.trim()}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Alert */}
      <AlertDialog open={delFolderId !== null} onOpenChange={() => setDelFolderId(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">Delete Folder?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Notes inside will be moved to &quot;Unorganized&quot;. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-500 text-white border-0" onClick={() => { if (delFolderId) deleteFolder(delFolderId); setDelFolderId(null); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Note Alert */}
      <AlertDialog open={delNoteId !== null} onOpenChange={() => setDelNoteId(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">Delete Note?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              This note will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-500 text-white border-0" onClick={() => { if (delNoteId) deleteNote(delNoteId); setDelNoteId(null); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NoteItem({ note, active, onSelect, onDelete, showFolder = false }: { note: Note; active: boolean; onSelect: () => void; onDelete: () => void; showFolder?: boolean }) {
  const preview = note.content ? note.content.replace(/<[^>]*>/g, '').slice(0, 50) : 'Empty note';
  return (
    <div className="group flex items-center">
      <button
        className={`flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all text-left min-h-[44px] ${
          active ? 'bg-emerald-50 dark:bg-white/10 text-emerald-700 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200 active:bg-slate-100 dark:active:bg-white/10'
        }`}
        onClick={onSelect}
      >
        <FileText className={`h-4 w-4 flex-shrink-0 mt-0.5 ${active ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`} />
        <div className="min-w-0 flex-1">
          <div className="truncate">{note.title || 'Untitled Note'}</div>
          <div className="truncate text-[11px] text-slate-400 dark:text-slate-600">{preview}</div>
          {showFolder && note.folder && (
            <div className="flex items-center gap-1 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: note.folder.color }} />
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{note.folder.name}</span>
            </div>
          )}
        </div>
      </button>
      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-5 sm:w-5 md:opacity-0 md:group-hover:opacity-100 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex-shrink-0" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
        <Trash2 className="h-4 w-4 sm:h-3 sm:w-3" />
      </Button>
    </div>
  );
}
