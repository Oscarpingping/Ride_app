import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, RefreshControl } from 'react-native';
import { Text, Avatar, Button, Surface, Chip, IconButton, Portal, Modal, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useRides } from '../context/RideContext';
import { RideCard } from '../components/RideCard';
import { format } from 'date-fns';
import { TerrainType, PaceLevel, DifficultyLevel } from '../types/ride';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, isAuthenticated, logout, updateProfile } = useAuth();
  const { rides, loading, error, getUserRides } = useRides();
  const [refreshing, setRefreshing] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: currentUser?.name || '',
    bio: currentUser?.bio || '',
    location: currentUser?.location || '',
    preferences: {
      terrain: currentUser?.preferences?.terrain || [],
      pace: currentUser?.preferences?.pace || [],
      difficulty: currentUser?.preferences?.difficulty || [],
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      getUserRides(currentUser.id);
    }
  }, [isAuthenticated, currentUser?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (currentUser?.id) {
      await getUserRides(currentUser.id);
    }
    setRefreshing(false);
  };

  const handleSaveProfile = async () => {
    await updateProfile(editedProfile);
    setShowEditProfile(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text variant="titleMedium">Please log in to view your profile</Text>
        <Button mode="contained" onPress={() => router.push('/auth')} style={styles.button}>
          Log In
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Surface style={styles.profileCard} elevation={1}>
        <View style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={currentUser.name.substring(0, 2).toUpperCase()}
            style={{ backgroundColor: '#7c3aed' }}
          />
          <View style={styles.profileInfo}>
            <Text variant="headlineSmall">{currentUser.name}</Text>
            <Text variant="bodyMedium" style={styles.location}>
              {currentUser.location}
            </Text>
            <Text variant="bodyMedium" style={styles.joinDate}>
              Joined {format(new Date(currentUser.createdAt), 'MMMM yyyy')}
            </Text>
          </View>
          <IconButton icon="pencil" onPress={() => setShowEditProfile(true)} />
        </View>

        <Text variant="bodyMedium" style={styles.bio}>
          {currentUser.bio}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text variant="titleLarge">{rides.length}</Text>
            <Text variant="bodyMedium">Rides</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="titleLarge">{currentUser.followers?.length || 0}</Text>
            <Text variant="bodyMedium">Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="titleLarge">{currentUser.following?.length || 0}</Text>
            <Text variant="bodyMedium">Following</Text>
          </View>
        </View>

        <View style={styles.preferencesContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Riding Preferences
          </Text>
          <View style={styles.chipGroup}>
            {currentUser.preferences?.terrain.map((terrain: TerrainType) => (
              <Chip key={terrain} style={styles.chip}>
                {terrain}
              </Chip>
            ))}
          </View>
          <View style={styles.chipGroup}>
            {currentUser.preferences?.pace.map((pace: PaceLevel) => (
              <Chip key={pace} style={styles.chip}>
                {pace}
              </Chip>
            ))}
          </View>
          <View style={styles.chipGroup}>
            {currentUser.preferences?.difficulty.map((level: DifficultyLevel) => (
              <Chip key={level} style={styles.chip}>
                {level}
              </Chip>
            ))}
          </View>
        </View>
      </Surface>

      <View style={styles.ridesSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          My Rides
        </Text>
        {rides.map((ride) => (
          <RideCard key={ride.id} ride={ride} onPress={() => router.push(`/ride/${ride.id}`)} />
        ))}
      </View>

      <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton}>
        Log Out
      </Button>

      <Portal>
        <Modal
          visible={showEditProfile}
          onDismiss={() => setShowEditProfile(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Edit Profile
            </Text>

            <TextInput
              label="Name"
              value={editedProfile.name}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, name: text })}
              style={styles.input}
            />

            <TextInput
              label="Bio"
              value={editedProfile.bio}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, bio: text })}
              multiline
              numberOfLines={4}
              style={styles.input}
            />

            <TextInput
              label="Location"
              value={editedProfile.location}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, location: text })}
              style={styles.input}
            />

            <Text variant="titleMedium" style={styles.preferencesTitle}>
              Terrain Preferences
            </Text>
            <View style={styles.chipGroup}>
              {['Road', 'Gravel', 'MTB', 'Urban', 'Mixed'].map((terrain) => (
                <Chip
                  key={terrain}
                  selected={editedProfile.preferences.terrain.includes(terrain as TerrainType)}
                  onPress={() => {
                    const newTerrain = editedProfile.preferences.terrain.includes(terrain as TerrainType)
                      ? editedProfile.preferences.terrain.filter((t) => t !== terrain)
                      : [...editedProfile.preferences.terrain, terrain as TerrainType];
                    setEditedProfile({
                      ...editedProfile,
                      preferences: { ...editedProfile.preferences, terrain: newTerrain },
                    });
                  }}
                  style={styles.chip}
                >
                  {terrain}
                </Chip>
              ))}
            </View>

            <Text variant="titleMedium" style={styles.preferencesTitle}>
              Pace Preferences
            </Text>
            <View style={styles.chipGroup}>
              {['Casual', 'Moderate', 'Fast'].map((pace) => (
                <Chip
                  key={pace}
                  selected={editedProfile.preferences.pace.includes(pace as PaceLevel)}
                  onPress={() => {
                    const newPace = editedProfile.preferences.pace.includes(pace as PaceLevel)
                      ? editedProfile.preferences.pace.filter((p) => p !== pace)
                      : [...editedProfile.preferences.pace, pace as PaceLevel];
                    setEditedProfile({
                      ...editedProfile,
                      preferences: { ...editedProfile.preferences, pace: newPace },
                    });
                  }}
                  style={styles.chip}
                >
                  {pace}
                </Chip>
              ))}
            </View>

            <Text variant="titleMedium" style={styles.preferencesTitle}>
              Difficulty Preferences
            </Text>
            <View style={styles.chipGroup}>
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <Chip
                  key={level}
                  selected={editedProfile.preferences.difficulty.includes(level as DifficultyLevel)}
                  onPress={() => {
                    const newDifficulty = editedProfile.preferences.difficulty.includes(
                      level as DifficultyLevel
                    )
                      ? editedProfile.preferences.difficulty.filter((d) => d !== level)
                      : [...editedProfile.preferences.difficulty, level as DifficultyLevel];
                    setEditedProfile({
                      ...editedProfile,
                      preferences: { ...editedProfile.preferences, difficulty: newDifficulty },
                    });
                  }}
                  style={styles.chip}
                >
                  {level}
                </Chip>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={() => setShowEditProfile(false)} style={styles.modalButton}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleSaveProfile} style={styles.modalButton}>
                Save
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  location: {
    color: '#666',
    marginTop: 4,
  },
  joinDate: {
    color: '#666',
    marginTop: 2,
  },
  bio: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  stat: {
    alignItems: 'center',
  },
  preferencesContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  ridesSection: {
    padding: 16,
  },
  button: {
    marginTop: 16,
  },
  logoutButton: {
    margin: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  preferencesTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    minWidth: 100,
  },
}); 