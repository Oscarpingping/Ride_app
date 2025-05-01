import React, { createContext, useContext, useState, useCallback } from 'react';
import { Ride } from '../types/ride';
import { sampleRides } from '../app/data/sampleRides';

interface RideContextType {
  rides: Ride[];
  savedRides: string[]; // Array of ride IDs
  participatedRides: string[]; // Array of ride IDs
  addRide: (ride: Ride) => void;
  updateRide: (ride: Ride) => void;
  deleteRide: (rideId: string) => void;
  getRide: (rideId: string) => Ride | undefined;
  toggleSaveRide: (rideId: string) => void;
  isSaved: (rideId: string) => boolean;
  getSavedRides: () => Ride[];
  getParticipatedRides: () => Ride[];
  addParticipatedRide: (rideId: string) => void;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export function RideProvider({ children }: { children: React.ReactNode }) {
  const [rides, setRides] = useState<Ride[]>(sampleRides);
  const [savedRides, setSavedRides] = useState<string[]>([]);
  const [participatedRides, setParticipatedRides] = useState<string[]>([]);

  const addRide = useCallback((ride: Ride) => {
    setRides((currentRides) => [ride, ...currentRides]);
  }, []);

  const updateRide = useCallback((updatedRide: Ride) => {
    setRides((currentRides) =>
      currentRides.map((ride) =>
        ride.id === updatedRide.id ? updatedRide : ride
      )
    );
  }, []);

  const deleteRide = useCallback((rideId: string) => {
    setRides((currentRides) =>
      currentRides.filter((ride) => ride.id !== rideId)
    );
    // Also remove from saved rides if it was saved
    setSavedRides((current) => current.filter(id => id !== rideId));
  }, []);

  const getRide = useCallback(
    (rideId: string) => rides.find((ride) => ride.id === rideId),
    [rides]
  );

  const toggleSaveRide = useCallback((rideId: string) => {
    setSavedRides((current) => {
      if (current.includes(rideId)) {
        return current.filter(id => id !== rideId);
      } else {
        return [...current, rideId];
      }
    });
  }, []);

  const isSaved = useCallback((rideId: string) => {
    return savedRides.includes(rideId);
  }, [savedRides]);

  const getSavedRides = useCallback(() => {
    return rides.filter(ride => savedRides.includes(ride.id));
  }, [rides, savedRides]);

  const getParticipatedRides = useCallback(() => {
    return rides.filter(ride => participatedRides.includes(ride.id));
  }, [rides, participatedRides]);

  const addParticipatedRide = useCallback((rideId: string) => {
    setParticipatedRides((current) => {
      if (!current.includes(rideId)) {
        return [...current, rideId];
      }
      return current;
    });
  }, []);

  return (
    <RideContext.Provider
      value={{
        rides,
        savedRides,
        participatedRides,
        addRide,
        updateRide,
        deleteRide,
        getRide,
        toggleSaveRide,
        isSaved,
        getSavedRides,
        getParticipatedRides,
        addParticipatedRide,
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