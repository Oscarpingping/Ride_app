import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
}

export interface ChatThread {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

interface MessageContextType {
  messages: Message[];
  threads: ChatThread[];
  selectedThread: ChatThread | null;
  sendMessage: (content: string, threadId: string) => void;
  selectThread: (thread: ChatThread) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);

  const sendMessage = useCallback((content: string, threadId: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'currentUser', // Replace with actual user ID
      receiverId: 'recipient', // Replace with actual recipient ID
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setThreads(prev => 
      prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, lastMessage: newMessage, unreadCount: thread.unreadCount + 1 }
          : thread
      )
    );
  }, []);

  const selectThread = useCallback((thread: ChatThread) => {
    setSelectedThread(thread);
  }, []);

  return (
    <MessageContext.Provider 
      value={{ 
        messages, 
        threads, 
        selectedThread, 
        sendMessage, 
        selectThread 
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
} 