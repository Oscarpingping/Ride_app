import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  type: 'CHAT' | 'JOIN_REQUEST' | 'JOIN_APPROVED';
  rideId?: string;
}

export interface ChatThread {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

interface MessageContextType {
  threads: ChatThread[];
  messages: Message[];
  selectedThread: ChatThread | null;
  loading: boolean;
  error: string | null;
  selectThread: (thread: ChatThread) => void;
  sendMessage: (message: Message) => void;
  getMessages: () => Promise<void>;
  getThreadMessages: (threadId: string) => Message[];
  getMessagesForUser: (userId: string) => Message[];
  getMessagesForRide: (rideId: string) => Message[];
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectThread = useCallback((thread: ChatThread) => {
    setSelectedThread(thread);
  }, []);

  const getMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to fetch messages from backend
      // For now, just simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      // setMessages(fetchedMessages);
      // setThreads(fetchedThreads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
    
    // Update or create thread
    const threadId = `${message.senderId}-${message.receiverId}`;
    setThreads(prev => {
      const existingThread = prev.find(t => t.id === threadId);
      if (existingThread) {
        return prev.map(thread => 
          thread.id === threadId 
            ? { ...thread, lastMessage: message, unreadCount: thread.unreadCount + 1 }
            : thread
        );
      } else {
        // Create new thread
        const newThread: ChatThread = {
          id: threadId,
          participants: [message.senderId, message.receiverId],
          lastMessage: message,
          unreadCount: 1,
        };
        return [...prev, newThread];
      }
    });
  }, []);

  const getThreadMessages = useCallback((threadId: string) => {
    return messages.filter(message => {
      const thread = threads.find(t => t.id === threadId);
      if (!thread) return false;
      return thread.participants.includes(message.senderId) && 
             thread.participants.includes(message.receiverId);
    });
  }, [messages, threads]);

  const getMessagesForUser = useCallback((userId: string) => {
    return messages.filter(
      message => message.senderId === userId || message.receiverId === userId
    );
  }, [messages]);

  const getMessagesForRide = useCallback((rideId: string) => {
    return messages.filter(message => message.rideId === rideId);
  }, [messages]);

  return (
    <MessageContext.Provider 
      value={{
        threads,
        messages,
        selectedThread,
        loading,
        error,
        selectThread,
        sendMessage,
        getMessages,
        getThreadMessages,
        getMessagesForUser,
        getMessagesForRide,
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