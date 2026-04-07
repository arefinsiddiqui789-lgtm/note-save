'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useStore, Note } from '@/store/note-app';
import Sidebar from '@/components/note-app/sidebar';
import RichTextEditor from '@/components/note-app/rich-text-editor';
import AppLogo from '@/components/note-app/app-logo';
import ThemeToggle from '@/components/note-app/theme-toggle';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Plus,
  Menu,
  PanelLeftClose,
  Save,
  Clock,
  Loader2,
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

  const createNote = useCallback(async (folderId: string | null) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Note',
          content: '',
          folderId: folderId,
        }),
      });
      const note = await res.json();
      addNote(note);
      setSelectedNoteId(note.id);
      if (folderId) setSelectedFolderId(folderId);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  }, [addNote, setSelectedNoteId, setSelectedFolderId]);

  const handleEditorUpdate = useCallback((html: string) => {
    if (!selectedNoteId) return;
    setHasUnsavedChanges(true);

    // Extract title from first line
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const firstLine = tempDiv.textContent?.split('\n')[0]?.trim() || '';
    const title = firstLine.slice(0, 100) || 'Untitled Note';

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const res = await fetch(`/api/notes/${selectedNoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content: html }),
        });
        const updated = await res.json();
        updateNote(selectedNoteId, { title: updated.title, content: updated.content, updatedAt: updated.updatedAt });
        setHasUnsavedChanges(false);
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, 1200);
  }, [selectedNoteId, updateNote, setIsSaving, setHasUnsavedChanges]);

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
        {/* Logo */}
        <AppLogo />

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

          {/* Close sidebar - desktop */}
          {sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hidden lg:flex text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              onClick={() => setSidebarOpen(false)}
            >
              <PanelLeftClose className="h-4 w-4" />
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

        {/* Footer */}
        <footer className="flex items-center justify-center px-4 py-2.5 border-t border-slate-200/60 dark:border-white/[0.06] bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0 safe-area-bottom">
          <p className="text-[11px] text-slate-400 dark:text-slate-600">
            Save Note &copy; {new Date().getFullYear()} &mdash; Your Smart Note Manager
          </p>
        </footer>
      </main>
    </div>
  );
}

function EmptyState({ onCreateNote, noteCount }: { onCreateNote: (folderId: string | null) => void; noteCount: number }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6">
      <div className="w-full max-w-sm sm:max-w-md text-center">
        {/* Animated icon */}
        <div className="relative mx-auto mb-6 sm:mb-8">
          <div className="h-16 w-16 sm:h-20 sm:w-20 mx-auto relative">
            {/* Background glow */}
            <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-2xl sm:rounded-3xl rotate-6 animate-pulse" />
            <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/[0.03] rounded-2xl sm:rounded-3xl -rotate-6" />
            {/* Icon container */}
            <div className="relative h-full w-full bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-500/10 dark:to-cyan-500/10 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-emerald-200/40 dark:border-emerald-500/10">
              <FileText className="h-7 w-7 sm:h-9 sm:w-9 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
          {noteCount === 0 ? 'Create Your First Note' : 'Select a Note'}
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-[15px] text-slate-400 dark:text-slate-500 mb-6 sm:mb-8 leading-relaxed max-w-[280px] sm:max-w-sm mx-auto">
          {noteCount === 0
            ? 'Start capturing your thoughts, ideas, and notes with a beautiful rich text editor.'
            : 'Choose a note from the sidebar or create a new one to get started.'}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => onCreateNote(null)}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white h-11 sm:h-10 px-6 text-sm font-medium rounded-xl shadow-lg shadow-emerald-600/20 dark:shadow-emerald-500/10 transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Note
          </Button>

          {noteCount > 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-600">
              You have {noteCount} note{noteCount !== 1 ? 's' : ''} in your collection
            </p>
          )}
        </div>

        {/* Feature highlights - mobile responsive grid */}
        {noteCount === 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-10 w-full max-w-[320px] sm:max-w-xs mx-auto">
            <FeatureCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              }
              label="Rich Text"
            />
            <FeatureCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              }
              label="Folders"
            />
            <FeatureCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              }
              label="Auto-Save"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05] transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.05]">
      <div className="text-emerald-500 dark:text-emerald-400">
        {icon}
      </div>
      <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </div>
  );
}
