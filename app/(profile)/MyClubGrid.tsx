import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import type { Club } from '../../shared/types/club';
import { MiniClubCard } from '../components/MiniClubCard';
import { ClubModals } from '../components/club/ClubModals';
import { useClubModal } from '../context/ClubModalContext';

const CARD_MARGIN = 8;
const CARD_WIDTH = (Dimensions.get('window').width - CARD_MARGIN * 3) / 2;
const CARD_HEIGHT = 180;

interface MyClubGridProps {
  clubs: Club[];
  onCreateClub: () => void;
  onClubUpdate?: (updatedClub: Club) => void;
  canCreateClub?: boolean;
}

export function MyClubGrid({ clubs, onCreateClub, onClubUpdate, canCreateClub = false }: MyClubGridProps) {
  const router = useRouter();
  const { modalType, modalProps, openModal, closeModal } = useClubModal();

  const handleClubPress = (club: Club) => {
    router.push(`/club/${club._id}`);
  };

  const handleClubUpdate = (updatedClub: Club) => {
    if (onClubUpdate) {
      onClubUpdate(updatedClub);
    }
  };

  const handleCreateClub = () => {
    onCreateClub();
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {clubs.map(club => (
          <MiniClubCard
            key={club._id}
            club={club}
            onPress={() => handleClubPress(club)}
          />
        ))}
        {canCreateClub && (
          <TouchableOpacity
            style={styles.addCard}
            onPress={handleCreateClub}
            activeOpacity={0.8}
            accessible={true}
            accessibilityLabel="Create Club Button"
            accessibilityRole="button"
          >
            <Text style={styles.plus}>+</Text>
            <Text style={styles.addText}>Create Club</Text>
          </TouchableOpacity>
        )}
      </View>
      {modalType && modalProps?.club && (
        <ClubModals
          visible={!!modalType}
          type={modalType}
          club={modalProps.club}
          onDismiss={closeModal}
          onUpdate={handleClubUpdate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: CARD_MARGIN,
  },
  addCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    margin: CARD_MARGIN,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  plus: {
    fontSize: 40,
    color: '#ff6600',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addText: {
    fontSize: 15,
    color: '#666',
  },
}); 