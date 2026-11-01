"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Heading2, Quote, Link2, Undo2, Redo2 } from "lucide-react";

const tools = [
  { label: "Bold", icon: Bold, command: "bold" },
  { label: "Italic", icon: Italic, command: "italic" },
  { label: "Underline", icon: Underline, command: "underline" },
  { label: "Heading", icon: Heading2, command: "formatBlock", value: "h2" },
  { label: "Bulleted list", icon: List, command: "insertUnorderedList" },
  { label: "Numbered list", icon: ListOrdered, command: "insertOrderedList" },
  { label: "Quote", icon: Quote, command: "formatBlock", value: "blockquote" },
];

export default function RichTextEditor({ value = "", onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const runCommand = (command, commandValue) => {
    editorRef.current?.focus();
    if (command === "formatBlock") {
      document.execCommand(command, false, commandValue);
    } else {
      document.execCommand(command, false, commandValue || null);
    }
    onChange?.(editorRef.current?.innerHTML || "");
  };

  const addLink = () => {
    const url = window.prompt("Enter the full link (https://...)");
    if (!url) return;
    if (!/^https:\/\//i.test(url)) {
      window.alert("Please enter a secure https:// link.");
      return;
    }
    runCommand("createLink", url);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
        {tools.map(({ label, icon: Icon, command, value: commandValue }) => (
          <button key={label} type="button" title={label} aria-label={label} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand(command, commandValue)} className="rounded-lg p-2 text-slate-600 transition hover:bg-white hover:text-emerald-700 hover:shadow-sm">
            <Icon size={17} />
          </button>
        ))}
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <button type="button" title="Add link" aria-label="Add link" onMouseDown={(event) => event.preventDefault()} onClick={addLink} className="rounded-lg p-2 text-slate-600 hover:bg-white hover:text-emerald-700">
          <Link2 size={17} />
        </button>
        <button type="button" title="Undo" aria-label="Undo" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("undo")} className="rounded-lg p-2 text-slate-600 hover:bg-white hover:text-emerald-700">
          <Undo2 size={17} />
        </button>
        <button type="button" title="Redo" aria-label="Redo" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("redo")} className="rounded-lg p-2 text-slate-600 hover:bg-white hover:text-emerald-700">
          <Redo2 size={17} />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="News article content"
        aria-multiline="true"
        data-placeholder="Write your article here. Format headings, emphasis, lists and links..."
        onInput={(event) => onChange?.(event.currentTarget.innerHTML)}
        className="prose prose-slate min-h-[280px] max-w-none px-4 py-4 text-sm leading-7 outline-none empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] [&_a]:text-emerald-700 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-300 [&_blockquote]:pl-4 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
      />
    </div>
  );
}
