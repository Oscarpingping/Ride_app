import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Appbar, Surface, Avatar, SegmentedButtons, Chip, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useRides } from '../context/RideContext';
import { RideCard } from './components/RideCard';
import type { TerrainType, PaceLevel, DifficultyLevel, GenderPreference } from '../types/ride';
import profilePicJohn from '../assets/images/profile_pic_john.png';

export default function ProfileScreen() {
  const router = useRouter();
  const { getParticipatedRides } = useRides();
  const [selectedTab, setSelectedTab] = useState('activities');
  const [activitiesTab, setActivitiesTab] = useState('upcoming');

  // Mock participated rides with both past and upcoming rides
  const participatedRides = [
    {
      id: 'past1',
      title: 'Golden Gate Loop',
      description: 'A scenic loop around the Golden Gate area.',
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
      route: { distance: 30, elevationGain: 400, gpxFile: null },
      meetingPoint: { latitude: 37.8199, longitude: -122.4783, address: 'Golden Gate Bridge, SF' },
      maxParticipants: 10,
      currentParticipants: 8,
      terrain: 'Road' as TerrainType,
      pace: 'Moderate' as PaceLevel,
      difficulty: 'Intermediate' as DifficultyLevel,
      genderPreference: 'All' as GenderPreference,
      organizer: { id: 'user2', name: 'Mike Johnson', rating: 4.9 },
      participants: [],
    },
    {
      id: 'past2',
      title: 'Sunset Beach Ride',
      description: 'Evening ride to the beach for sunset views.',
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      route: { distance: 20, elevationGain: 150, gpxFile: null },
      meetingPoint: { latitude: 37.7599, longitude: -122.5102, address: 'Ocean Beach, SF' },
      maxParticipants: 12,
      currentParticipants: 10,
      terrain: 'Urban' as TerrainType,
      pace: 'Casual' as PaceLevel,
      difficulty: 'Beginner' as DifficultyLevel,
      genderPreference: 'All' as GenderPreference,
      organizer: { id: 'user3', name: 'Emily Chen', rating: 4.7 },
      participants: [],
    },
    // Example upcoming ride
    {
      id: 'upcoming1',
      title: 'Spring Valley Adventure',
      description: 'Explore the beautiful spring valley trails.',
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
      route: { distance: 25, elevationGain: 300, gpxFile: null },
      meetingPoint: { latitude: 37.7749, longitude: -122.4194, address: 'Spring Valley, SF' },
      maxParticipants: 15,
      currentParticipants: 7,
      terrain: 'Gravel' as TerrainType,
      pace: 'Fast' as PaceLevel,
      difficulty: 'Advanced' as DifficultyLevel,
      genderPreference: 'All' as GenderPreference,
      organizer: { id: 'user1', name: 'Sarah Wilson', rating: 4.8 },
      participants: [],
    },
  ];

  // Mock user data - replace with actual user data later
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    age: 24,
    profession: 'Student',
    institution: 'Oxford University',
    languages: ['English', 'Spanish'],
    gender: 'Male',
    ridesJoined: participatedRides.length,
    ridesCreated: 5,
    rating: 4.8,
    profilePicture: profilePicJohn,
    level: 19,
    achievements: [
      { id: '1', name: 'Early Bird', description: 'Completed 5 morning rides', icon: '🌅' },
      { id: '2', name: 'Mountain Goat', description: 'Climbed 5000m elevation', icon: '🏔️' },
      { id: '3', name: 'Century Rider', description: 'Completed a 100km ride', icon: '💯' },
    ],
  };

  const upcomingRides = participatedRides.filter(ride => new Date(ride.startTime) > new Date());
  const pastRides = participatedRides.filter(ride => new Date(ride.startTime) <= new Date());

  const renderActivities = () => (
    <View>
      <SegmentedButtons
        value={activitiesTab}
        onValueChange={setActivitiesTab}
        buttons={[
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'past', label: 'Past Activities' },
        ]}
        style={styles.tabs}
      />
      {activitiesTab === 'upcoming' ? (
        upcomingRides.length > 0 ? (
          upcomingRides.map(ride => (
            <RideCard
              key={ride.id}
              ride={ride}
              onPress={() => router.push(`/ride/${ride.id}`)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text variant="titleMedium">No upcoming activities</Text>
            <Text variant="bodyMedium">Join some rides to see them here</Text>
            <Button
              mode="contained"
              onPress={() => router.push('/')}
              style={styles.exploreButton}
            >
              Explore Rides
            </Button>
          </View>
        )
      ) : (
        pastRides.length > 0 ? (
          pastRides.map(ride => (
            <RideCard
              key={ride.id}
              ride={ride}
              onPress={() => router.push(`/ride/${ride.id}`)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text variant="titleMedium">No past activities</Text>
            <Text variant="bodyMedium">Your ride history will appear here</Text>
          </View>
        )
      )}
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.achievementsContainer}>
      {user.achievements.map(achievement => (
        <Surface key={achievement.id} style={styles.achievementCard}>
          <Text style={styles.achievementIcon}>{achievement.icon}</Text>
          <Text variant="titleMedium">{achievement.name}</Text>
          <Text variant="bodySmall">{achievement.description}</Text>
        </Surface>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Profile" />
        <Appbar.Action icon="cog" onPress={() => {/* TODO: Navigate to settings */}} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Surface style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {user.profilePicture ? (
              <Avatar.Image size={80} source={user.profilePicture} />
            ) : (
              <Avatar.Text size={80} label={user.name.split(' ').map(n => n[0]).join('')} />
            )}
            <View style={styles.profileInfo}>
              <Text variant="headlineSmall">{user.name}</Text>
              <Text variant="bodyMedium">{user.email}</Text>
              <Text variant="bodySmall">Age: {user.age}</Text>
              <Text variant="bodySmall">Profession: {user.profession}</Text>
              <Text variant="bodySmall">Institution: {user.institution}</Text>
              <Text variant="bodySmall">Languages: {user.languages.join(', ')}</Text>
              <Text variant="bodySmall">Gender: {user.gender}</Text>
              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Text variant="titleMedium">{user.ridesJoined}</Text>
                  <Text variant="bodySmall">Rides Joined</Text>
                </View>
                <View style={styles.stat}>
                  <Text variant="titleMedium">{user.ridesCreated}</Text>
                  <Text variant="bodySmall">Rides Created</Text>
                </View>
                <View style={styles.stat}>
                  <Text variant="titleMedium">{user.rating}★</Text>
                  <Text variant="bodySmall">Rating</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.levelContainer}>
            <Chip icon="star" style={styles.levelChip}>Level {user.level}</Chip>
          </View>
        </Surface>

        <SegmentedButtons
          value={selectedTab}
          onValueChange={setSelectedTab}
          buttons={[
            { value: 'activities', label: 'Activities' },
            { value: 'achievements', label: 'Achievements' },
          ]}
          style={styles.tabs}
        />

        {selectedTab === 'activities' ? renderActivities() : renderAchievements()}
      </ScrollView>
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
  profileCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
    maxWidth: 250,
  },
  stat: {
    alignItems: 'center',
  },
  levelContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  levelChip: {
    backgroundColor: '#FFD700',
  },
  tabs: {
    margin: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  exploreButton: {
    marginTop: 16,
  },
  achievementsContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
}); 