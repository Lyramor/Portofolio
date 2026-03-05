'use client';

import { useEffect, useRef } from 'react';

export default function TrixEditor({ value, onChange, inputId = 'trix-input' }) {
  const editorRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    let editor = null;

    import('trix').then(() => {
      editor = editorRef.current;
      if (!editor) return;

      if (!initializedRef.current && value) {
        editor.editor.loadHTML(value);
        initializedRef.current = true;
      }

      const handleChange = () => {
        onChange(editor.innerHTML);
      };

      editor.addEventListener('trix-change', handleChange);

      return () => {
        editor.removeEventListener('trix-change', handleChange);
      };
    });
  }, []);

  return (
    <div className="trix-wrapper">
      <input type="hidden" id={inputId} />
      <trix-editor
        input={inputId}
        ref={editorRef}
        class="trix-content"
      />
      <style>{`
        trix-editor {
          background: #18181b;
          border: 1px solid #3f3f46;
          border-top: none;
          border-radius: 0 0 0.5rem 0.5rem;
          color: #d4d4d8;
          min-height: 150px;
          padding: 0.75rem;
          font-size: 0.95rem;
          line-height: 1.6;
        }
        trix-toolbar {
          background: #27272a;
          border: 1px solid #3f3f46;
          border-radius: 0.5rem 0.5rem 0 0;
          padding: 0.4rem 0.5rem;
        }
        trix-toolbar .trix-button {
          background: transparent;
          border: none;
          color: #a1a1aa;
          border-radius: 0.25rem;
          padding: 0.25rem 0.4rem;
        }
        trix-toolbar .trix-button:hover {
          background: #3f3f46;
          color: #f4f4f5;
        }
        trix-toolbar .trix-button.trix-active {
          background: #0284c7;
          color: #fff;
        }
        trix-toolbar .trix-button-group {
          border: 1px solid #3f3f46;
          border-radius: 0.25rem;
          margin-right: 0.25rem;
        }
        trix-toolbar .trix-button--icon::before {
          opacity: 0.8;
        }
        .trix-content ul, .trix-content ol {
          padding-left: 1.5rem;
        }
        .trix-content ul { list-style-type: disc; }
        .trix-content ol { list-style-type: decimal; }
        .trix-content strong { font-weight: bold; }
        .trix-content em { font-style: italic; }
      `}</style>
    </div>
  );
}
