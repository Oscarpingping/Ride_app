import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import type { Club } from '../../shared/types/club';
import { ImageService } from '../services/imageService';

interface MiniClubCardProps {
  club: Club;
  onPress: () => void;
}

export const MiniClubCard: React.FC<MiniClubCardProps> = ({ club, onPress }) => {
  const getFounderName = () => {
    if (!club.founder) return '';
    if (typeof club.founder === 'string') return club.founder;
    if ('_id' in club.founder && 'name_sid' in club.founder) return club.founder.name_sid;
    return '';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Surface style={styles.surface} elevation={2}>
        {club.logo ? (
          <Image source={{ uri: ImageService.getImageUrl(club.logo) }} style={styles.logo} resizeMode="cover" />
        ) : (
          <View style={styles.logoPlaceholder} />
        )}
        <Text style={styles.name} numberOfLines={1}>{club.name}</Text>
        <Text style={styles.founder} numberOfLines={1}>
          {getFounderName()}
        </Text>
        {club.location && (
          <Text style={styles.location} numberOfLines={1}>
            {club.location.city}, {club.location.country}
          </Text>
        )}
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: (Dimensions.get('window').width - 8 * 3) / 2,
    height: 180,
    margin: 8,
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
  location: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
}); 