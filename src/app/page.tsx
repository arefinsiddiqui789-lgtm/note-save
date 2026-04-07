'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Save,
  FileText,
  Plus,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Download,
  Printer,
  Clock,
  Check,
  Loader2,
  StickyNote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useNoteAppStore } from '@/store/note-app';
import Sidebar from '@/components/note-app/sidebar';
import RichTextEditor from '@/components/note-app/rich-text-editor';
import { toast } from 'sonner';

export default function NoteApp() {
  const {
    folders,
    notes,
    selectedFolderId,
    selectedNoteId,
    setSelectedFolderId,
    setSelectedNoteId,
    setFolders,
    setNotes,
    addNote,
    updateNote,
    isSaving,
    setIsSaving,
    hasUnsavedChanges,
    setHasUnsavedChanges,
  } = useNoteAppStore();

  const [localContent, setLocalContent] = useState('');
  const [localTitle, setLocalTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const [foldersRes, notesRes] = await Promise.all([
          fetch('/api/folders'),
          fetch('/api/notes'),
        ]);
        const foldersData = await foldersRes.json();
        const notesData = await notesRes.json();
        setFolders(foldersData);
        setNotes(notesData);
      } catch (e) {
        console.error('Failed to fetch data:', e);
      }
    }
    fetchData();
  }, [setFolders, setNotes]);

  // Update local state when selected note changes
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

  // Handle content change with auto-save debounce
  const handleContentChange = useCallback(
    (newContent: string) => {
      setLocalContent(newContent);
      setHasUnsavedChanges(true);

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(async () => {
        if (selectedNoteId) {
          await saveNote(selectedNoteId, localTitle, newContent);
        }
      }, 1500);
    },
    [selectedNoteId, localTitle]
  );

  // Save note
  const saveNote = async (noteId: string, title: string, content: string) => {
    if (!noteId) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const updated = await res.json();
      updateNote(noteId, {
        title: updated.title,
        content: updated.content,
        updatedAt: updated.updatedAt,
      });
      setHasUnsavedChanges(false);
      toast.success('Note saved');
    } catch (e) {
      console.error('Failed to save note:', e);
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  // Manual save
  const handleSave = useCallback(async () => {
    if (!selectedNoteId) return;
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    await saveNote(selectedNoteId, localTitle, localContent);
  }, [selectedNoteId, localTitle, localContent]);

  // Create note
  const handleCreateNote = async (folderId: string | null) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Note',
          content: '',
          folderId: folderId || undefined,
        }),
      });
      const note = await res.json();
      addNote(note);
      setSelectedNoteId(note.id);
      setIsEditingTitle(true);
      setTimeout(() => titleInputRef.current?.focus(), 100);
    } catch (e) {
      console.error('Failed to create note:', e);
      toast.error('Failed to create note');
    }
  };

  // Update title
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setLocalTitle(newTitle);
      setHasUnsavedChanges(true);
      if (selectedNoteId) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        autoSaveTimerRef.current = setTimeout(async () => {
          await saveNote(selectedNoteId, newTitle, localContent);
        }, 1000);
      }
    },
    [selectedNoteId, localContent]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNote(selectedFolderId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleCreateNote, selectedFolderId]);

  // Download note as HTML
  const handleDownload = () => {
    if (!selectedNote) return;
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${selectedNote.title}</title>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; color: #333; }
    h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    blockquote { border-left: 4px solid #ccc; padding-left: 1em; color: #666; margin-left: 0; }
    code { background: #f4f4f4; padding: 0.15em 0.3em; border-radius: 3px; font-size: 0.9em; }
    pre { background: #f4f4f4; padding: 1em; border-radius: 5px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    img { max-width: 100%; height: auto; }
    ul, ol { padding-left: 1.5em; }
    hr { border: none; border-top: 1px solid #eee; margin: 2em 0; }
  </style>
</head>
<body>
  <h1>${selectedNote.title}</h1>
  ${selectedNote.content}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNote.title || 'untitled'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Note downloaded');
  };

  // Print note
  const handlePrint = () => {
    if (!selectedNote) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html>
<html>
<head><title>${selectedNote.title}</title></head>
<body style="font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
<h1>${selectedNote.title}</h1>
${selectedNote.content}
<script>window.onload = () => window.print();<\/script>
</body></html>`);
      printWindow.document.close();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex flex-col border-r bg-muted/20 transition-all duration-300 ${
          sidebarOpen ? 'w-72 min-w-[288px]' : 'w-0 min-w-0 overflow-hidden'
        }`}
      >
        {sidebarOpen && (
          <Sidebar
            onCreateNote={handleCreateNote}
            onSelectNote={setSelectedNoteId}
          />
        )}
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetContent side="left" className="w-72 p-0">
          <Sidebar
            onCreateNote={handleCreateNote}
            onSelectNote={(id) => setSelectedNoteId(id)}
          />
        </SheetContent>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-3 left-3 z-50 h-8 w-8 bg-background shadow-sm border"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedNote ? (
          <>
            {/* Top Bar */}
            <div className="flex items-center gap-2 px-4 py-2 border-b bg-background">
              {/* Sidebar Toggle */}
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden md:flex h-8 w-8"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                      {sidebarOpen ? (
                        <PanelLeftClose className="h-4 w-4" />
                      ) : (
                        <PanelLeft className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Toggle Sidebar
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Note Info */}
              <div className="flex-1 flex items-center gap-3 min-w-0">
                {selectedNote.folder && (
                  <div className="hidden sm:flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: selectedNote.folder.color }}
                    />
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {selectedNote.folder.name}
                    </span>
                  </div>
                )}

                {/* Title */}
                <div className="flex-1 min-w-0">
                  {isEditingTitle ? (
                    <Input
                      ref={titleInputRef}
                      value={localTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      onBlur={() => setIsEditingTitle(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setIsEditingTitle(false);
                        if (e.key === 'Escape') {
                          setLocalTitle(selectedNote?.title || 'Untitled Note');
                          setIsEditingTitle(false);
                        }
                      }}
                      className="h-8 text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-0"
                    />
                  ) : (
                    <h1
                      className="text-lg font-semibold truncate cursor-pointer hover:text-muted-foreground transition-colors"
                      onClick={() => setIsEditingTitle(true)}
                      title="Click to edit title"
                    >
                      {localTitle || 'Untitled Note'}
                    </h1>
                  )}
                </div>

                {/* Save Status */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isSaving ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="hidden sm:inline">Saving...</span>
                    </div>
                  ) : hasUnsavedChanges ? (
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="hidden sm:inline">Unsaved</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-emerald-500">
                      <Check className="h-3 w-3" />
                      <span className="hidden sm:inline">Saved</span>
                    </div>
                  )}

                  <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(selectedNote.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleSave}
                        disabled={isSaving || !hasUnsavedChanges}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Save (Ctrl+S)
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <span className="text-xs font-medium">⋮⋮</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Note
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download as HTML
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePrint}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              <RichTextEditor
                content={localContent}
                onUpdate={handleContentChange}
              />
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-1.5 border-t bg-muted/30 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>
                  Created: {new Date(selectedNote.createdAt).toLocaleDateString()}
                </span>
                <span>
                  Modified: {new Date(selectedNote.updatedAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>
                  Word count: {localContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length}
                </span>
                <span>•</span>
                <span>
                  Char count: {localContent.replace(/<[^>]*>/g, '').length}
                </span>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-sm mx-auto px-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <StickyNote className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">No Note Selected</h2>
                <p className="text-sm text-muted-foreground">
                  Create a new note or select an existing one from the sidebar to start writing.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={() => handleCreateNote(selectedFolderId)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Note
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden"
                >
                  <Menu className="h-4 w-4 mr-2" />
                  Browse Notes
                </Button>
              </div>
              <div className="pt-4 text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Keyboard shortcuts</p>
                <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+S</kbd> Save note</p>
                <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+N</kbd> New note</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
