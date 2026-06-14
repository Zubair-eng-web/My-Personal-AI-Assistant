import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, RefreshCw, Trash2, ArrowDown, Clipboard, Check, Sparkles, Brain, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { Message } from '../types';
import Suggestions from './Suggestions';

interface MainChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  isLoading: boolean;
  onToggleSidebar: () => void;
}

export default function MainChat({
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  onToggleSidebar,
}: MainChatProps) {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle textarea height auto-grow
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Monitor scroll positioning to display scroll-to-bottom anchor
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      setShowScrollBtn(!isNearBottom && scrollHeight > clientHeight);
    }
  };

  // Keyboard action: Send on Enter, multi-line on Shift+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    // Strip "AI App:" prefix if we want neat copies
    const cleanText = text.startsWith('AI App:') ? text.substring(7).trim() : text;
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative flex flex-1 flex-col bg-[#faf9f6] text-[#1c1917]" id="chat-container">
      {/* Top Navigation Bar */}
      <header className="flex h-16 items-center justify-between border-b border-[#e7e5e4] bg-white px-4 md:px-6 shadow-sm shrink-0" id="chat-header">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            title="Toggle history sidebar"
            id="sidebar-toggle-btn"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 fill-indigo-100 animate-pulse" />
            <span className="font-sans font-semibold text-xs text-zinc-700 tracking-tight">My  AI Assisstant</span>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-1.5 rounded-lg border border-red-200/50 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer"
            id="clear-chat-top-btn"
          >
            <Trash2 className="h-4 w-4" />
            Clear Current Thread
          </button>
        )}
      </header>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6"
        id="messages-scroll-area"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            /* Welcome / Starter View */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="py-10 md:py-16 text-center max-w-3xl mx-auto"
              id="greeting-view"
            >
              {/* Visual Anchor */}
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 text-white shadow-lg mb-6">
                <Brain className="h-8 w-8 animate-wiggle" />
              </div>

              {/* Bold Title */}
              <h2 className="font-display font-bold text-3xl md:text-4xl text-zinc-900 tracking-tight leading-tight">
                hy genius; how can i help you today?
              </h2>
              <p className="text-zinc-500 text-sm md:text-base mt-2.5 max-w-xl mx-auto leading-relaxed">
                I am your standalone smart workspace assistant running on the latest Gemini model. 
                I specialize in debugging code, generating project structures, studying topics, and brainstorming.
              </p>

              {/* Suggestions shortcuts */}
              <Suggestions onSelectSuggestion={(text) => {
                setInput(text);
                if (textareaRef.current) {
                  textareaRef.current.focus();
                }
              }} />
            </motion.div>
          ) : (
            /* Traditional Messages Thread */
            <div className="max-w-4xl mx-auto space-y-6" id="messages-list">
              {messages.map((message) => {
                const isAssistant = message.role === 'assistant';
                // Eliminate starting "AI App:" display prefix if present, as it will be styled neatly with our UI badge!
                const cleanContent = message.content.startsWith('AI App:')
                  ? message.content.substring(7).trim()
                  : message.content;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex gap-4 md:gap-5 ${isAssistant ? '' : 'flex-row-reverse'}`}
                    id={`message-bubble-${message.id}`}
                  >
                    {/* Role Avatar */}
                    <div
                      className={`flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl font-semibold shadow-sm ${
                        isAssistant
                          ? 'bg-gradient-to-br from-indigo-500 to-sky-400 text-white'
                          : 'bg-zinc-200 border border-zinc-300 text-zinc-700'
                      }`}
                      id={`message-avatar-${message.id}`}
                    >
                      {isAssistant ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                    </div>

                    {/* Content Wrap */}
                    <div className="flex flex-col max-w-[82%]" id={`message-content-wrap-${message.id}`}>
                      {/* Name / Role Label & Timestamp */}
                      <div className={`flex items-center gap-2 mb-1 text-xs ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                        <span className="font-semibold text-zinc-800 tracking-tight">
                          {isAssistant ? 'AI App Assistant' : 'You'}
                        </span>
                        <span className="font-mono text-[9px] text-zinc-400/80">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Actual Text Bubble */}
                      <div
                        className={`relative rounded-2xl px-5 py-3.5 shadow-sm text-sm border leading-relaxed ${
                          isAssistant
                            ? 'bg-white border-zinc-200 text-zinc-800 rounded-tl-sm'
                            : 'bg-zinc-800 border-zinc-900 text-white rounded-tr-sm'
                        }`}
                        id={`message-text-bubble-${message.id}`}
                      >
                        {isAssistant ? (
                          <div className="markdown-body">
                            <Markdown>{cleanContent}</Markdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap select-text">{cleanContent}</p>
                        )}

                        {/* Quick Message Actions */}
                        <div className={`absolute -bottom-8 right-2 flex gap-1 bg-white border border-zinc-200 rounded-lg p-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all shadow-sm ${
                          isAssistant ? 'group-hover:opacity-100' : ''
                        }`} id={`actions-wrap-${message.id}`}>
                          {/* Wait, adding grouping wrapper className trigger to bubble for copy button hover */}
                        </div>
                      </div>

                      {/* Separate action row underneath so it doesn't overlap text layout */}
                      <div className={`flex gap-2 mt-1 px-1 justify-end`} id={`under-actions-${message.id}`}>
                        <button
                          onClick={() => handleCopyMessage(message.content, message.id)}
                          className={`flex items-center gap-1 px-2 py-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg text-[10px] font-semibold text-zinc-500 hover:text-zinc-700 transition-colors cursor-pointer`}
                          title="Copy response body"
                          id={`copy-btn-${message.id}`}
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Clipboard className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

          {/* Model Is Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 md:gap-5 max-w-4xl mx-auto"
              id="thinking-loader"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 text-white shadow-sm">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col max-w-[80%]">
                <span className="font-semibold text-zinc-800 text-xs mb-1">My  AI Assistent </span>
                <div className="flex items-center gap-3.5 rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 shadow-sm">
                  {/* Subtle Spinner icon & Thinking line pulse */}
                  <RefreshCw className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
                  <div className="flex items-center gap-1" id="thinking-dots">
                    <span className="font-sans text-xs text-zinc-500">Formulating response...</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce delay-75" />
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce delay-150" />
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        <div ref={messagesEndRef} id="bottom-scroll-anchor" />
      </div>

      {/* Scroll to bottom floating shortcut */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-28 right-6 md:right-10 z-35 flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-md hover:bg-zinc-50 active:scale-95 transition-all"
          title="Scroll to bottom"
          id="scroll-to-bottom-button"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}

      {/* Floating Prompt Input Panel */}
      <footer className="border-t border-[#e7e5e4] bg-white p-4 md:px-8 md:py-5 shrink-0" id="prompt-footer">
        <div className="max-w-4xl mx-auto" id="input-container">
          <div className="relative flex items-end rounded-2xl border border-zinc-300/80 bg-[#fcfcfb] focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 shadow-sm focus-within:shadow-md transition-all px-3 py-2.5">
            
            {/* Action text field area */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything (e.g., 'Find bug in code', 'Study outline', 'Help me build a component'...)"
              className="flex-1 resize-none border-0 bg-transparent px-2.5 py-1 text-sm text-zinc-900 placeholder-zinc-400 focus:ring-0 focus:outline-none max-h-48 leading-relaxed outline-none"
              id="prompt-textarea"
            />

            {/* Float control send */}
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-all focus:outline-none cursor-pointer ${
                input.trim() && !isLoading
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              }`}
              title="Send message"
              id="send-prompt-btn"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Prompt Guidelines/Telemetry footer */}
          <div className="flex items-center justify-between mt-2.5 px-1 text-[10px] text-zinc-400/80 font-mono" id="input-telemetry">
            <span>Press <kbd className="bg-zinc-100 border border-zinc-200 px-1 py-0.5 rounded text-zinc-500">Enter</kbd> to send, <kbd className="bg-zinc-100 border border-zinc-200 px-1 py-0.5 rounded text-zinc-500">Shift + Enter</kbd> for multi-line code blocks</span>
            <span>AI Assistent </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
