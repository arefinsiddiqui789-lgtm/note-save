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

interface NoteAppState {
  // Folders
  folders: Folder[];
  setFolders: (folders: Folder[]) => void;
  addFolder: (folder: Folder) => void;
  updateFolder: (id: string, data: Partial<Folder>) => void;
  removeFolder: (id: string) => void;

  // Notes
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, data: Partial<Note>) => void;
  removeNote: (id: string) => void;

  // Selection
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (changed: boolean) => void;
}

export const useNoteAppStore = create<NoteAppState>((set) => ({
  // Folders
  folders: [],
  setFolders: (folders) => set({ folders }),
  addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),
  updateFolder: (id, data) =>
    set((state) => ({
      folders: state.folders.map((f) => (f.id === id ? { ...f, ...data } : f)),
    })),
  removeFolder: (id) =>
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      notes: state.notes.map((n) =>
        n.folderId === id ? { ...n, folderId: null, folder: null } : n
      ),
    })),

  // Notes
  notes: [],
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  updateNote: (id, data) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    })),
  removeNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
    })),

  // Selection
  selectedFolderId: null,
  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
  selectedNoteId: null,
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),

  // UI
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  isSaving: false,
  setIsSaving: (saving) => set({ isSaving: saving }),
  hasUnsavedChanges: false,
  setHasUnsavedChanges: (changed) => set({ hasUnsavedChanges: changed }),
}));
