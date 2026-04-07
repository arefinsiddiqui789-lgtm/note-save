'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { FontFamily } from '@tiptap/extension-font-family';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import FontSize from '@tiptap/extension-font-size';
import { useCallback, useEffect, useState } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Code, Heading1, Heading2, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Quote, Minus, Undo2, Redo2, Link as LinkIcon,
  Highlighter, Type, Pilcrow, CodeSquare,
  ImagePlus, Superscript as SuperscriptIcon, Subscript as SubscriptIcon,
  ListChecks, RemoveFormatting, MoreHorizontal, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

const TEXT_COLORS = [
  '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#e2e8f0',
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
  '#ec4899', '#fb7185', '#fdba74', '#fde047', '#86efac', '#67e8f9',
];

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', color: '#fef08a' },
  { name: 'Green', color: '#bbf7d0' },
  { name: 'Cyan', color: '#a5f3fc' },
  { name: 'Pink', color: '#fecdd3' },
  { name: 'Purple', color: '#e9d5ff' },
  { name: 'Orange', color: '#fed7aa' },
  { name: 'Remove', color: 'transparent' },
];

const FONTS = ['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Trebuchet MS'];

const FONT_SIZES = [
  '8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '64', '72',
];

/* ── Shared toolbar button ── */
function TBtn({ onClick, active, disabled, tooltip, children, className = '' }: {
  onClick: () => void; active?: boolean; disabled?: boolean;
  tooltip: string; children: React.ReactNode; className?: string;
}) {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button" variant="ghost" size="icon"
            className={`h-10 w-10 sm:h-7 sm:w-7 flex-shrink-0 transition-all active:scale-90 ${active ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'} ${disabled ? 'opacity-30 pointer-events-none' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-[11px] bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hidden sm:block">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ── Thin vertical divider ── */
function VDiv() {
  return <div className="w-px h-6 mx-1 bg-slate-200/80 dark:bg-white/10 flex-shrink-0 sm:hidden" />;
}
function VDivSm() {
  return <Separator orientation="vertical" className="h-5 mx-1 bg-slate-200 dark:bg-white/10 flex-shrink-0 hidden sm:block" />;
}

/* ── Mobile "More tools" popover ── */
function MoreTools({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);

  const toolGroups = [
    { label: 'Alignment', items: [
      { icon: <AlignLeft className="h-4 w-4" />, label: 'Left', action: () => editor.chain().focus().setTextAlign('left').run(), active: editor.isActive({ textAlign: 'left' }) },
      { icon: <AlignCenter className="h-4 w-4" />, label: 'Center', action: () => editor.chain().focus().setTextAlign('center').run(), active: editor.isActive({ textAlign: 'center' }) },
      { icon: <AlignRight className="h-4 w-4" />, label: 'Right', action: () => editor.chain().focus().setTextAlign('right').run(), active: editor.isActive({ textAlign: 'right' }) },
      { icon: <AlignJustify className="h-4 w-4" />, label: 'Justify', action: () => editor.chain().focus().setTextAlign('justify').run(), active: editor.isActive({ textAlign: 'justify' }) },
    ]},
    { label: 'Script', items: [
      { icon: <SuperscriptIcon className="h-4 w-4" />, label: 'Superscript', action: () => editor.chain().focus().toggleSuperscript().run(), active: editor.isActive('superscript') },
      { icon: <SubscriptIcon className="h-4 w-4" />, label: 'Subscript', action: () => editor.chain().focus().toggleSubscript().run(), active: editor.isActive('subscript') },
    ]},
    { label: 'Block', items: [
      { icon: <Minus className="h-4 w-4" />, label: 'Divider', action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
      { icon: <CodeSquare className="h-4 w-4" />, label: 'Code Block', action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock') },
    ]},
    { label: 'Cleanup', items: [
      { icon: <RemoveFormatting className="h-4 w-4" />, label: 'Clear Format', action: () => editor.chain().focus().unsetAllMarks().setParagraph().run(), active: false },
    ]},
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 sm:hidden flex-shrink-0 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all active:scale-90"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-[280px] p-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 mr-2 mb-2">
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 pt-1 pb-1.5">More Tools</p>
        {toolGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-600 px-2 pt-2 pb-1">{group.label}</p>
            <div className="flex gap-0.5 px-1">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg min-w-[56px] transition-all active:scale-95 ${
                    item.active
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                  onClick={() => { item.action(); setOpen(false); }}
                >
                  {item.icon}
                  <span className="text-[9px] font-medium leading-none">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}

/* ── Heading style selector ── */
function HeadingSelect({ editor }: { editor: Editor }) {
  const getHeadingLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'H1';
    if (editor.isActive('heading', { level: 2 })) return 'H2';
    if (editor.isActive('heading', { level: 3 })) return 'H3';
    return 'Normal';
  };

  return (
    <Select
      onValueChange={(v) => {
        if (v === 'p') editor.chain().focus().setParagraph().run();
        else if (v === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
        else if (v === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
        else if (v === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
      }}
    >
      <SelectTrigger className="h-10 w-[68px] sm:h-7 sm:w-[85px] border-none shadow-none bg-slate-100 dark:bg-white/5 text-[13px] sm:text-[12px] font-medium text-slate-700 dark:text-slate-300 focus:ring-0 gap-0.5 flex-shrink-0 rounded-lg sm:rounded-md">
        <span className="truncate">{getHeadingLabel()}</span>
        <ChevronDown className="h-3 w-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 w-[160px]">
        <SelectItem value="p" className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-white/10 focus:text-slate-900 dark:focus:text-white">
          <span className="flex items-center gap-2"><Pilcrow className="h-3.5 w-3.5" />Normal</span>
        </SelectItem>
        <SelectItem value="h1" className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-white/10 focus:text-slate-900 dark:focus:text-white">
          <span className="flex items-center gap-2"><Heading1 className="h-3.5 w-3.5" />Heading 1</span>
        </SelectItem>
        <SelectItem value="h2" className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-white/10 focus:text-slate-900 dark:focus:text-white">
          <span className="flex items-center gap-2"><Heading2 className="h-3.5 w-3.5" />Heading 2</span>
        </SelectItem>
        <SelectItem value="h3" className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-white/10 focus:text-slate-900 dark:focus:text-white">
          <span className="flex items-center gap-2"><span className="text-[10px] font-bold">H3</span>Heading 3</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

/* ── Main Toolbar ── */
function Toolbar({ editor }: { editor: Editor | null }) {
  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <>
      {/* ── Mobile toolbar: 2 beautiful rows ── */}
      <div className="sm:hidden border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
        {/* Row 1: History + Style + Format */}
        <div className="flex items-center px-1 py-1 gap-0.5 overflow-x-auto scrollbar-hide">
          <TBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} tooltip="Undo">
            <Undo2 className="h-[18px] w-[18px]" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} tooltip="Redo">
            <Redo2 className="h-[18px] w-[18px]" />
          </TBtn>
          <VDiv />
          <HeadingSelect editor={editor} />
          <VDiv />
          <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} tooltip="Bold">
            <Bold className="h-[18px] w-[18px]" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} tooltip="Italic">
            <Italic className="h-[18px] w-[18px]" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} tooltip="Underline">
            <UnderlineIcon className="h-[18px] w-[18px]" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} tooltip="Strikethrough">
            <Strikethrough className="h-[18px] w-[18px]" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} tooltip="Code">
            <Code className="h-[18px] w-[18px]" />
          </TBtn>
        </div>
        {/* Row 2: Color + Lists + Insert + More */}
        <div className="flex items-center px-1 pb-1.5 pt-0.5 gap-0.5 overflow-x-auto scrollbar-hide">
          {/* Text Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" className="h-10 w-10 flex-shrink-0 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all active:scale-90">
                <div className="flex flex-col items-center">
                  <Type className="h-4 w-4" />
                  <div className="h-[2px] w-3.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-0.5" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10" side="top">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 font-semibold uppercase tracking-wider">Text Color</p>
              <div className="grid grid-cols-6 gap-2">
                {TEXT_COLORS.map((c) => (
                  <button key={c} type="button"
                    className="h-8 w-8 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all hover:scale-110 active:scale-95"
                    style={{ backgroundColor: c }}
                    onClick={() => editor.chain().focus().setColor(c).run()}
                  />
                ))}
              </div>
              <button type="button"
                className="mt-2.5 text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors w-full text-center py-1"
                onClick={() => editor.chain().focus().unsetColor().run()}
              >Reset</button>
            </PopoverContent>
          </Popover>

          {/* Highlight */}
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" className="h-10 w-10 flex-shrink-0 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all active:scale-90">
                <Highlighter className="h-[18px] w-[18px]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10" side="top">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 font-semibold uppercase tracking-wider">Highlight</p>
              <div className="flex gap-2">
                {HIGHLIGHT_COLORS.map((h) => (
                  <button key={h.name} type="button"
                    className="h-8 w-9 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all hover:scale-110 active:scale-95"
                    style={{ backgroundColor: h.color === 'transparent' ? '#f1f5f9' : h.color }}
                    onClick={() => {
                      if (h.color === 'transparent') editor.chain().focus().unsetHighlight().run();
                      else editor.chain().focus().toggleHighlight({ color: h.color }).run();
                    }}
                    title={h.name}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <VDiv />

          <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} tooltip="Bullet List">
            <List className="h-[18px] w-[18px]" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} tooltip="Numbered List">
            <ListOrdered className="h-[18px] w-[18px]" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} tooltip="Checklist">
            <ListChecks className="h-[18px] w-[18px]" />
          </TBtn>

          <VDiv />

          <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} tooltip="Quote">
            <Quote className="h-[18px] w-[18px]" />
          </TBtn>
          <TBtn onClick={setLink} active={editor.isActive('link')} tooltip="Link">
            <LinkIcon className="h-[18px] w-[18px]" />
          </TBtn>
          <TBtn onClick={addImage} tooltip="Image">
            <ImagePlus className="h-[18px] w-[18px]" />
          </TBtn>

          {/* Spacer + More */}
          <div className="flex-1" />
          <MoreTools editor={editor} />
        </div>
      </div>

      {/* ── Desktop toolbar: same as before ── */}
      <div className="hidden sm:flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
        <TBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} tooltip="Undo (Ctrl+Z)">
          <Undo2 className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} tooltip="Redo (Ctrl+Y)">
          <Redo2 className="h-3.5 w-3.5" />
        </TBtn>
        <VDivSm />
        <HeadingSelect editor={editor} />
        <VDivSm />
        <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} tooltip="Bold (Ctrl+B)">
          <Bold className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} tooltip="Italic (Ctrl+I)">
          <Italic className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} tooltip="Underline (Ctrl+U)">
          <UnderlineIcon className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} tooltip="Strikethrough">
          <Strikethrough className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} tooltip="Inline Code">
          <Code className="h-3.5 w-3.5" />
        </TBtn>
        <VDivSm />
        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex-shrink-0">
              <div className="flex flex-col items-center">
                <Type className="h-3 w-3" />
                <div className="h-[2px] w-3 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-0.5" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10" side="bottom">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1.5 font-medium uppercase tracking-wider">Text Color</p>
            <div className="grid grid-cols-6 gap-1.5">
              {TEXT_COLORS.map((c) => (
                <button key={c} type="button" className="h-7 w-7 rounded border border-slate-200 dark:border-white/10 cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all hover:scale-110" style={{ backgroundColor: c }} onClick={() => editor.chain().focus().setColor(c).run()} />
              ))}
            </div>
            <button type="button" className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors w-full text-center" onClick={() => editor.chain().focus().unsetColor().run()}>Reset to default</button>
          </PopoverContent>
        </Popover>
        {/* Highlight */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex-shrink-0">
              <Highlighter className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10" side="bottom">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1.5 font-medium uppercase tracking-wider">Highlight</p>
            <div className="flex gap-1.5">
              {HIGHLIGHT_COLORS.map((h) => (
                <button key={h.name} type="button" className="h-7 w-8 rounded border border-slate-200 dark:border-white/10 cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all hover:scale-110" style={{ backgroundColor: h.color === 'transparent' ? '#f1f5f9' : h.color }} onClick={() => { if (h.color === 'transparent') editor.chain().focus().unsetHighlight().run(); else editor.chain().focus().toggleHighlight({ color: h.color }).run(); }} title={h.name} />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <VDivSm />
        {/* Text Alignment */}
        <TBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} tooltip="Align Left"><AlignLeft className="h-3.5 w-3.5" /></TBtn>
        <TBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} tooltip="Align Center"><AlignCenter className="h-3.5 w-3.5" /></TBtn>
        <TBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} tooltip="Align Right"><AlignRight className="h-3.5 w-3.5" /></TBtn>
        <TBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} tooltip="Justify"><AlignJustify className="h-3.5 w-3.5" /></TBtn>
        <VDivSm />
        {/* Lists */}
        <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} tooltip="Bullet List"><List className="h-3.5 w-3.5" /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} tooltip="Numbered List"><ListOrdered className="h-3.5 w-3.5" /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} tooltip="Checklist"><ListChecks className="h-3.5 w-3.5" /></TBtn>
        <VDivSm />
        {/* Block Elements */}
        <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} tooltip="Blockquote"><Quote className="h-3.5 w-3.5" /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} tooltip="Code Block"><CodeSquare className="h-3.5 w-3.5" /></TBtn>
        <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} tooltip="Horizontal Rule"><Minus className="h-3.5 w-3.5" /></TBtn>
        <VDivSm />
        {/* Insert */}
        <TBtn onClick={setLink} active={editor.isActive('link')} tooltip="Insert/Edit Link"><LinkIcon className="h-3.5 w-3.5" /></TBtn>
        <TBtn onClick={addImage} tooltip="Insert Image"><ImagePlus className="h-3.5 w-3.5" /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} tooltip="Superscript"><SuperscriptIcon className="h-3.5 w-3.5" /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} tooltip="Subscript"><SubscriptIcon className="h-3.5 w-3.5" /></TBtn>
        <VDivSm />
        <TBtn onClick={() => editor.chain().focus().unsetAllMarks().setParagraph().run()} tooltip="Clear Formatting"><RemoveFormatting className="h-3.5 w-3.5" /></TBtn>
        {/* Font Family & Size */}
        <Select onValueChange={(v) => { if (v === 'default') editor.chain().focus().unsetFontFamily().run(); else editor.chain().focus().setFontFamily(v).run(); }}>
          <SelectTrigger className="h-7 w-[100px] border-none shadow-none bg-transparent text-[12px] text-slate-500 dark:text-slate-400 focus:ring-0 gap-0 inline-flex flex-shrink-0">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
            <SelectItem value="default" className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-white/10 focus:text-slate-900 dark:focus:text-white">Default</SelectItem>
            {FONTS.map((f) => (<SelectItem key={f} value={f} className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-white/10 focus:text-slate-900 dark:focus:text-white" style={{ fontFamily: f }}>{f}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select onValueChange={(v) => { if (v === 'default') editor.chain().focus().unsetFontSize().run(); else editor.chain().focus().setFontSize(v + 'px').run(); }}>
          <SelectTrigger className="h-7 w-[72px] border-none shadow-none bg-transparent text-[12px] text-slate-500 dark:text-slate-400 focus:ring-0 gap-0 inline-flex flex-shrink-0">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 max-h-60">
            <SelectItem value="default" className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-white/10 focus:text-slate-900 dark:focus:text-white">Default</SelectItem>
            {FONT_SIZES.map((s) => (<SelectItem key={s} value={s} className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-white/10 focus:text-slate-900 dark:focus:text-white">{s}px</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

interface Props {
  content: string;
  onUpdate: (html: string) => void;
  editable?: boolean;
}

export default function RichTextEditor({ content, onUpdate, editable = true }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: 'Start writing your note...' }),
      FontFamily,
      FontSize,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'editor-link', target: '_blank' },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: { class: 'editor-image' },
      }),
      Superscript,
      Subscript,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content,
    editable,
    onUpdate: ({ editor: ed }) => onUpdate(ed.getHTML()),
    editorProps: {
      attributes: { class: 'min-h-[calc(100vh-200px)] focus:outline-none px-4 py-3 sm:px-6 sm:py-4 lg:px-16 lg:py-8' },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="flex flex-col h-full">
      {editable && <Toolbar editor={editor} />}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <EditorContent
          editor={editor}
          className="h-full [&_.tiptap]:text-slate-700 dark:[&_.tiptap]:text-slate-300 [&_.tiptap]:text-[15px] [&_.tiptap]:leading-relaxed"
        />
      </div>
    </div>
  );
}
