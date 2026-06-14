import React, { useState, useEffect } from 'react';
import { ChatSession, Message } from './types';
import Sidebar from './components/Sidebar';
import MainChat from './components/MainChat';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('ai_assistant_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id);
        }
      } catch (err) {
        console.error('Failed to parse saved sessions:', err);
      }
    }
  }, []);

  // Save changes to localStorage
  const saveSessions = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    localStorage.setItem('ai_assistant_sessions', JSON.stringify(updatedSessions));
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
  };

  const handleCreateSession = () => {
    // We can either set current to null to show the starter greeting, or pre-create.
    // Setting ID to null is perfect because it reveals the ambient starter workspace (Suggestions grid).
    setCurrentSessionId(null);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== id);
    saveSessions(updated);

    if (currentSessionId === id) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
      } else {
        setCurrentSessionId(null);
      }
    }
  };

  const handleClearCurrentChat = () => {
    if (!currentSessionId) return;
    const updated = sessions.map((s) => {
      if (s.id === currentSessionId) {
        return { ...s, messages: [] };
      }
      return s;
    });
    saveSessions(updated);
  };

  const handleSendMessage = async (text: string) => {
    setIsLoading(true);

    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    let activeSessionId = currentSessionId;
    let updatedSessions = [...sessions];
    let currentSession = sessions.find((s) => s.id === activeSessionId);

    // If there is no active session (i.e. we are on the starter screen)
    if (!activeSessionId || !currentSession) {
      const generatedId = Math.random().toString(36).substring(7);
      const generatedTitle = text.length > 40 ? `${text.substring(0, 38)}...` : text;

      currentSession = {
        id: generatedId,
        title: generatedTitle,
        messages: [userMessage],
        createdAt: Date.now(),
      };

      updatedSessions = [currentSession, ...updatedSessions];
      activeSessionId = generatedId;
      setSessions(updatedSessions);
      setCurrentSessionId(generatedId);
    } else {
      // Append message to standard existing session
      currentSession = {
        ...currentSession,
        messages: [...currentSession.messages, userMessage],
      };
      
      // Move active session to top of list
      updatedSessions = [
        currentSession,
        ...updatedSessions.filter((s) => s.id !== activeSessionId),
      ];
      setSessions(updatedSessions);
    }

    // Persist user query instantly in states
    localStorage.setItem('ai_assistant_sessions', JSON.stringify(updatedSessions));

    try {
      // Make network call to backend chat Completion with the full session history
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: currentSession.messages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server responded with an error.');
      }

      const assistantMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: data.content || 'I encountered an empty response. Please try reframing your prompt.',
        timestamp: data.timestamp || Date.now(),
      };

      // Append answer to target session
      const finalSessions = updatedSessions.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, assistantMessage],
          };
        }
        return s;
      });

      saveSessions(finalSessions);
    } catch (error: any) {
      console.error('Error in handleSendMessage:', error);
      
      const errorMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: `❌ **Failed to generate response:** ${error.message || 'Connecting to backend timed out. Verify your internet link and try again.'}`,
        timestamp: Date.now(),
      };

      const finalSessions = updatedSessions.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, errorMessage],
          };
        }
        return s;
      });

      saveSessions(finalSessions);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Sidebar visibility helper
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 font-sans antialiased" id="app-root-layout">
      {/* Sidebar Panel */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Primary Chat Box */}
      <MainChat
        messages={currentSession ? currentSession.messages : []}
        onSendMessage={handleSendMessage}
        onClearChat={handleClearCurrentChat}
        isLoading={isLoading}
        onToggleSidebar={handleToggleSidebar}
      />
    </div>
  );
}
