import { create } from 'zustand';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count?: { notes: number };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  folder?: { id: string; name: string; color: string } | null;
}

interface Store {
  folders: Folder[];
  setFolders: (f: Folder[]) => void;
  addFolder: (f: Folder) => void;
  updateFolder: (id: string, d: Partial<Folder>) => void;
  removeFolder: (id: string) => void;

  notes: Note[];
  setNotes: (n: Note[]) => void;
  addNote: (n: Note) => void;
  updateNote: (id: string, d: Partial<Note>) => void;
  removeNote: (id: string) => void;

  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;
  isSaving: boolean;
  setIsSaving: (s: boolean) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (c: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  folders: [],
  setFolders: (folders) => set({ folders }),
  addFolder: (folder) => set((s) => ({ folders: [...s.folders, folder] })),
  updateFolder: (id, data) =>
    set((s) => ({ folders: s.folders.map((f) => (f.id === id ? { ...f, ...data } : f)) })),
  removeFolder: (id) =>
    set((s) => ({
      folders: s.folders.filter((f) => f.id !== id),
      notes: s.notes.map((n) => (n.folderId === id ? { ...n, folderId: null, folder: null } : n)),
    })),

  notes: [],
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((s) => ({ notes: [...s.notes, note] })),
  updateNote: (id, data) =>
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...data } : n)) })),
  removeNote: (id) =>
    set((s) => ({
      notes: s.notes.filter((n) => n.id !== id),
      selectedNoteId: s.selectedNoteId === id ? null : s.selectedNoteId,
    })),

  selectedFolderId: null,
  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
  selectedNoteId: null,
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),

  sidebarOpen: true,
  setSidebarOpen: (o) => set({ sidebarOpen: o }),
  isSaving: false,
  setIsSaving: (s) => set({ isSaving: s }),
  hasUnsavedChanges: false,
  setHasUnsavedChanges: (c) => set({ hasUnsavedChanges: c }),
}));
