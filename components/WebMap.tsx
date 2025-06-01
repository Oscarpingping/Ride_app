import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WebMapProps {
  style?: any;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  children?: React.ReactNode;
}

export const WebMap: React.FC<WebMapProps> = ({ style, initialRegion, children }) => {
  return (
    <View style={[styles.mapContainer, style]}>
      <Text style={styles.mapText}>
        🗺️ Map View
        {initialRegion && (
          <Text style={styles.coordinates}>
            {'\n'}Lat: {initialRegion.latitude.toFixed(4)}
            {'\n'}Lng: {initialRegion.longitude.toFixed(4)}
          </Text>
        )}
      </Text>
      {children}
    </View>
  );
};

export const WebMarker: React.FC<{
  coordinate: { latitude: number; longitude: number };
  title?: string;
  description?: string;
  children?: React.ReactNode;
}> = ({ coordinate, title, description, children }) => {
  return (
    <View style={styles.marker}>
      <Text style={styles.markerText}>📍</Text>
      {title && <Text style={styles.markerTitle}>{title}</Text>}
      {description && <Text style={styles.markerDescription}>{description}</Text>}
      {children}
    </View>
  );
};

export const WebCallout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <View style={styles.callout}>{children}</View>;
};

const styles = StyleSheet.create({
  mapContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    padding: 20,
  },
  mapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  coordinates: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#666',
  },
  marker: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    fontSize: 20,
  },
  markerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  markerDescription: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  callout: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});

// Export as default for easier replacement
export default WebMap;