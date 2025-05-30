import { View, StyleSheet } from 'react-native';
import { Surface, Text, Avatar, Button, Chip, IconButton } from 'react-native-paper';
import { format } from 'date-fns';
import { Ride } from '../../types/ride';
import { useRides } from '../context/RideContext';

interface RideCardProps {
  ride: Ride;
  onPress?: () => void;
}

export function RideCard({ ride, onPress }: RideCardProps) {
  const { toggleSaveRide, isSaved } = useRides();
  
  return (
    <Surface style={styles.rideCard} elevation={2}>
      <View style={styles.rideHeader}>
        <View style={styles.rideHeaderText}>
          <Text variant="titleMedium" style={styles.rideTitle}>{ride.title}</Text>
          <Text variant="bodyMedium" style={styles.rideDate}>
            {format(new Date(ride.startTime), 'EEE, MMM d • h:mm a')}
          </Text>
        </View>
        <IconButton 
          icon={isSaved(ride.id) ? "bookmark" : "bookmark-outline"} 
          onPress={() => toggleSaveRide(ride.id)} 
        />
      </View>

      <Text variant="bodyMedium" style={styles.rideDescription}>
        {ride.description}
      </Text>

      <View style={styles.chipContainer}>
        <Chip icon="terrain" style={styles.chip}>{ride.terrain}</Chip>
        <Chip icon="speedometer" style={styles.chip}>{ride.pace}</Chip>
        <Chip icon="map-marker-distance" style={styles.chip}>{ride.route.distance}km</Chip>
        <Chip icon="arrow-up-bold" style={styles.chip}>{ride.route.elevationGain}m</Chip>
      </View>

      <View style={styles.rideFooter}>
        <View style={styles.organizer}>
          <Avatar.Text size={36} label={ride.organizer.name.split(' ').map(n => n[0]).join('')} />
          <View style={styles.organizerInfo}>
            <Text variant="bodyMedium">Organized by {ride.organizer.name}</Text>
            <Text variant="bodySmall" style={styles.rating}>{ride.organizer.rating} ★</Text>
          </View>
        </View>
        <Button 
          mode="contained"
          onPress={onPress}
        >
          View Details
        </Button>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  rideCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rideHeaderText: {
    flex: 1,
    marginRight: 8,
  },
  rideTitle: {
    fontWeight: '600',
  },
  rideDate: {
    color: '#666',
    marginTop: 4,
  },
  rideDescription: {
    marginTop: 8,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  organizer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerInfo: {
    marginLeft: 12,
  },
  rating: {
    color: '#F4B400',
    marginTop: 2,
  },
}); 