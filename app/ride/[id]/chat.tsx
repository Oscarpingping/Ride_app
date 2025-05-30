import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Text, Surface, TextInput, IconButton, Avatar, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ChatMessage, User } from '../../../types/ride';
import { ClubReference } from '../../../shared/types/user';

export default function RideChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Mock current user
  const currentUser: User = {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    rating: 4.9,
    ridesJoined: 8,
    ridesCreated: 2,
    clubs: [{
      club: '1',
      joinedAt: new Date('2024-01-01')
    }] as ClubReference[]
  };

  // Mock chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      senderId: '1',
      receiverId: '2',
      content: 'Hi everyone! Looking forward to the ride. Please make sure to bring water and a spare tube.',
      timestamp: new Date('2024-04-20T18:00:00'),
      rideId: id as string
    },
    {
      id: '2',
      senderId: '2',
      receiverId: '1',
      content: 'What time should we arrive at the meeting point?',
      timestamp: new Date('2024-04-20T18:05:00'),
      rideId: id as string
    }
  ]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        receiverId: '1',
        content: message.trim(),
        timestamp: new Date(),
        rideId: id as string
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Scroll to bottom after sending message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd();
      }, 100);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isCurrentUser = item.senderId === currentUser.id;

    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
        {!isCurrentUser && (
          <View style={styles.avatarContainer}>
            <Avatar.Text size={32} label={item.senderId.split('').map(n => n[0]).join('')} />
          </View>
        )}
        <View style={[styles.messageContent, isCurrentUser ? styles.currentUserContent : styles.otherUserContent]}>
          {!isCurrentUser && (
            <Text variant="labelSmall" style={styles.senderName}>
              {item.senderId}
            </Text>
          )}
          <Surface style={[styles.messageBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
            <Text>{item.content}</Text>
          </Surface>
          <Text variant="labelSmall" style={styles.timestamp}>
            {format(item.timestamp, 'h:mm a')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      <Divider />
      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          style={styles.input}
          right={
            <TextInput.Icon
              icon="send"
              onPress={handleSend}
              disabled={!message.trim()}
            />
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageContent: {
    maxWidth: '80%',
  },
  currentUserContent: {
    alignItems: 'flex-end',
  },
  otherUserContent: {
    alignItems: 'flex-start',
  },
  senderName: {
    marginBottom: 4,
    color: '#666',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  currentUserBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  timestamp: {
    marginTop: 4,
    color: '#666',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  input: {
    backgroundColor: 'white',
  },
}); 