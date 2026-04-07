'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useStore, Note } from '@/store/note-app';
import Sidebar from '@/components/note-app/sidebar';
import RichTextEditor from '@/components/note-app/rich-text-editor';
import AppLogo from '@/components/note-app/app-logo';
import ThemeToggle from '@/components/note-app/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Menu,
  PanelLeftClose,
  Save,
  Clock,
  Loader2,
  FolderPlus,
} from 'lucide-react';

export default function HomePage() {
  const {
    folders, notes, selectedFolderId, selectedNoteId,
    setSelectedFolderId, setSelectedNoteId,
    setFolders, setNotes, addNote, updateNote,
    sidebarOpen, setSidebarOpen,
    isSaving, setIsSaving, hasUnsavedChanges, setHasUnsavedChanges,
  } = useStore();

  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const initialized = useRef(false);
  const latestContent = useRef<string>('');

  // Create Note dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNoteName, setNewNoteName] = useState('');
  const [pendingFolderId, setPendingFolderId] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      try {
        const [foldersRes, notesRes] = await Promise.all([
          fetch('/api/folders'),
          fetch('/api/notes'),
        ]);
        const foldersData = await foldersRes.json();
        const notesData = await notesRes.json();
        setFolders(Array.isArray(foldersData) ? foldersData : []);
        setNotes(Array.isArray(notesData) ? notesData : []);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    })();
  }, [setFolders, setNotes]);

  const activeNote = notes.find((n) => n.id === selectedNoteId);

  const createNote = useCallback((folderId: string | null) => {
    setPendingFolderId(folderId);
    setNewNoteName('');
    setShowCreateDialog(true);
  }, []);

  const confirmCreateNote = useCallback(async () => {
    const title = newNoteName.trim() || 'Untitled Note';
    setShowCreateDialog(false);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: '',
          folderId: pendingFolderId,
        }),
      });
      const note = await res.json();
      addNote(note);
      setSelectedNoteId(note.id);
      if (pendingFolderId) setSelectedFolderId(pendingFolderId);
      setNewNoteName('');
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  }, [newNoteName, pendingFolderId, addNote, setSelectedNoteId, setSelectedFolderId]);

  const handleEditorUpdate = useCallback((html: string) => {
    if (!selectedNoteId) return;
    latestContent.current = html;
    setHasUnsavedChanges(true);

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const res = await fetch(`/api/notes/${selectedNoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: html }),
        });
        const updated = await res.json();
        updateNote(selectedNoteId, { content: updated.content, updatedAt: updated.updatedAt });
        setHasUnsavedChanges(false);
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, 1200);
  }, [selectedNoteId, updateNote, setIsSaving, setHasUnsavedChanges]);

  // Save on page leave / tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      const noteId = useStore.getState().selectedNoteId;
      const content = latestContent.current;
      if (noteId && content) {
        navigator.sendBeacon(
          `/api/notes/${noteId}`,
          new Blob([JSON.stringify({ content })], { type: 'application/json' }),
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const noteId = useStore.getState().selectedNoteId;
        const content = latestContent.current;
        if (noteId && content) {
          navigator.sendBeacon(
            `/api/notes/${noteId}`,
            new Blob([JSON.stringify({ content })], { type: 'application/json' }),
          );
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Format time
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:relative z-40 lg:z-0
          w-[280px] sm:w-[300px]
          h-full flex flex-col
          bg-slate-50/80 dark:bg-slate-900/80
          backdrop-blur-xl
          border-r border-slate-200/60 dark:border-white/[0.06]
          transition-transform duration-300 ease-in-out
          flex-shrink-0
        `}
      >
        {/* Logo - clickable on mobile to close sidebar */}
        <button
          type="button"
          className="w-full text-left lg:pointer-events-none"
          onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
          aria-label="Close sidebar"
        >
          <AppLogo />
        </button>

        <Separator className="bg-slate-200/60 dark:bg-white/[0.06]" />

        {/* Sidebar content */}
        <Sidebar onCreateNote={createNote} onSelectNote={setSelectedNoteId} />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Editor Header */}
        <header className="flex items-center gap-2 px-3 sm:px-4 h-12 sm:h-[52px] border-b border-slate-200 dark:border-white/[0.06] bg-white dark:bg-slate-950 flex-shrink-0">
          {/* Menu button - mobile */}
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Close sidebar */}
          {sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-7 sm:w-7 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 active:scale-90 transition-all"
              onClick={() => setSidebarOpen(false)}
            >
              <PanelLeftClose className="h-[18px] w-[18px] sm:h-4 sm:w-4" />
            </Button>
          )}

          {activeNote ? (
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                  {activeNote.title || 'Untitled Note'}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 ml-2 flex-shrink-0">
                <Clock className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {formatTime(activeNote.updatedAt)}
                </span>
              </div>

              {isSaving && (
                <div className="flex items-center gap-1 ml-2">
                  <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />
                  <span className="text-[11px] text-emerald-500">Saving...</span>
                </div>
              )}

              {!isSaving && hasUnsavedChanges && (
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-[11px] text-amber-500">Unsaved</span>
                </div>
              )}

              {!isSaving && !hasUnsavedChanges && activeNote.updatedAt && (
                <div className="hidden sm:flex items-center gap-1 ml-2">
                  <Save className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span className="text-[11px] text-slate-400 dark:text-slate-600">Saved</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1" />
          )}

          <ThemeToggle />
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeNote ? (
            <RichTextEditor
              content={activeNote.content || ''}
              onUpdate={handleEditorUpdate}
            />
          ) : (
            <EmptyState onCreateNote={createNote} noteCount={notes.length} />
          )}
        </div>

        {/* Create Note Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={(open) => { setShowCreateDialog(open); if (!open) setNewNoteName(''); }}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white max-h-[90dvh] overflow-y-auto rounded-2xl sm:rounded-lg mx-2 p-4 sm:p-6 sm:mx-4">
            <DialogHeader className="sm:text-left text-left">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Create New Note
              </DialogTitle>
            </DialogHeader>
            <div className="py-1 sm:py-2">
              <label className="text-sm text-slate-500 dark:text-slate-400 mb-1.5 sm:mb-2 block">Note Name</label>
              <Input
                placeholder="Enter your note name..."
                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500/40 focus:ring-emerald-500/20 rounded-lg h-11 text-[16px]"
                value={newNoteName}
                onChange={(e) => setNewNoteName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') confirmCreateNote(); }}
                autoFocus
              />
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-2 pt-1">
              <Button className="w-full h-10 sm:h-auto sm:w-auto bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 active:scale-[0.98] text-white text-[15px] font-semibold rounded-xl sm:rounded-lg shadow-lg shadow-emerald-600/20 dark:shadow-emerald-500/10 transition-all" onClick={confirmCreateNote} disabled={!newNoteName.trim()}>Create</Button>
              <DialogClose asChild>
                <Button variant="outline" className="w-full h-10 sm:h-auto sm:w-auto border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200 text-[15px] rounded-xl sm:rounded-lg">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <footer className="flex items-center justify-center px-4 py-2.5 border-t border-slate-200/60 dark:border-white/[0.06] bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0 safe-area-bottom">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Developed by{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent font-semibold">
              Arefin Siddiqui
            </span>
          </p>
        </footer>
      </main>
    </div>
  );
}

function EmptyState({ onCreateNote, noteCount }: { onCreateNote: (folderId: string | null) => void; noteCount: number }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-5 sm:px-6 overflow-y-auto">
      <div className="w-full max-w-sm sm:max-w-md text-center py-6 sm:py-0">
        {/* Animated icon */}
        <div className="relative mx-auto mb-5 sm:mb-8">
          <div className="h-[72px] w-[72px] sm:h-20 sm:w-20 mx-auto relative">
            {/* Background glow */}
            <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-br from-emerald-400/15 via-cyan-400/10 to-teal-400/10 dark:from-emerald-500/8 dark:via-cyan-500/5 dark:to-teal-500/5 rounded-3xl sm:rounded-[28px] rotate-6 animate-pulse" />
            <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-tr from-emerald-500/5 to-cyan-500/5 dark:from-emerald-500/[0.03] dark:to-cyan-500/[0.03] rounded-2xl sm:rounded-3xl -rotate-3" />
            {/* Icon container */}
            <div className="relative h-full w-full bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-emerald-500/10 dark:via-slate-800/50 dark:to-cyan-500/10 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-emerald-200/50 dark:border-emerald-500/15 shadow-sm shadow-emerald-500/5 dark:shadow-none">
              <div className="relative">
                <FileText className="h-8 w-8 sm:h-9 sm:w-9 text-emerald-500 dark:text-emerald-400" />
                {/* Small plus badge */}
                <div className="absolute -top-1.5 -right-1.5 h-4 w-4 sm:h-5 sm:w-5 bg-emerald-500 dark:bg-emerald-400 rounded-full flex items-center justify-center shadow-sm">
                  <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-[17px] sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1.5 sm:mb-2 tracking-tight">
          {noteCount === 0 ? 'Create Your First Note' : 'Select a Note'}
        </h2>

        {/* Description */}
        <p className="text-[13px] sm:text-[15px] text-slate-400 dark:text-slate-500 mb-6 sm:mb-8 leading-relaxed max-w-[260px] sm:max-w-sm mx-auto">
          {noteCount === 0
            ? 'Start capturing your thoughts, ideas, and notes with a beautiful rich text editor.'
            : 'Choose a note from the sidebar or create a new one to get started.'}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => onCreateNote(null)}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 active:scale-[0.98] text-white h-12 sm:h-10 px-8 text-[15px] sm:text-sm font-semibold rounded-2xl sm:rounded-xl shadow-lg shadow-emerald-600/25 dark:shadow-emerald-500/15 transition-all"
          >
            <Plus className="h-[18px] w-[18px] sm:h-4 sm:w-4 mr-2" />
            Create Note
          </Button>

          {noteCount > 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-600 order-first sm:order-last">
              You have {noteCount} note{noteCount !== 1 ? 's' : ''} in your collection
            </p>
          )}
        </div>

        {/* Feature highlights - mobile responsive */}
        {noteCount === 0 && (
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-7 sm:mt-10 w-full max-w-[300px] sm:max-w-xs mx-auto">
            <FeatureCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-[22px] sm:w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              }
              label="Rich Text"
            />
            <FeatureCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-[22px] sm:w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              }
              label="Folders"
            />
            <FeatureCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-[22px] sm:w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              }
              label="Auto-Save"
            />
          </div>
        )}

        {/* Quick tip for mobile */}
        {noteCount === 0 && (
          <div className="mt-7 sm:mt-10 px-3 py-3 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05] max-w-[280px] sm:max-w-sm mx-auto">
            <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Quick tip:</span> Use the{' '}
              <span className="inline-flex items-center gap-0.5">
                <FolderPlus className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                <span className="font-medium text-emerald-600 dark:text-emerald-400">+</span>
              </span>{' '}
              button in the sidebar to create folders &amp; organize your notes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-2xl sm:rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] shadow-sm shadow-slate-200/30 dark:shadow-none transition-colors hover:bg-emerald-50 dark:hover:bg-white/[0.05] hover:border-emerald-200/50 dark:hover:border-emerald-500/10 active:scale-[0.97]">
      <div className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
        {icon}
      </div>
      <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </div>
  );
}
