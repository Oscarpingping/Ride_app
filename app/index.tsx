import { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Searchbar,
  Button,
  Text,
  Surface,
  Chip,
  Portal,
  Modal,
  List,
  Divider,
  IconButton,
  SegmentedButtons,
  TextInput,
  FAB,
  BottomNavigation,
  Appbar,
  Avatar,
} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Ride, TerrainType, PaceLevel, DifficultyLevel } from '../types/ride';
import { FilterState, defaultFilterState } from '../app/types/filters';
import { useRides } from './context/RideContext';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import MessagesScreen from './messages';
import { sampleRides } from './data/sampleRides';
import { RideCard } from './components/RideCard';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'home', title: 'Home', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
    { key: 'messages', title: 'Messages', focusedIcon: 'message', unfocusedIcon: 'message-outline' },
    { key: 'create', title: 'Create', focusedIcon: 'plus-circle', unfocusedIcon: 'plus-circle-outline' },
    { key: 'saved', title: 'Saved', focusedIcon: 'bookmark', unfocusedIcon: 'bookmark-outline' },
    { key: 'profile', title: 'Profile', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
  ]);

  const { rides, toggleSaveRide, isSaved } = useRides();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Implement refresh logic
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredRides = useMemo(() => {
    return rides.filter(ride => {
      // Text search in title and description
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesTitle = ride.title.toLowerCase().includes(searchLower);
        const matchesDescription = ride.description.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesDescription) {
          return false;
        }
      }

      // Gender preference filter
      if (filters.genderPreference !== 'All' && ride.genderPreference !== filters.genderPreference) {
        return false;
      }

      // Distance filter
      if (ride.route.distance > filters.maxDistance) {
        return false;
      }

      // Terrain filter
      if (filters.terrain.length > 0 && !filters.terrain.includes(ride.terrain)) {
        return false;
      }

      // Pace filter
      if (filters.pace.length > 0 && !filters.pace.includes(ride.pace)) {
        return false;
      }

      // Difficulty filter
      if (filters.difficulty.length > 0 && !filters.difficulty.includes(ride.difficulty)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start && filters.dateRange.end) {
        const rideDate = new Date(ride.startTime);
        if (rideDate < filters.dateRange.start || rideDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort by the selected criteria
      switch (filters.sortBy) {
        case 'date':
          return filters.sortOrder === 'asc'
            ? a.startTime.getTime() - b.startTime.getTime()
            : b.startTime.getTime() - a.startTime.getTime();
        case 'distance':
          return filters.sortOrder === 'asc'
            ? a.route.distance - b.route.distance
            : b.route.distance - a.route.distance;
        case 'rating':
          return filters.sortOrder === 'asc'
            ? (a.organizer?.rating || 0) - (b.organizer?.rating || 0)
            : (b.organizer?.rating || 0) - (a.organizer?.rating || 0);
        default:
          return 0;
      }
    });
  }, [rides, searchQuery, filters]);

  const renderRideCard = (ride: Ride) => (
    <RideCard
      key={ride.id}
      ride={ride}
      onPress={() => router.push(`/ride/${ride.id}`)}
    />
  );

  const HomeContent = () => (
    <View style={styles.sceneContainer}>
      <Appbar.Header>
        <Appbar.Content title="Wild Pals" />
        <Appbar.Action icon={showMap ? 'format-list-bulleted' : 'map'} onPress={() => setShowMap(!showMap)} />
        <Appbar.Action icon="tune" onPress={() => setShowFilters(true)} />
      </Appbar.Header>

      <View style={styles.content}>
        <Searchbar
          placeholder="Search rides..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          autoComplete="off"
          returnKeyType="search"
          blurOnSubmit={false}
        />

        {showMap ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {filteredRides.map((ride) => (
              <Marker
                key={ride.id}
                coordinate={ride.meetingPoint}
                title={ride.title}
                description={`${ride.route.distance}km • ${ride.pace}`}
                onPress={() => router.push(`/ride/${ride.id}`)}
              />
            ))}
          </MapView>
        ) : (
          <ScrollView
            style={styles.rideList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredRides.length > 0 ? (
              filteredRides.map(renderRideCard)
            ) : (
              <View style={styles.emptyState}>
                <Text variant="titleMedium">No rides found</Text>
                <Text variant="bodyMedium">Try adjusting your filters</Text>
              </View>
            )}
          </ScrollView>
        )}

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push('/create-ride')}
        />
      </View>

      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={styles.filterModal}
        >
          <ScrollView>
            <View style={styles.filterHeader}>
              <Text variant="titleLarge">Filters</Text>
              <IconButton icon="close" onPress={() => setShowFilters(false)} />
            </View>

            <Text variant="titleMedium" style={styles.filterSectionTitle}>Gender Preference</Text>
            <SegmentedButtons
              value={filters.genderPreference}
              onValueChange={(value) => setFilters({ ...filters, genderPreference: value as 'All' | 'Men' | 'Women' | 'Non-binary' })}
              buttons={[
                { value: 'All', label: 'All' },
                { value: 'Men', label: 'Men' },
                { value: 'Women', label: 'Women' },
                { value: 'Non-binary', label: 'Non-binary' },
              ]}
            />

            <Text variant="titleMedium" style={styles.filterSectionTitle}>Distance Range (km)</Text>
            <View style={styles.rangeContainer}>
              <TextInput
                label="Min"
                value={filters.minDistance.toString()}
                onChangeText={(value) => setFilters({ ...filters, minDistance: parseInt(value) || 0 })}
                keyboardType="numeric"
                style={styles.rangeInput}
              />
              <Text>-</Text>
              <TextInput
                label="Max"
                value={filters.maxDistance.toString()}
                onChangeText={(value) => setFilters({ ...filters, maxDistance: parseInt(value) || 0 })}
                keyboardType="numeric"
                style={styles.rangeInput}
              />
            </View>

            <Text variant="titleMedium" style={styles.filterSectionTitle}>Elevation Range (m)</Text>
            <View style={styles.rangeContainer}>
              <TextInput
                label="Min"
                value={filters.minElevation.toString()}
                onChangeText={(value) => setFilters({ ...filters, minElevation: parseInt(value) || 0 })}
                keyboardType="numeric"
                style={styles.rangeInput}
              />
              <Text>-</Text>
              <TextInput
                label="Max"
                value={filters.maxElevation.toString()}
                onChangeText={(value) => setFilters({ ...filters, maxElevation: parseInt(value) || 0 })}
                keyboardType="numeric"
                style={styles.rangeInput}
              />
            </View>

            <Text variant="titleMedium" style={styles.filterSectionTitle}>Location</Text>
            <View style={styles.locationContainer}>
              <Button
                mode="outlined"
                onPress={() => {
                  // TODO: Implement location picker
                  console.log('Open location picker');
                }}
                style={styles.locationButton}
              >
                {filters.location.latitude ? 'Change Location' : 'Set Location'}
              </Button>
              {filters.location.latitude && filters.location.longitude && (
                <Text variant="bodyMedium" style={styles.locationText}>
                  Selected: {filters.location.latitude.toFixed(4)}, {filters.location.longitude.toFixed(4)}
                </Text>
              )}
              <TextInput
                label="Search Radius (km)"
                value={filters.location.radius.toString()}
                onChangeText={(value) => setFilters({
                  ...filters,
                  location: { ...filters.location, radius: parseInt(value) || 25 }
                })}
                keyboardType="numeric"
                style={styles.radiusInput}
              />
            </View>

            <Text variant="titleMedium" style={styles.filterSectionTitle}>Maximum Participants</Text>
            <TextInput
              label="Max Participants"
              value={filters.maxParticipants?.toString() || ''}
              onChangeText={(value) => setFilters({ ...filters, maxParticipants: parseInt(value) || null })}
              keyboardType="numeric"
              style={styles.input}
            />

            <Text variant="titleMedium" style={styles.filterSectionTitle}>Cycling Club</Text>
            <View style={styles.clubContainer}>
              <Button
                mode="outlined"
                onPress={() => {
                  // TODO: Implement club picker
                  console.log('Open club picker');
                }}
                style={styles.clubButton}
              >
                {filters.clubId ? 'Change Club' : 'Select Club'}
              </Button>
              {filters.clubId && (
                <Text variant="bodyMedium" style={styles.clubText}>
                  Selected Club: {filters.clubId}
                </Text>
              )}
            </View>

            <Text variant="titleMedium" style={styles.filterSectionTitle}>Terrain</Text>
            <View style={styles.chipGroup}>
              {['Road', 'Gravel', 'MTB', 'Urban', 'Mixed'].map((type) => (
                <Chip
                  key={type}
                  selected={filters.terrain.includes(type as TerrainType)}
                  onPress={() => {
                    const newTerrain = filters.terrain.includes(type as TerrainType)
                      ? filters.terrain.filter(t => t !== type)
                      : [...filters.terrain, type as TerrainType];
                    setFilters({ ...filters, terrain: newTerrain });
                  }}
                  style={styles.filterChip}
                >
                  {type}
                </Chip>
              ))}
            </View>

            <Text variant="titleMedium" style={styles.filterSectionTitle}>Pace</Text>
            <View style={styles.chipGroup}>
              {['Casual', 'Moderate', 'Fast'].map((pace) => (
                <Chip
                  key={pace}
                  selected={filters.pace.includes(pace as PaceLevel)}
                  onPress={() => {
                    const newPace = filters.pace.includes(pace as PaceLevel)
                      ? filters.pace.filter(p => p !== pace)
                      : [...filters.pace, pace as PaceLevel];
                    setFilters({ ...filters, pace: newPace });
                  }}
                  style={styles.filterChip}
                >
                  {pace}
                </Chip>
              ))}
            </View>

            <Text variant="titleMedium" style={styles.filterSectionTitle}>Difficulty</Text>
            <View style={styles.chipGroup}>
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <Chip
                  key={level}
                  selected={filters.difficulty.includes(level as DifficultyLevel)}
                  onPress={() => {
                    const newDifficulty = filters.difficulty.includes(level as DifficultyLevel)
                      ? filters.difficulty.filter(d => d !== level)
                      : [...filters.difficulty, level as DifficultyLevel];
                    setFilters({ ...filters, difficulty: newDifficulty });
                  }}
                  style={styles.filterChip}
                >
                  {level}
                </Chip>
              ))}
            </View>

            <Text variant="titleMedium" style={styles.filterSectionTitle}>Sort By</Text>
            <SegmentedButtons
              value={filters.sortBy}
              onValueChange={(value) => setFilters({ ...filters, sortBy: value as 'date' | 'distance' | 'rating' })}
              buttons={[
                { value: 'date', label: 'Date' },
                { value: 'distance', label: 'Distance' },
                { value: 'rating', label: 'Rating' },
              ]}
            />

            <Text variant="titleMedium" style={styles.filterSectionTitle}>Sort Order</Text>
            <SegmentedButtons
              value={filters.sortOrder}
              onValueChange={(value) => setFilters({ ...filters, sortOrder: value as 'asc' | 'desc' })}
              buttons={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
            />

            <View style={styles.filterActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setFilters(defaultFilterState);
                }}
                style={styles.filterButton}
              >
                Reset
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFilters(false)}
                style={styles.filterButton}
              >
                Apply
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );

  const SavedRidesScreen = () => {
    const { getSavedRides } = useRides();
    const savedRides = getSavedRides();

    return (
      <View style={styles.sceneContainer}>
        <Appbar.Header>
          <Appbar.Content title="Saved Rides" />
        </Appbar.Header>
        <ScrollView style={styles.content}>
          {savedRides.length > 0 ? (
            savedRides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onPress={() => router.push(`/ride/${ride.id}`)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text variant="titleMedium">No saved rides</Text>
              <Text variant="bodyMedium">Save rides to find them here later</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  const handleIndexChange = (newIndex: number) => {
    if (newIndex === 2) { // Create tab
      router.push('/create-ride');
    } else if (newIndex === 4) { // Profile tab
      router.push('/profile');
    } else {
      setIndex(newIndex);
    }
  };

  const renderScene = BottomNavigation.SceneMap({
    home: HomeContent,
    messages: MessagesScreen,
    create: () => null,
    saved: SavedRidesScreen,
    profile: () => null,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={handleIndexChange}
      renderScene={renderScene}
      barStyle={styles.bottomNav}
      labeled={true}
      shifting={true}
    />
  );
}

const styles = StyleSheet.create({
  sceneContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
  },
  map: {
    flex: 1,
  },
  rideList: {
    flex: 1,
  },
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  bottomNav: {
    backgroundColor: 'white',
  },
  filterModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterSectionTitle: {
    marginTop: 20,
    marginBottom: 10,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    marginBottom: 8,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    textAlign: 'center',
    marginTop: -8,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  rangeInput: {
    flex: 1,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationButton: {
    marginBottom: 8,
  },
  locationText: {
    marginBottom: 8,
  },
  radiusInput: {
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  clubContainer: {
    marginBottom: 16,
  },
  clubButton: {
    marginBottom: 8,
  },
  clubText: {
    marginTop: 4,
  },
}); 