import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, Avatar, Button, Chip } from 'react-native-paper';
import type { Club } from '../../shared/types/club';

interface ClubCardProps {
  club: Club;
  onPress: () => void;
}

export function ClubCard({ club, onPress }: ClubCardProps) {
  return (
    <Surface style={styles.clubCard} elevation={2}>
      <View style={styles.clubHeader}>
        <View style={styles.clubHeaderText}>
          <Text variant="titleMedium" style={styles.clubTitle}>{club.name}</Text>
          <Text variant="bodyMedium" style={styles.clubDescription} numberOfLines={2}>
            {club.description}
          </Text>
        </View>
      </View>

      <View style={styles.clubStats}>
        <View style={styles.stat}>
          <Text variant="titleMedium">{club.memberCount}</Text>
          <Text variant="bodySmall">Members</Text>
        </View>
        <View style={styles.stat}>
          <Text variant="titleMedium">{club.activityCount}</Text>
          <Text variant="bodySmall">Activities</Text>
        </View>
      </View>

      <View style={styles.clubFooter}>
        <View style={styles.founder}>
          <Avatar.Text size={36} label={club.founder.name.split(' ').map(n => n[0]).join('')} />
          <View style={styles.founderInfo}>
            <Text variant="bodyMedium">Founded by {club.founder.name}</Text>
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
  clubCard: {
    margin: 8,
    padding: 16,
    borderRadius: 8,
  },
  clubHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  clubHeaderText: {
    flex: 1,
  },
  clubTitle: {
    marginBottom: 4,
  },
  clubDescription: {
    color: '#666',
  },
  clubStats: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 24,
  },
  stat: {
    alignItems: 'center',
  },
  clubFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  founder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  founderInfo: {
    flex: 1,
  },
}); 