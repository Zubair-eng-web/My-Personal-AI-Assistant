import React from 'react';
import { Plus, MessageSquare, Trash2, HelpCircle, Bot, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black md:hidden"
            id="sidebar-backdrop"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-76 flex-col border-r border-[#27272a] bg-[#0c0c0e] text-zinc-100 transition-transform duration-300 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        id="sidebar-panel"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-[#1f1f23]" id="sidebar-header">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 text-white shadow-md">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-sm leading-none tracking-tight">AI Companion</h1>
              <span className="font-mono text-[9px] text-zinc-400 tracking-wider uppercase">Active Thread</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-[#1f1f23] hover:text-zinc-100 md:hidden transition-colors"
            id="sidebar-close-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action button */}
        <div className="p-4" id="sidebar-actions">
          <button
            onClick={() => {
              onCreateSession();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-3 font-medium text-xs text-[#0a0a0c] hover:bg-zinc-200 transition-all shadow-sm hover:shadow active:scale-[0.98]"
            id="new-chat-btn"
          >
            <Plus className="h-4 w-4" />
             New Badshah Chat
          </button>
        </div>

        {/* Saved Sessions list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin" id="sidebar-sessions-container">
          <h2 className="px-3 pb-2 font-mono text-[10px] font-semibold text-zinc-500 tracking-wider uppercase">
            Recent Conversations
          </h2>
          {sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500" id="empty-history-text">
              No recent chats. Start brainstorming!
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {sessions.map((session) => {
                const isActive = session.id === currentSessionId;
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="group relative"
                    id={`session-item-${session.id}`}
                  >
                    <button
                      onClick={() => {
                        onSelectSession(session.id);
                        onClose();
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium tracking-normal transition-all ${
                        isActive
                          ? 'bg-[#1e1e24] text-white shadow-sm'
                          : 'text-zinc-400 hover:bg-[#131316] hover:text-zinc-200'
                      }`}
                      id={`session-btn-${session.id}`}
                    >
                      <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                      <span className="truncate pr-6 leading-tight">{session.title}</span>
                    </button>
                    <button
                      onClick={(e) => onDeleteSession(session.id, e)}
                      className="absolute right-2 top-1.5 rounded-lg p-1 text-zinc-500 hover:bg-[#2e2e38] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                      title="Delete chat"
                      id={`delete-session-btn-${session.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer/Info section */}
        <div className="border-t border-[#1f1f23] p-4 text-center" id="sidebar-footer">
          <div className="flex items-center gap-1.5 justify-center py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] text-zinc-400">Badshah AI Assistent App</span>
          </div>
          <p className="font-mono text-[9px] text-zinc-500 mt-1">
            Persisted locally. Secure & Fast.
          </p>
        </div>
      </div>
    </>
  );
}
