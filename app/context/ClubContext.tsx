import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Club, ClubType } from '../../shared/types/club';
import { ClubApi } from '../../shared/api/club';

interface ClubContextType {
  clubs: Club[];
  loading: boolean;
  error: string | null;
  getClubs: () => Promise<void>;
  getClub: (id: string) => Promise<Club | null>;
  createClub: (club: Omit<Club, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateClub: (id: string, club: Partial<Club>) => Promise<void>;
  deleteClub: (id: string) => Promise<void>;
  joinClub: (id: string, message?: string) => Promise<void>;
  leaveClub: (id: string) => Promise<void>;
  handleJoinRequest: (clubId: string, userId: string, status: 'approved' | 'rejected', response?: string) => Promise<void>;
  searchClubs: (query: string) => Promise<void>;
  filterClubsByType: (type: ClubType) => Promise<void>;
  filterClubsByLocation: (location: { city?: string; province?: string; country?: string }) => Promise<void>;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export function useClubs() {
  const context = useContext(ClubContext);
  if (context === undefined) {
    throw new Error('useClubs must be used within a ClubProvider');
  }
  return context;
}

export function ClubProvider({ children }: { children: ReactNode }) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getClubs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ClubApi.getClubs();
      if (response.success && response.data) {
        setClubs(response.data);
      } else {
        setError(response.error || 'Failed to fetch clubs');
      }
    } catch (err) {
      setError('Failed to fetch clubs');
    } finally {
      setLoading(false);
    }
  }, []);

  const getClub = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement API call to fetch single club
      return null;
    } catch (err) {
      setError('Failed to fetch club');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createClub = useCallback(async (club: Omit<Club, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ClubApi.createClub({
        name: club.name,
        description: club.description,
        contactEmail: '', // TODO: Add contact email to the form
      });
      if (response.success && response.data) {
        setClubs(prev => [...prev, response.data!]);
      } else {
        setError(response.error || 'Failed to create club');
      }
    } catch (err) {
      setError('Failed to create club');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateClub = useCallback(async (id: string, club: Partial<Club>) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement API call to update club
    } catch (err) {
      setError('Failed to update club');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteClub = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement API call to delete club
      setClubs(prev => prev.filter(club => club._id !== id));
    } catch (err) {
      setError('Failed to delete club');
    } finally {
      setLoading(false);
    }
  }, []);

  const joinClub = useCallback(async (id: string, message?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ClubApi.joinClub(id);
      if (response.success && response.data) {
        setClubs(prev => prev.map(club => 
          club._id === id ? response.data! : club
        ));
      } else {
        setError(response.error || 'Failed to join club');
      }
    } catch (err) {
      setError('Failed to join club');
    } finally {
      setLoading(false);
    }
  }, []);

  const leaveClub = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement API call to leave club
    } catch (err) {
      setError('Failed to leave club');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleJoinRequest = useCallback(async (
    clubId: string,
    userId: string,
    status: 'approved' | 'rejected',
    response?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement API call to handle join request
    } catch (err) {
      setError('Failed to handle join request');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchClubs = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement API call to search clubs
    } catch (err) {
      setError('Failed to search clubs');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterClubsByType = useCallback(async (type: ClubType) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement API call to filter clubs by type
    } catch (err) {
      setError('Failed to filter clubs');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterClubsByLocation = useCallback(async (location: { city?: string; province?: string; country?: string }) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement API call to filter clubs by location
    } catch (err) {
      setError('Failed to filter clubs');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ClubContext.Provider
      value={{
        clubs,
        loading,
        error,
        getClubs,
        getClub,
        createClub,
        updateClub,
        deleteClub,
        joinClub,
        leaveClub,
        handleJoinRequest,
        searchClubs,
        filterClubsByType,
        filterClubsByLocation,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
} 