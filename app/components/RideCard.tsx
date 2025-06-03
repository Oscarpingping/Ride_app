import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, Avatar, Button, Chip, IconButton } from 'react-native-paper';
import { format } from 'date-fns';
import { Ride } from '../../shared/types/ride';
import { useRides } from '../context/RideContext';

interface RideCardProps {
  ride: Ride;
  onPress?: () => void;
}

export const RideCard: React.FC<RideCardProps> = ({ ride, onPress }) => {
  const { toggleSaveRide, isSaved } = useRides();

  return (
    <Surface style={styles.container} elevation={2}>
      <View style={styles.header}>
        <View style={styles.organizer}>
          <Avatar.Image 
            size={40} 
            source={{ uri: ride.creator.avatar || 'https://via.placeholder.com/40' }} 
          />
          <View style={styles.organizerInfo}>
            <Text variant="titleMedium">{ride.creator.name}</Text>
            <Text variant="bodySmall">{format(new Date(ride.startTime), 'MMM d, yyyy h:mm a')}</Text>
          </View>
        </View>
        <IconButton
          icon={isSaved(ride._id) ? 'bookmark' : 'bookmark-outline'}
          onPress={() => toggleSaveRide(ride._id)}
        />
      </View>

      <View style={styles.content}>
        <Text variant="titleLarge" style={styles.title}>{ride.title}</Text>
        <Text variant="bodyMedium" style={styles.description}>{ride.description}</Text>
        
        <View style={styles.details}>
          <Chip icon="map-marker">{ride.meetingPoint.address}</Chip>
          <Chip icon="road">{ride.route.distance}km</Chip>
          <Chip icon="trending-up">{ride.route.elevationGain}m</Chip>
        </View>

        <View style={styles.tags}>
          <Chip>{ride.terrain}</Chip>
          <Chip>{ride.pace}</Chip>
          <Chip>{ride.difficulty}</Chip>
        </View>
      </View>

      <View style={styles.footer}>
        <Text variant="bodySmall">
          {ride.currentParticipants}/{ride.maxParticipants} participants
        </Text>
        <Button mode="contained" onPress={onPress}>
          View Details
        </Button>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 8,
    padding: 16,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  organizer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerInfo: {
    marginLeft: 12,
  },
  content: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}); 