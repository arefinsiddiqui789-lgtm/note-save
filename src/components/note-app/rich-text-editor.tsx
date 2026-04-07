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
import { useCallback, useEffect } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Code, Heading1, Heading2, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Quote, Minus, Undo2, Redo2, Link as LinkIcon,
  Highlighter, Type, Pilcrow, CodeSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const TEXT_COLORS = [
  '#ffffff', '#e2e8f0', '#94a3b8', '#64748b', '#475569', '#0f172a',
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
  { name: 'Remove', color: 'transparent' },
];

const FONTS = ['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Trebuchet MS'];

function TBtn({ onClick, active, disabled, tooltip, children }: { onClick: () => void; active?: boolean; disabled?: boolean; tooltip: string; children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className={`h-7 w-7 ${active ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} onClick={onClick} disabled={disabled}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-[11px] bg-slate-800 border-white/10 text-slate-300">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', prev || 'https://');
    if (!url) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-b border-white/5 bg-white/[0.02]">
      <TBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} tooltip="Undo"><Undo2 className="h-3.5 w-3.5" /></TBtn>
      <TBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} tooltip="Redo"><Redo2 className="h-3.5 w-3.5" /></TBtn>

      <div className="w-px h-5 bg-white/10 mx-1" />

      <Select onValueChange={(v) => { if (v === 'default') { editor.chain().focus().unsetFontFamily().run(); } else { editor.chain().focus().setFontFamily(v).run(); } }}>
        <SelectTrigger className="h-7 w-[110px] border-none shadow-none bg-transparent text-[12px] text-slate-400 focus:ring-0 gap-0">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-white/10">
          <SelectItem value="default" className="text-slate-300 focus:bg-white/10 focus:text-white">Default</SelectItem>
          {FONTS.map((f) => <SelectItem key={f} value={f} className="text-slate-300 focus:bg-white/10 focus:text-white" style={{ fontFamily: f }}>{f}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select onValueChange={(v) => { if (v === 'p') { editor.chain().focus().setParagraph().run(); } else { editor.chain().focus().toggleHeading({ level: Number(v.replace('h', '')) as 1 | 2 | 3 }).run(); } }}>
        <SelectTrigger className="h-7 w-[90px] border-none shadow-none bg-transparent text-[12px] text-slate-400 focus:ring-0 gap-0">
          <SelectValue placeholder="Style" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-white/10">
          <SelectItem value="p" className="text-slate-300 focus:bg-white/10 focus:text-white"><span className="flex items-center gap-2"><Pilcrow className="h-3 w-3" />Normal</span></SelectItem>
          <SelectItem value="h1" className="text-slate-300 focus:bg-white/10 focus:text-white"><span className="flex items-center gap-2"><Heading1 className="h-3 w-3" />Heading 1</span></SelectItem>
          <SelectItem value="h2" className="text-slate-300 focus:bg-white/10 focus:text-white"><span className="flex items-center gap-2"><Heading2 className="h-3 w-3" />Heading 2</span></SelectItem>
          <SelectItem value="h3" className="text-slate-300 focus:bg-white/10 focus:text-white"><span className="flex items-center gap-2"><Heading1 className="h-3 w-3" />Heading 3</span></SelectItem>
        </SelectContent>
      </Select>

      <div className="w-px h-5 bg-white/10 mx-1" />

      <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} tooltip="Bold"><Bold className="h-3.5 w-3.5" /></TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} tooltip="Italic"><Italic className="h-3.5 w-3.5" /></TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} tooltip="Underline"><UnderlineIcon className="h-3.5 w-3.5" /></TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} tooltip="Strikethrough"><Strikethrough className="h-3.5 w-3.5" /></TBtn>

      <div className="w-px h-5 bg-white/10 mx-1" />

      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/5">
            <div className="flex flex-col items-center">
              <Type className="h-3 w-3" />
              <div className="h-[2px] w-3 rounded-full bg-emerald-400 mt-0.5" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 bg-slate-800 border-white/10" side="bottom">
          <div className="grid grid-cols-6 gap-1">
            {TEXT_COLORS.map((c) => (
              <button key={c} type="button" className="h-6 w-6 rounded border border-white/10 cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all" style={{ backgroundColor: c }} onClick={() => editor.chain().focus().setColor(c).run()} />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/5"><Highlighter className="h-3.5 w-3.5" /></Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 bg-slate-800 border-white/10" side="bottom">
          <div className="flex gap-1.5">
            {HIGHLIGHT_COLORS.map((h) => (
              <button key={h.name} type="button" className="h-6 w-8 rounded border border-white/10 cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all" style={{ backgroundColor: h.color === 'transparent' ? '#1e293b' : h.color }} onClick={() => h.color === 'transparent' ? editor.chain().focus().unsetHighlight().run() : editor.chain().focus().toggleHighlight({ color: h.color }).run()} title={h.name} />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-px h-5 bg-white/10 mx-1" />

      <TBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} tooltip="Align Left"><AlignLeft className="h-3.5 w-3.5" /></TBtn>
      <TBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} tooltip="Align Center"><AlignCenter className="h-3.5 w-3.5" /></TBtn>
      <TBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} tooltip="Align Right"><AlignRight className="h-3.5 w-3.5" /></TBtn>
      <TBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} tooltip="Justify"><AlignJustify className="h-3.5 w-3.5" /></TBtn>

      <div className="w-px h-5 bg-white/10 mx-1" />

      <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} tooltip="Bullet List"><List className="h-3.5 w-3.5" /></TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} tooltip="Numbered List"><ListOrdered className="h-3.5 w-3.5" /></TBtn>

      <div className="w-px h-5 bg-white/10 mx-1" />

      <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} tooltip="Quote"><Quote className="h-3.5 w-3.5" /></TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} tooltip="Code"><Code className="h-3.5 w-3.5" /></TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} tooltip="Code Block"><CodeSquare className="h-3.5 w-3.5" /></TBtn>
      <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} tooltip="Divider"><Minus className="h-3.5 w-3.5" /></TBtn>
      <TBtn onClick={setLink} active={editor.isActive('link')} tooltip="Link"><LinkIcon className="h-3.5 w-3.5" /></TBtn>
    </div>
  );
}

interface Props {
  content: string;
  onUpdate: (html: string) => void;
  editable?: boolean;
}

export default function RichTextEditor({ content, onUpdate, editable = true }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle, Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: 'Start writing your note...' }),
      FontFamily,
    ],
    content,
    editable,
    onUpdate: ({ editor: ed }) => onUpdate(ed.getHTML()),
    editorProps: {
      attributes: { class: 'min-h-[calc(100vh-200px)] focus:outline-none px-6 py-4 sm:px-10 sm:py-6 lg:px-16 lg:py-8' },
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
        <EditorContent editor={editor} className="h-full [&_.tiptap]:text-slate-300 [&_.tiptap]:text-[15px] [&_.tiptap]:leading-relaxed" />
      </div>
    </div>
  );
}
