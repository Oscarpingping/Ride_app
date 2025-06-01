import { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { Button, TextInput, Text, Surface, SegmentedButtons, Chip, Portal, Modal } from 'react-native-paper';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { WebMap as MapView, WebMarker as Marker } from '../components/WebMap';
type MapPressEvent = { nativeEvent: { coordinate: { latitude: number; longitude: number } } };
import { DifficultyLevel, TerrainType } from '../types/ride';

async function geocodeAddress(address: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data && data.length > 0) {
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      address: data[0].display_name,
    };
  }
  return null;
}

async function reverseGeocode(lat: number, lon: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data && data.display_name) {
    return data.display_name;
  }
  return '';
}

function debounce(func: (...args: any[]) => void, delay: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export default function CreateRideScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [terrain, setTerrain] = useState<TerrainType>('Road');
  const [paceUnit, setPaceUnit] = useState<'km/h' | 'mph'>('km/h');
  const [minSpeed, setMinSpeed] = useState('15');
  const [maxSpeed, setMaxSpeed] = useState('25');
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [meetingPoint, setMeetingPoint] = useState({
    latitude: 0,
    longitude: 0,
    address: '',
  });
  const [addressInput, setAddressInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const debouncedGeocode = useRef(
    debounce(async (text: string) => {
      setIsGeocoding(true);
      const result = await geocodeAddress(text);
      setIsGeocoding(false);
      if (result) {
        setMeetingPoint(result);
      }
    }, 600)
  ).current;

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const showTimepicker = () => {
    setShowTimePicker(true);
  };

  const handleCreateRide = () => {
    // TODO: Implement ride creation with Firebase
    console.log('Creating ride:', {
      title,
      description,
      difficulty,
      terrain,
      paceUnit,
      minSpeed,
      maxSpeed,
      maxParticipants,
      date,
      isRecurring,
      meetingPoint,
    });
    router.back();
  };

  const handleAddressChange = (text: string) => {
    setAddressInput(text);
    if (text.length > 5) {
      debouncedGeocode(text);
    }
  };

  const handleMapPress = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMeetingPoint({ latitude, longitude, address: '' });
    const address = await reverseGeocode(latitude, longitude);
    setMeetingPoint({ latitude, longitude, address });
    setAddressInput(address);
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <Text variant="headlineMedium" style={styles.title}>
          Create New Ride
        </Text>

        <TextInput
          label="Ride Title"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={4}
        />

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Difficulty Level
        </Text>
        <SegmentedButtons
          value={difficulty}
          onValueChange={(value) => setDifficulty(value as DifficultyLevel)}
          buttons={[
            { value: 'Beginner', label: 'Beginner' },
            { value: 'Intermediate', label: 'Intermediate' },
            { value: 'Advanced', label: 'Advanced' },
          ]}
          style={styles.segmentedButtons}
        />

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Terrain Type
        </Text>
        <View style={styles.chipContainer}>
          {['Road', 'Gravel', 'MTB', 'Urban', 'Mixed'].map((type) => (
            <Chip
              key={type}
              selected={terrain === type}
              onPress={() => setTerrain(type as TerrainType)}
              style={styles.chip}
            >
              {type}
            </Chip>
          ))}
        </View>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Pace
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <SegmentedButtons
            value={paceUnit}
            onValueChange={(value) => setPaceUnit(value as 'km/h' | 'mph')}
            buttons={[
              { value: 'km/h', label: 'km/h' },
              { value: 'mph', label: 'mph' },
            ]}
            style={{ flex: 1 }}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <TextInput
            label={`Min (${paceUnit})`}
            value={minSpeed}
            onChangeText={setMinSpeed}
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
            keyboardType="numeric"
          />
          <TextInput
            label={`Max (${paceUnit})`}
            value={maxSpeed}
            onChangeText={setMaxSpeed}
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
            keyboardType="numeric"
          />
        </View>

        <TextInput
          label="Maximum Participants"
          value={maxParticipants}
          onChangeText={setMaxParticipants}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
        />

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Meeting Point
        </Text>
        <Button
          mode="outlined"
          onPress={() => setShowMap(true)}
          style={styles.input}
        >
          {meetingPoint.address || 'Select Meeting Point'}
        </Button>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Date & Time
        </Text>
        {Platform.OS === 'android' ? (
          <Button
            mode="outlined"
            onPress={showDatepicker}
            style={styles.input}
          >
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </Button>
        ) : (
          <View>
            <Button
              mode="outlined"
              onPress={showDatepicker}
              style={styles.input}
            >
              {date.toLocaleDateString()}
            </Button>
            <Button
              mode="outlined"
              onPress={showTimepicker}
              style={[styles.input, { marginTop: 8 }]}
            >
              {date.toLocaleTimeString()}
            </Button>
          </View>
        )}

        <View style={styles.recurringContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Recurring Ride
          </Text>
          <SegmentedButtons
            value={isRecurring ? 'yes' : 'no'}
            onValueChange={(value) => setIsRecurring(value === 'yes')}
            buttons={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleCreateRide}
          style={styles.button}
        >
          Create Ride
        </Button>
      </Surface>

      <Portal>
        <Modal
          visible={showMap}
          onDismiss={() => setShowMap(false)}
          contentContainerStyle={styles.mapContainer}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          >
            <TextInput
              label="Enter address or location"
              value={addressInput}
              onChangeText={handleAddressChange}
              mode="outlined"
              style={{ marginBottom: 12 }}
              disabled={isGeocoding}
            />
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: meetingPoint.latitude || 37.78825,
                longitude: meetingPoint.longitude || -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              region={meetingPoint.latitude !== 0 ? {
                latitude: meetingPoint.latitude,
                longitude: meetingPoint.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              } : undefined}
              onPress={handleMapPress}
            >
              {meetingPoint.latitude !== 0 && (
                <Marker
                  coordinate={{
                    latitude: meetingPoint.latitude,
                    longitude: meetingPoint.longitude,
                  }}
                  title="Meeting Point"
                  description={meetingPoint.address}
                />
              )}
            </MapView>
            <Button
              mode="contained"
              onPress={() => setShowMap(false)}
              style={styles.mapButton}
            >
              Confirm Location
            </Button>
          </KeyboardAvoidingView>
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
  surface: {
    margin: 16,
    padding: 20,
    borderRadius: 8,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    margin: 4,
  },
  recurringContainer: {
    marginTop: 16,
  },
  button: {
    marginTop: 24,
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  map: {
    flex: 1,
    borderRadius: 8,
  },
  mapButton: {
    marginTop: 16,
  },
}); 