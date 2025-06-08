import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import type { Club } from '../../shared/types/club';

interface MiniClubCardProps {
  club: Club;
  onPress: () => void;
}

export const MiniClubCard: React.FC<MiniClubCardProps> = ({ club, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Surface style={styles.surface} elevation={2}>
        {club.logo ? (
          <Image source={{ uri: club.logo }} style={styles.logo} resizeMode="cover" />
        ) : (
          <View style={styles.logoPlaceholder} />
        )}
        <Text style={styles.name} numberOfLines={1}>{club.name}</Text>
        <Text style={styles.founder} numberOfLines={1}>
          @{club.founder && ('name_sid' in club.founder) ? (club.founder as any).name_sid : club.founder?.name || ''}
        </Text>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    minWidth: 140,
    maxWidth: 180,
    height: 180,
  },
  surface: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  founder: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
}); 