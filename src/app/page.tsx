'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Save, Menu, PanelLeftClose, PanelLeft,
  Download, Printer, Clock, Check, Loader2,
  StickyNote, FileText, X, FolderPlus,
  Sparkles, Plus, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useStore } from '@/store/note-app';
import Sidebar from '@/components/note-app/sidebar';
import RichTextEditor from '@/components/note-app/rich-text-editor';
import AppLogo from '@/components/note-app/app-logo';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function NoteApp() {
  const {
    folders, notes, selectedFolderId, selectedNoteId,
    setSelectedFolderId, setSelectedNoteId,
    setFolders, setNotes, addNote, updateNote,
    isSaving, setIsSaving, hasUnsavedChanges, setHasUnsavedChanges,
  } = useStore();

  const [localContent, setLocalContent] = useState('');
  const [localTitle, setLocalTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [creatingNote, setCreatingNote] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  // Fetch data
  useEffect(() => {
    (async () => {
      const [f, n] = await Promise.all([fetch('/api/folders'), fetch('/api/notes')]);
      setFolders(await f.json());
      setNotes(await n.json());
    })();
  }, [setFolders, setNotes]);

  // Sync local state
  useEffect(() => {
    if (selectedNote) {
      setLocalContent(selectedNote.content || '');
      setLocalTitle(selectedNote.title || 'Untitled Note');
      setHasUnsavedChanges(false);
    } else {
      setLocalContent('');
      setLocalTitle('');
      setHasUnsavedChanges(false);
    }
  }, [selectedNoteId, selectedNote, setHasUnsavedChanges]);

  // Auto-save
  const saveNote = useCallback(async (nid: string, title: string, content: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/notes/${nid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const updated = await res.json();
      updateNote(nid, { title: updated.title, content: updated.content, updatedAt: updated.updatedAt });
      setHasUnsavedChanges(false);
    } catch {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [updateNote, setIsSaving, setHasUnsavedChanges]);

  const handleContentChange = useCallback((html: string) => {
    setLocalContent(html);
    setHasUnsavedChanges(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (selectedNoteId) saveNote(selectedNoteId, localTitle, html);
    }, 1200);
  }, [selectedNoteId, localTitle, saveNote, setHasUnsavedChanges]);

  const handleTitleChange = useCallback((t: string) => {
    setLocalTitle(t);
    setHasUnsavedChanges(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (selectedNoteId) saveNote(selectedNoteId, t, localContent);
    }, 800);
  }, [selectedNoteId, localContent, saveNote, setHasUnsavedChanges]);

  const handleSave = useCallback(() => {
    if (!selectedNoteId) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    saveNote(selectedNoteId, localTitle, localContent);
    toast.success('Note saved');
  }, [selectedNoteId, localTitle, localContent, saveNote]);

  const createNote = useCallback(async (folderId: string | null) => {
    setCreatingNote(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Note', content: '', folderId: folderId || undefined }),
      });
      const note = await res.json();
      addNote(note);
      setSelectedNoteId(note.id);
      setEditingTitle(true);
      toast.success('Note created!');
      setTimeout(() => titleRef.current?.select(), 150);
    } catch {
      toast.error('Failed to create note');
    } finally {
      setCreatingNote(false);
    }
  }, [addNote, setSelectedNoteId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); createNote(selectedFolderId); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave, createNote, selectedFolderId]);

  const handleDownload = () => {
    if (!selectedNote) return;
    const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${selectedNote.title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:40px 20px;line-height:1.6;color:#1e293b}
h1{font-size:2em;border-bottom:1px solid #e2e8f0;padding-bottom:.3em}
h2{font-size:1.5em}blockquote{border-left:4px solid #94a3b8;padding-left:1em;color:#64748b;margin-left:0}
code{background:#f1f5f9;padding:.15em .3em;border-radius:3px}pre{background:#f1f5f9;padding:1em;border-radius:8px;overflow-x:auto}
img{max-width:100%}ul,ol{padding-left:1.5em}hr{border:none;border-top:1px solid #e2e8f0;margin:2em 0}</style></head>
<body><h1>${selectedNote.title}</h1>${selectedNote.content}</body></html>`], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${selectedNote.title || 'note'}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Downloaded');
  };

  const handlePrint = () => {
    if (!selectedNote) return;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<!DOCTYPE html><html><head><title>${selectedNote.title}</title>
<style>body{font-family:system-ui;max-width:800px;margin:0 auto;padding:40px;line-height:1.6}h1{border-bottom:1px solid #ccc;padding-bottom:.3em}</style></head>
<body><h1>${selectedNote.title}</h1>${selectedNote.content}<script>onload=()=>print()<\/script></body></html>`);
      w.document.close();
    }
  };

  const fmtDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const day = Math.floor(diff / 86400000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (day < 7) return `${day}d ago`;
    return new Date(d).toLocaleDateString();
  };

  const wordCount = localContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
  const charCount = localContent.replace(/<[^>]*>/g, '').length;

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex flex-col border-r border-white/5 bg-slate-900/50 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-72 min-w-[288px]' : 'w-0 min-w-0 overflow-hidden'}`}>
        {sidebarOpen && (
          <>
            <AppLogo />
            <Separator className="bg-white/5" />
            <div className="flex-1 overflow-hidden">
              <Sidebar onCreateNote={createNote} onSelectNote={setSelectedNoteId} />
            </div>
          </>
        )}
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetContent side="left" className="w-72 p-0 bg-slate-900 border-white/10">
          <AppLogo />
          <Separator className="bg-white/5" />
          <div className="flex-1 overflow-hidden">
            <Sidebar onCreateNote={(fid) => createNote(fid)} onSelectNote={(id) => { setSelectedNoteId(id); }} />
          </div>
        </SheetContent>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-3 left-3 z-50 h-9 w-9 bg-slate-800/90 backdrop-blur-sm border border-white/10 rounded-xl text-slate-300 hover:text-white">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
      </Sheet>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AnimatePresence mode="wait">
          {selectedNote ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Top Bar */}
              <header className="flex items-center gap-2 px-3 sm:px-5 py-2.5 border-b border-white/5 bg-slate-950/80 backdrop-blur-sm flex-shrink-0">
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="hidden md:flex h-8 w-8 text-slate-500 hover:text-white hover:bg-white/5" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-[11px] bg-slate-800 border-white/10 text-slate-300">Toggle Sidebar</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex-1 flex items-center gap-3 min-w-0">
                  {selectedNote.folder && (
                    <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedNote.folder.color }} />
                      <span className="text-[11px] text-slate-500 truncate max-w-[100px]">{selectedNote.folder.name}</span>
                      <span className="text-slate-700">/</span>
                    </div>
                  )}

                  {editingTitle ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        ref={titleRef}
                        value={localTitle}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        onBlur={() => setEditingTitle(false)}
                        onKeyDown={(e) => { if (e.key === 'Enter') setEditingTitle(false); if (e.key === 'Escape') { setLocalTitle(selectedNote?.title || 'Untitled Note'); setEditingTitle(false); } }}
                        className="h-7 text-base font-semibold bg-transparent border-none shadow-none focus-visible:ring-0 px-0 text-white placeholder:text-slate-600"
                      />
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white hover:bg-white/5" onClick={() => setEditingTitle(false)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <h1
                      className="text-base font-semibold truncate cursor-pointer text-slate-100 hover:text-white transition-colors"
                      onClick={() => setEditingTitle(true)}
                      title="Click to edit title"
                    >
                      {localTitle || 'Untitled Note'}
                    </h1>
                  )}
                </div>

                {/* Save Status & Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isSaving ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="hidden sm:inline">Saving...</span>
                    </div>
                  ) : hasUnsavedChanges ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400/80">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="hidden sm:inline">Unsaved</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/70">
                      <Check className="h-3 w-3" />
                      <span className="hidden sm:inline">Saved</span>
                    </div>
                  )}

                  <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-600">
                    <Clock className="h-3 w-3" />
                    {fmtDate(selectedNote.updatedAt)}
                  </div>

                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10" onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
                          <Save className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-[11px] bg-slate-800 border-white/10 text-slate-300">Save (Ctrl+S)</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-white hover:bg-white/5">
                        <span className="text-sm">⋯</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 bg-slate-800 border-white/10">
                      <DropdownMenuItem className="text-slate-300 focus:bg-white/10 focus:text-white" onClick={handleSave}><Save className="h-3.5 w-3.5 mr-2" />Save Note</DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem className="text-slate-300 focus:bg-white/10 focus:text-white" onClick={handleDownload}><Download className="h-3.5 w-3.5 mr-2" />Download HTML</DropdownMenuItem>
                      <DropdownMenuItem className="text-slate-300 focus:bg-white/10 focus:text-white" onClick={handlePrint}><Printer className="h-3.5 w-3.5 mr-2" />Print</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>

              {/* Editor */}
              <main className="flex-1 overflow-hidden">
                <RichTextEditor content={localContent} onUpdate={handleContentChange} />
              </main>

              {/* Status Bar */}
              <footer className="flex items-center justify-between px-4 py-1.5 border-t border-white/5 bg-slate-950/80 text-[11px] text-slate-600 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <span>Created: {new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                  <span className="hidden sm:inline">Modified: {new Date(selectedNote.updatedAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{wordCount} words</span>
                  <span className="text-slate-700">•</span>
                  <span>{charCount} chars</span>
                </div>
              </footer>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center space-y-8 max-w-lg mx-auto px-6">
                {/* Animated Logo */}
                <motion.div
                  className="flex justify-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <div className="relative h-24 w-24 flex items-center justify-center">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl rotate-6"
                      animate={{ rotate: [6, 12, 6] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ opacity: 0.15 }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl -rotate-6"
                      animate={{ rotate: [-6, -12, -6] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ opacity: 0.1 }}
                    />
                    <motion.div
                      className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-xl"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="relative bg-slate-900/80 backdrop-blur-sm rounded-3xl h-24 w-24 flex items-center justify-center border border-white/10 shadow-2xl">
                      <svg viewBox="0 0 24 24" className="h-12 w-12 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <path d="M12 18v-6" />
                        <path d="M9 15h6" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                {/* Title & Description */}
                <motion.div
                  className="space-y-3"
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                >
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    Save Note
                  </h2>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Your personal note-taking space. Create folders, organize your thoughts, and never lose an idea.
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row items-center justify-center gap-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white border-0 rounded-xl h-12 px-8 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow cursor-pointer text-base font-medium gap-2.5"
                      onClick={() => createNote(selectedFolderId)}
                      disabled={creatingNote}
                    >
                      {creatingNote ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Create Your First Note
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 hover:border-white/20 rounded-xl h-12 px-6 cursor-pointer text-sm gap-2"
                      onClick={() => createNote(selectedFolderId)}
                      disabled={creatingNote}
                    >
                      <Plus className="h-4 w-4" />
                      Quick Note
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Feature hints */}
                <motion.div
                  className="grid grid-cols-3 gap-4 max-w-sm mx-auto"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                >
                  {[
                    { icon: <FolderPlus className="h-4 w-4" />, label: 'Organize with Folders' },
                    { icon: <FileText className="h-4 w-4" />, label: 'Rich Text Editing' },
                    { icon: <Save className="h-4 w-4" />, label: 'Auto-Save' },
                  ].map((feature) => (
                    <div key={feature.label} className="flex flex-col items-center gap-1.5 text-center">
                      <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-emerald-500/70">
                        {feature.icon}
                      </div>
                      <span className="text-[10px] text-slate-600 leading-tight">{feature.label}</span>
                    </div>
                  ))}
                </motion.div>

                {/* Keyboard Shortcuts */}
                <motion.div
                  className="pt-2 space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">Keyboard Shortcuts</p>
                  <div className="flex items-center justify-center gap-4 text-[11px] text-slate-600">
                    <span><kbd className="px-2 py-0.5 bg-white/5 rounded border border-white/10 text-slate-400 text-[10px] font-mono">Ctrl+S</kbd> Save</span>
                    <span><kbd className="px-2 py-0.5 bg-white/5 rounded border border-white/10 text-slate-400 text-[10px] font-mono">Ctrl+N</kbd> New Note</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Developer Footer - Sticky at Bottom */}
        <div className="border-t border-white/5 bg-slate-950 py-2 px-4 text-center flex-shrink-0">
          <p className="text-[11px] text-slate-600">
            Developed by <span className="text-emerald-500/80 font-medium">Arefin Siddiqui</span>
          </p>
        </div>
      </div>
    </div>
  );
}
