import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Avatar, Surface, Divider, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessageContext';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesScreen() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuth();
  const { messages, loading, error, getMessages } = useMessages();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      getMessages();
    }
  }, [isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getMessages();
    setRefreshing(false);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text variant="titleMedium">Please log in to view messages</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text variant="titleMedium">Error: {error}</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <Surface style={styles.messageCard} elevation={1}>
      <View style={styles.messageHeader}>
        <Avatar.Text 
          size={40} 
          label={item.sender.name.substring(0, 2).toUpperCase()} 
          style={{ backgroundColor: '#7c3aed' }}
        />
        <View style={styles.messageInfo}>
          <Text variant="titleMedium">{item.sender.name}</Text>
          <Text variant="bodySmall" style={styles.timestamp}>
            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
          </Text>
        </View>
      </View>
      <Text variant="bodyMedium" style={styles.messageContent}>
        {item.content}
      </Text>
      {item.rideId && (
        <Text 
          variant="bodySmall" 
          style={styles.rideLink}
          onPress={() => router.push(`/ride/${item.rideId}`)}
        >
          View related ride
        </Text>
      )}
    </Surface>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text variant="titleMedium">No messages yet</Text>
            <Text variant="bodyMedium">Join some rides to start chatting!</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  messageCard: {
    padding: 16,
    borderRadius: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageInfo: {
    marginLeft: 12,
    flex: 1,
  },
  timestamp: {
    color: '#666',
    marginTop: 2,
  },
  messageContent: {
    marginBottom: 8,
  },
  rideLink: {
    color: '#7c3aed',
    textDecorationLine: 'underline',
  },
  separator: {
    height: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
}); 