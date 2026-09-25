"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { ChatMessage } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export function ChatPanel({
  isOpen,
  onClose,
  messages,
  onSendMessage,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <aside className="w-80 h-full bg-dark-surface border-l border-dark-border flex flex-col z-20 animate-slide-up">
      {/* Header */}
      <div className="p-4 border-b border-dark-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Meeting Chat</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/5"
        >
          Close
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs">
            <p>No messages yet.</p>
            <p className="text-[11px] mt-1 text-slate-600">
              Messages sent here are visible to all meeting attendees.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.isMe ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[11px] font-semibold text-slate-300">
                  {msg.sender}
                </span>
                <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
              </div>
              <div
                className={`px-3 py-2 rounded-2xl text-xs max-w-[85%] break-words ${
                  msg.isMe
                    ? "bg-brand text-white rounded-tr-xs"
                    : "bg-dark-card border border-dark-border text-slate-200 rounded-tl-xs"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-dark-border bg-dark-bg/60 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send a message to everyone..."
          className="flex-1 h-9 px-3 rounded-xl bg-dark-card border border-dark-border text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-brand"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!inputText.trim()}
          className="h-9 px-3"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </aside>
  );
}
