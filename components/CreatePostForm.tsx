'use client';

import { useState } from 'react';
import { createPostAction } from '@/app/actions/community';
import { useFormStatus } from 'react-dom';
import RichTextEditor from './RichTextEditor';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="brutal-btn bg-indigo-600 text-white px-4 py-2 font-bold"
    >
      <span className="text-red-500 ms-1">*</span>{pending ? 'מפרסם...' : 'Post'}
    </button>
  );
}

export default function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState('text');
  const [pollOptions, setPollOptions] = useState(['', '']);

  return (
    <div className="sm:p-6 brutal-card bg-white dark:bg-[#0B1416] mb-10 w-full font-sans">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto hide-scrollbar">
        {['Text', 'Images & Video', 'Link', 'Poll'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.toLowerCase()
              ? 'border-indigo-500 text-zinc-900 dark:text-zinc-100'
              : 'border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form action={createPostAction} onSubmit={(e) => {
        const hasPoll = pollOptions.some(opt => opt.trim() !== '');
        if (!hasPoll && (!content || content === '<p></p>')) {
          e.preventDefault();
          alert('Please enter some text or create a poll!');
        }
      }} className="space-y-4">
        {/* Title Input */}
        <div className="relative">
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={300}
            placeholder="Title*"
            required
            className="w-full brutal-input bg-transparent p-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500"
          />
          <div className="text-xs text-zinc-500 absolute end-3 top-1/2 -translate-y-1/2 bg-white dark:bg-[#0B1416] px-1 font-mono">
            {title.length}/300
          </div>
        </div>

        {/* Hidden Content Field for Action */}
        <input type="hidden" name="content" value={content} />

        {/* Dynamic Tab Content */}
        {activeTab === 'text' && (
          <RichTextEditor content={content} onChange={setContent} />
        )}

        {activeTab === 'images & video' && (
          <div className="brutal-card border-dashed p-10 flex flex-col items-center justify-center text-zinc-500 bg-zinc-50 dark:bg-[#0B1416]">
            <p className="mb-4 font-bold text-zinc-700 dark:text-zinc-300">Upload an image from your computer</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="image-upload"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData
                });

                const data = await res.json();
                if (data.url) {
                  setContent(prev => prev + `<br/><img src="${data.url}" style="max-width: 100%; border-radius: 8px;" />`);
                  setActiveTab('text'); // Switch back to text to see it
                }
              }}
            />
            <label htmlFor="image-upload" className="cursor-pointer brutal-btn bg-white dark:bg-zinc-800 px-4 py-2 font-bold text-sm">
              Select Image File
            </label>
          </div>
        )}

        {activeTab === 'link' && (
          <div className="relative">
            <input
              type="url"
              placeholder="Url"
              onChange={(e) => setContent(`<a href="${e.target.value}">${e.target.value}</a>`)}
              className="w-full brutal-input bg-transparent p-3 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        )}

        {/* Hidden Inputs for Poll Options */}
        {pollOptions.map((opt, idx) => (
          opt.trim() !== '' && <input key={idx} type="hidden" name="pollOption" value={opt} />
        ))}

        {activeTab === 'poll' && (
          <div className="brutal-card p-4 bg-zinc-50 dark:bg-[#0B1416] space-y-3">
            {pollOptions.map((opt, idx) => (
              <input
                key={idx}
                value={opt}
                onChange={(e) => {
                  const newOpts = [...pollOptions];
                  newOpts[idx] = e.target.value;
                  setPollOptions(newOpts);
                }}
                placeholder={`Option ${idx + 1}`}
                className="w-full brutal-input bg-transparent p-2 text-sm"
              />
            ))}
            {pollOptions.length < 6 && (
              <button
                type="button"
                onClick={() => setPollOptions([...pollOptions, ''])}
                className="text-indigo-500 font-bold text-sm"
              >
                + Add Option
              </button>
            )}
            <p className="text-xs text-zinc-500">Adding options creates a poll when you post. Text content is optional if a poll is provided.</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
