import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import type { Club } from '../../shared/types/club';
import { ImageService } from '../services/imageService';

interface MiniClubCardProps {
  club: Club;
  onPress: () => void;
  width?: number;
  height?: number;
  margin?: number;
}

export const MiniClubCard: React.FC<MiniClubCardProps> = ({ club, onPress, width, height, margin }) => {
  const getFounderName = () => {
    if (!club.founder) return '';
    if (typeof club.founder === 'string') return club.founder;
    if ('_id' in club.founder && 'name_sid' in club.founder) return club.founder.name_sid;
    return '';
  };

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          width: width || styles.card.width, 
          height: height || styles.card.height, 
          margin: margin || styles.card.margin 
        }
      ]} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
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
    // 默认值，可以通过props覆盖
    width: Dimensions.get('window').width - 20,
    height: 200,
    margin: 10,
  },
  surface: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    backgroundColor: '#eee',
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
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