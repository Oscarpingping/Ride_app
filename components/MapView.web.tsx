import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

// Web版本的地图组件 - 简单的占位符
interface MapViewProps {
  style?: any;
  region?: any;
  onRegionChange?: (region: any) => void;
  children?: React.ReactNode;
}

interface MarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export const MapView: React.FC<MapViewProps> = ({ style, children }) => {
  return (
    <View style={[styles.mapContainer, style]}>
      <Text style={styles.mapText}>地图视图 (Web版本)</Text>
      <Text style={styles.mapSubtext}>在移动设备上查看完整地图功能</Text>
      {children}
    </View>
  );
};

export const Marker: React.FC<MarkerProps> = ({ title, description }) => {
  return (
    <View style={styles.marker}>
      <Text style={styles.markerText}>{title || '标记'}</Text>
      {description && <Text style={styles.markerDesc}>{description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    backgroundColor: '#e8f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    minHeight: 200,
  },
  mapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  marker: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 4,
  },
  markerText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  markerDesc: {
    fontSize: 10,
    color: '#666',
  },
});

export default MapView;