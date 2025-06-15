import React, { createContext, useContext, useState, useCallback } from 'react';

export type ClubModalType = 
  | 'UPDATE_COVER'
  | 'UPDATE_LOGO'
  | 'MANAGE_ADMINS'
  | 'MANAGE_MEMBERS'
  | 'HANDLE_JOIN_REQUESTS';

interface ClubModalContextType {
  modalType: ClubModalType | null;
  modalProps: any;
  openModal: (type: ClubModalType, props: any) => void;
  closeModal: () => void;
}

const ClubModalContext = createContext<ClubModalContextType | undefined>(undefined);

export function ClubModalProvider({ children }: { children: React.ReactNode }) {
  const [modalType, setModalType] = useState<ClubModalType | null>(null);
  const [modalProps, setModalProps] = useState<any>(null);

  const openModal = useCallback((type: ClubModalType, props: any) => {
    setModalType(type);
    setModalProps(props);
  }, []);

  const closeModal = useCallback(() => {
    setModalType(null);
    setModalProps(null);
  }, []);

  return (
    <ClubModalContext.Provider value={{ modalType, modalProps, openModal, closeModal }}>
      {children}
    </ClubModalContext.Provider>
  );
}

export function useClubModal() {
  const context = useContext(ClubModalContext);
  if (!context) {
    throw new Error('useClubModal must be used within ClubModalProvider');
  }
  return context;
} 