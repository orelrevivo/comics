'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, Italic, Strikethrough, Superscript as SuperscriptIcon, Type, 
  Image as ImageIcon, PlaySquare, List, ListOrdered, 
  AlertCircle, Quote, Code, SquareSlash, PanelTop, MoreHorizontal, Underline as UnderlineIcon
} from 'lucide-react';

export default function RichTextEditor({ content, onChange }: { content: string, onChange: (val: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Superscript,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image,
      Placeholder.configure({ placeholder: 'Body text*' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'w-full bg-transparent p-3 text-zinc-900 dark:text-zinc-100 focus:outline-none min-h-[150px] prose dark:prose-invert max-w-none',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleSuperscript = () => editor.chain().focus().toggleSuperscript().run();
  const toggleHeading = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();
  const toggleCodeBlock = () => editor.chain().focus().toggleCodeBlock().run();
  

  const addImage = () => {
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border border-zinc-300 dark:border-zinc-700 rounded-md overflow-hidden focus-within:border-zinc-900 dark:focus-within:border-zinc-300 transition-colors bg-white dark:bg-[#1A282D]">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-50 dark:bg-[#0B1416] border-b border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400">
        <button type="button" onClick={toggleBold} className={`p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded ${editor.isActive('bold') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}><Bold className="w-4 h-4" /></button>
        <button type="button" onClick={toggleItalic} className={`p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded ${editor.isActive('italic') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}><Italic className="w-4 h-4" /></button>
        <button type="button" onClick={toggleStrike} className={`p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded ${editor.isActive('strike') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}><Strikethrough className="w-4 h-4" /></button>
        <button type="button" onClick={toggleUnderline} className={`p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded ${editor.isActive('underline') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}><UnderlineIcon className="w-4 h-4" /></button>
        <button type="button" onClick={toggleSuperscript} className={`p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded ${editor.isActive('superscript') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}><SuperscriptIcon className="w-4 h-4" /></button>
        <button type="button" onClick={toggleHeading} className={`p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded border-s border-zinc-300 dark:border-zinc-700 ms-1 ps-2 ${editor.isActive('heading') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}><Type className="w-4 h-4" /></button>
        <div className="w-[1px] h-4 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
        <button type="button" onClick={addImage} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"><ImageIcon className="w-4 h-4" /></button>
        <button type="button" onClick={toggleBulletList} className={`p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded ${editor.isActive('bulletList') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}><List className="w-4 h-4" /></button>
        <button type="button" onClick={toggleOrderedList} className={`p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded ${editor.isActive('orderedList') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}><ListOrdered className="w-4 h-4" /></button>
        <button type="button" onClick={toggleBlockquote} className={`p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded ${editor.isActive('blockquote') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}><Quote className="w-4 h-4" /></button>
        <button type="button" onClick={toggleCodeBlock} className={`p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded ${editor.isActive('codeBlock') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}><Code className="w-4 h-4" /></button>
      </div>
      <div className="cursor-text" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
