import React, { createContext, useContext, useState, useCallback } from 'react';
import { sampleRides } from '../data/sampleRides';
import { Ride } from '../../types/ride';

interface RideContextType {
  rides: Ride[];
  savedRides: string[];
  participatedRides: string[];
  getParticipatedRides: () => Ride[];
  toggleSaveRide: (rideId: string) => void;
  isSaved: (rideId: string) => boolean;
  addRide: (ride: Ride) => void;
  updateRide: (ride: Ride) => void;
  deleteRide: (rideId: string) => void;
  getRide: (rideId: string) => Ride | undefined;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export const RideProvider = ({ children }: { children: React.ReactNode }) => {
  const [rides, setRides] = useState<Ride[]>(sampleRides);
  const [savedRides, setSavedRides] = useState<string[]>([]);
  const [participatedRides, setParticipatedRides] = useState<string[]>([]);

  const getParticipatedRides = useCallback(() => {
    return rides.filter(ride => participatedRides.includes(ride.id));
  }, [rides, participatedRides]);

  const toggleSaveRide = useCallback((rideId: string) => {
    setSavedRides(prev => {
      if (prev.includes(rideId)) {
        return prev.filter(id => id !== rideId);
      } else {
        return [...prev, rideId];
      }
    });
  }, []);

  const isSaved = useCallback((rideId: string) => {
    return savedRides.includes(rideId);
  }, [savedRides]);

  const addRide = useCallback((ride: Ride) => {
    setRides(prev => [...prev, ride]);
  }, []);

  const updateRide = useCallback((updatedRide: Ride) => {
    setRides(prev => prev.map(ride => 
      ride.id === updatedRide.id ? updatedRide : ride
    ));
  }, []);

  const deleteRide = useCallback((rideId: string) => {
    setRides(prev => prev.filter(ride => ride.id !== rideId));
  }, []);

  const getRide = useCallback((rideId: string) => {
    return rides.find(ride => ride.id === rideId);
  }, [rides]);

  return (
    <RideContext.Provider
      value={{
        rides,
        savedRides,
        participatedRides,
        getParticipatedRides,
        toggleSaveRide,
        isSaved,
        addRide,
        updateRide,
        deleteRide,
        getRide,
      }}
    >
      {children}
    </RideContext.Provider>
  );
};

export const useRides = () => {
  const context = useContext(RideContext);
  if (context === undefined) {
    throw new Error('useRides must be used within a RideProvider');
  }
  return context;
}; 