import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Ride } from '../../shared/types/ride';

interface RideContextType {
  rides: Ride[];
  savedRides: string[];
  participatedRides: string[];
  loading: boolean;
  error: string | null;
  getRides: () => Promise<void>;
  getRide: (id: string) => Promise<Ride | null>;
  createRide: (ride: Omit<Ride, '_id'>) => Promise<void>;
  updateRide: (id: string, ride: Partial<Ride>) => Promise<void>;
  deleteRide: (id: string) => Promise<void>;
  joinRide: (id: string) => Promise<void>;
  leaveRide: (id: string) => Promise<void>;
  addSavedRide: (rideId: string) => void;
  removeSavedRide: (rideId: string) => void;
  isRideSaved: (rideId: string) => boolean;
  getSavedRides: () => Ride[];
  addParticipatedRide: (rideId: string) => void;
  removeParticipatedRide: (rideId: string) => void;
  isRideParticipated: (rideId: string) => boolean;
  getParticipatedRides: () => Ride[];
  toggleSaveRide: (rideId: string) => void;
  isSaved: (rideId: string) => boolean;
  addRide: (ride: Ride) => void;
  removeRide: (rideId: string) => void;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export function RideProvider({ children }: { children: ReactNode }) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [savedRides, setSavedRides] = useState<string[]>([]);
  const [participatedRides, setParticipatedRides] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRides = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Implement API call
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch rides');
      setLoading(false);
    }
  }, []);

  const getRide = useCallback(async (id: string) => {
    try {
      setLoading(true);
      // TODO: Implement API call
      setLoading(false);
      return null;
    } catch (err) {
      setError('Failed to fetch ride');
      setLoading(false);
      return null;
    }
  }, []);

  const createRide = useCallback(async (ride: Omit<Ride, '_id'>) => {
    try {
      setLoading(true);
      // TODO: Implement API call
      setLoading(false);
    } catch (err) {
      setError('Failed to create ride');
      setLoading(false);
    }
  }, []);

  const updateRide = useCallback(async (id: string, ride: Partial<Ride>) => {
    try {
      setLoading(true);
      // TODO: Implement API call
      setLoading(false);
    } catch (err) {
      setError('Failed to update ride');
      setLoading(false);
    }
  }, []);

  const deleteRide = useCallback(async (id: string) => {
    try {
      setLoading(true);
      // TODO: Implement API call
      setLoading(false);
    } catch (err) {
      setError('Failed to delete ride');
      setLoading(false);
    }
  }, []);

  const joinRide = useCallback(async (id: string) => {
    try {
      setLoading(true);
      // TODO: Implement API call
      setLoading(false);
    } catch (err) {
      setError('Failed to join ride');
      setLoading(false);
    }
  }, []);

  const leaveRide = useCallback(async (id: string) => {
    try {
      setLoading(true);
      // TODO: Implement API call
      setLoading(false);
    } catch (err) {
      setError('Failed to leave ride');
      setLoading(false);
    }
  }, []);

  const addSavedRide = useCallback((rideId: string) => {
    setSavedRides(prev => [...prev, rideId]);
  }, []);

  const removeSavedRide = useCallback((rideId: string) => {
    setSavedRides(prev => prev.filter(id => id !== rideId));
  }, []);

  const isRideSaved = useCallback((rideId: string) => {
    return savedRides.includes(rideId);
  }, [savedRides]);

  const getSavedRides = useCallback(() => {
    return rides.filter(ride => savedRides.includes(ride._id));
  }, [rides, savedRides]);

  const addParticipatedRide = useCallback((rideId: string) => {
    setParticipatedRides(prev => [...prev, rideId]);
  }, []);

  const removeParticipatedRide = useCallback((rideId: string) => {
    setParticipatedRides(prev => prev.filter(id => id !== rideId));
  }, []);

  const isRideParticipated = useCallback((rideId: string) => {
    return participatedRides.includes(rideId);
  }, [participatedRides]);

  const getParticipatedRides = useCallback(() => {
    return rides.filter(ride => participatedRides.includes(ride._id));
  }, [rides, participatedRides]);

  const toggleSaveRide = useCallback((rideId: string) => {
    setSavedRides(prev => 
      prev.includes(rideId) 
        ? prev.filter(id => id !== rideId)
        : [...prev, rideId]
    );
  }, []);

  const isSaved = useCallback((rideId: string) => {
    return savedRides.includes(rideId);
  }, [savedRides]);

  const addRide = useCallback((ride: Ride) => {
    setRides(prev => [...prev, ride]);
  }, []);

  const removeRide = useCallback((rideId: string) => {
    setRides(prev => prev.filter(ride => ride._id !== rideId));
  }, []);

  return (
    <RideContext.Provider
      value={{
        rides,
        savedRides,
        participatedRides,
        loading,
        error,
        getRides,
        getRide,
        createRide,
        updateRide,
        deleteRide,
        joinRide,
        leaveRide,
        addSavedRide,
        removeSavedRide,
        isRideSaved,
        getSavedRides,
        addParticipatedRide,
        removeParticipatedRide,
        isRideParticipated,
        getParticipatedRides,
        toggleSaveRide,
        isSaved,
        addRide,
        removeRide
      }}
    >
      {children}
    </RideContext.Provider>
  );
}

export function useRides() {
  const context = useContext(RideContext);
  if (context === undefined) {
    throw new Error('useRides must be used within a RideProvider');
  }
  return context;
} 