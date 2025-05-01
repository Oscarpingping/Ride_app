import React, { createContext, useContext, useState, useCallback } from 'react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  type: 'CHAT' | 'JOIN_REQUEST' | 'JOIN_APPROVED';
  rideId?: string;
}

interface MessageContextType {
  messages: Message[];
  sendMessage: (message: Message) => void;
  getMessagesForUser: (userId: string) => Message[];
  getMessagesForRide: (rideId: string) => Message[];
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = useCallback((message: Message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  }, []);

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
        messages,
        sendMessage,
        getMessagesForUser,
        getMessagesForRide,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
}; 