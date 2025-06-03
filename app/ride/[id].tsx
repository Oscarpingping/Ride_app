console.log('app/ride/[id].tsx loaded');
import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { Text, Appbar, Surface, Button, Avatar, Chip, IconButton, Portal, Modal, TextInput } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MapView, Marker } from '../../components/MapView';
import { format } from 'date-fns';
import { PaceLevelRanges, PaceLevel, Ride } from '../../shared/types/ride';
import { useMessages } from '../context/MessageContext';
import { useRides } from '../context/RideContext';

export default function RideDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getRide } = useRides();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [message, setMessage] = useState('');
  const { sendMessage } = useMessages();

  useEffect(() => {
    const loadRide = async () => {
      if (id) {
        const rideData = await getRide(id as string);
        setRide(rideData);
        setLoading(false);
      }
    };
    loadRide();
  }, [id, getRide]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.container}>
        <Text>Ride not found</Text>
      </View>
    );
  }

  const handleJoinRequest = () => {
    if (ride?.creator) {
      sendMessage({
        id: Date.now().toString(),
        senderId: 'currentUser', // TODO: Replace with actual user ID
        receiverId: ride.creator._id,
        content: `Request to join ride: ${ride.title}\n\nMessage: ${message}`,
        timestamp: new Date(),
        type: 'JOIN_REQUEST',
        rideId: ride._id,
      });
      setShowJoinModal(false);
    }
  };

  const handleJoinRequestApproval = () => {
    if (ride?.creator) {
      const rideDetailsMessage = `Your request to join "${ride.title}" has been approved! 🎉\n\n` +
        `Here are the details:\n` +
        `📅 Date: ${format(new Date(ride.date), 'EEEE, MMMM d, yyyy')}\n` +
        `⏰ Time: ${format(new Date(ride.startTime), 'h:mm a')}\n` +
        `📍 Meeting Point: ${ride.meetingPoint.address}\n` +
        `🚴‍♂️ Distance: ${ride.route.distance}km\n` +
        `📈 Elevation: ${ride.route.elevationGain}m\n` +
        `🏃‍♂️ Pace: ${ride.pace}\n` +
        `🏔️ Terrain: ${ride.terrain}\n` +
        `💪 Difficulty: ${ride.difficulty}\n\n` +
        `See you there! 🚴‍♂️`;

      sendMessage({
        id: Date.now().toString(),
        senderId: ride.creator._id,
        receiverId: 'currentUser', // TODO: Replace with actual user ID
        content: rideDetailsMessage,
        timestamp: new Date(),
        type: 'JOIN_APPROVED',
        rideId: ride._id,
      });
    }
  };

  const handleMessageOrganizer = () => {
    if (ride?.creator) {
      sendMessage({
        id: Date.now().toString(),
        senderId: 'currentUser', // Replace with actual user ID
        receiverId: ride.creator._id,
        content: message,
        timestamp: new Date(),
        type: 'CHAT',
        rideId: ride._id,
      });
      router.push('/messages');
    }
  };

  const paceRange = PaceLevelRanges[ride.pace as PaceLevel];
  const paceInMph = {
    min: Math.round(paceRange.minSpeed * 0.621371),
    max: Math.round(paceRange.maxSpeed * 0.621371)
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Activity Details" />
        <Appbar.Action icon="share" onPress={() => {}} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Image
          source={{ uri: 'https://example.com/ride-image.jpg' }}
          style={styles.coverImage}
        />

        <Surface style={styles.mainCard}>
          <Text variant="headlineMedium">{ride.title}</Text>
          
          <View style={styles.organizerRow}>
            <View style={styles.organizer}>
              <Avatar.Image
                size={40}
                source={{ uri: 'https://example.com/avatar.jpg' }}
              />
              <View style={styles.organizerInfo}>
                <Text variant="bodyLarge">{ride.creator.name}</Text>
                <View style={styles.rating}>
                  <Text variant="bodyMedium">{ride.creator.rating}</Text>
                  <IconButton icon="star" size={16} />
                </View>
              </View>
            </View>
            <IconButton
              icon="heart-outline"
              size={24}
              onPress={() => {}}
            />
          </View>

          <View style={styles.participantsRow}>
            <Avatar.Image
              size={32}
              source={{ uri: 'https://example.com/participant1.jpg' }}
              style={styles.participant}
            />
            <Avatar.Image
              size={32}
              source={{ uri: 'https://example.com/participant2.jpg' }}
              style={styles.participant}
            />
            <View style={[styles.participant, styles.participantCount]}>
              <Text variant="bodySmall">+3</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text variant="titleMedium">{ride.route.distance}km</Text>
              <Text variant="bodySmall">Distance</Text>
            </View>
            <View style={styles.stat}>
              <Text variant="titleMedium">{ride.route.elevationGain}m</Text>
              <Text variant="bodySmall">Elevation</Text>
            </View>
            <View style={styles.stat}>
              <Text variant="titleMedium">{paceRange.minSpeed}-{paceRange.maxSpeed} km/h</Text>
              <Text variant="bodySmall">({paceInMph.min}-{paceInMph.max} mph)</Text>
              <Text variant="bodySmall">{ride.pace}</Text>
            </View>
          </View>

          <View style={styles.details}>
            <Text variant="titleMedium">Additional Details</Text>
            <Text variant="bodyMedium" style={styles.description}>
              {ride.description}
            </Text>

            <View style={styles.chips}>
              <Chip icon="terrain" style={styles.chip}>{ride.terrain}</Chip>
              <Chip icon="run-fast" style={styles.chip}>{ride.difficulty}</Chip>
              <Chip icon="account-group" style={styles.chip}>{ride.genderPreference}</Chip>
            </View>

            <Text variant="titleMedium" style={styles.sectionTitle}>Meeting Point</Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: ride.meetingPoint.latitude,
                longitude: ride.meetingPoint.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
            >
              <Marker
                coordinate={ride.meetingPoint}
                title="Meeting Point"
              />
            </MapView>

            <Text variant="titleMedium" style={styles.sectionTitle}>Date & Time</Text>
            <Text variant="bodyMedium">
              {format(new Date(ride.date), 'EEEE, MMMM d, yyyy')}
            </Text>
            <Text variant="bodyMedium">
              {format(new Date(ride.startTime), 'h:mm a')}
            </Text>
          </View>
        </Surface>
      </ScrollView>

      <Surface style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => setShowJoinModal(true)}
          style={styles.joinButton}
        >
          Request to Join
        </Button>
        <IconButton
          icon="chat"
          size={24}
          onPress={handleMessageOrganizer}
          style={styles.chatButton}
        />
      </Surface>

      <Portal>
        <Modal
          visible={showJoinModal}
          onDismiss={() => setShowJoinModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>Join Request</Text>
          <TextInput
            label="Message to Organizer (Optional)"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            style={styles.messageInput}
          />
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => handleMessageOrganizer()}
              style={styles.modalButton}
            >
              Message Organizer
            </Button>
            <Button
              mode="contained"
              onPress={handleJoinRequest}
              style={styles.modalButton}
            >
              Send Request
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
  },
  mainCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  organizerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  organizer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerInfo: {
    marginLeft: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  participant: {
    marginRight: -8,
  },
  participantCount: {
    width: 32,
    height: 32,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  stat: {
    alignItems: 'center',
  },
  details: {
    marginTop: 24,
  },
  description: {
    marginTop: 8,
    lineHeight: 20,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  chip: {
    margin: 4,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
  },
  map: {
    height: 200,
    marginTop: 8,
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  joinButton: {
    flex: 1,
    marginRight: 12,
  },
  chatButton: {
    backgroundColor: '#e0e0e0',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    marginBottom: 16,
  },
  messageInput: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    minWidth: 120,
  },
}); 