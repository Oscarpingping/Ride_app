import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import { Appbar, Avatar, Text, TextInput, ActivityIndicator, IconButton } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// --- Mock Data Types ---
interface MockMessage {
    id: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'audio';
    timestamp: string;
    senderAvatar?: string;
}

// --- Mock Data for UI Demo ---
const mockMessages: MockMessage[] = [
  { id: '1', senderId: 'user2', content: 'Hey, when is the next ride?', type: 'text', timestamp: '10:00 AM', senderAvatar: 'https://i.pravatar.cc/150?u=user2' },
  { id: '2', senderId: 'user1', content: 'This Sunday at 9 AM. You in?', type: 'text', timestamp: '10:01 AM' },
  { id: '3', senderId: 'user3', content: 'I am! Can\'t wait!', type: 'text', timestamp: '10:02 AM', senderAvatar: 'https://i.pravatar.cc/150?u=user3' },
  { id: '4', senderId: 'user2', type: 'image', content: 'https://picsum.photos/seed/picsum/200/300', timestamp: '10:05 AM', senderAvatar: 'https://i.pravatar.cc/150?u=user2' },
  { id: '5', senderId: 'user1', type: 'audio', content: 'Audio Message (0:15)', timestamp: '10:06 AM' },
];

const mockClubInfo = {
  name: 'UCLMC',
  logo: 'https://i.pravatar.cc/150?u=uclmc',
  memberCount: 125,
};
// --- End Mock Data ---


export default function ChatRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { chatRoomId } = params;
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState(mockMessages);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Simulates loading messages
  const [chatRoom, setChatRoom] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleSend = () => {
    if (inputText.trim().length > 0) {
      const newMessage: MockMessage = {
        id: Math.random().toString(),
        senderId: 'user1', // Assuming current user's ID
        content: inputText.trim(),
        type: 'text',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [newMessage, ...prev]);
      setInputText('');
    }
  };

  const renderMessage = ({ item }: { item: MockMessage }) => {
    const isMyMessage = item.senderId === 'user1'; // currentUser.id
    return (
      <View style={[styles.messageRow, { justifyContent: isMyMessage ? 'flex-end' : 'flex-start' }]}>
        {!isMyMessage && <Avatar.Image size={32} source={{ uri: item.senderAvatar }} style={styles.avatar} />}
        <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
          <Text style={{ color: isMyMessage ? 'white' : 'black' }}>{item.content}</Text>
          <Text style={[styles.timestamp, { color: isMyMessage ? '#e0e0e0' : '#555' }]}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  const fetchChatRoomData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/chatroom/${chatRoomId}`);
      if (res.ok) {
        const data = await res.json();
        setChatRoom(data);
      }
    } catch (e) {
      // 可加错误处理
    }
    setRefreshing(false);
  }, [chatRoomId]);

  useEffect(() => {
    fetchChatRoomData();
  }, [fetchChatRoomData]);

  if (isLoading) {
    return <ActivityIndicator style={styles.centered} />;
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Avatar.Image size={40} source={{ uri: chatRoom?.logo || mockClubInfo.logo || '/Users/taoliu/Wildpals/assets/images/logo.png' }} />
        <Appbar.Content title={chatRoom?.name || mockClubInfo.name || 'Chatroom'} subtitle={chatRoom ? `${chatRoom.members?.length || 0} members` : `${mockClubInfo.memberCount} members`} titleStyle={styles.headerTitle} />
        <Appbar.Action icon="dots-vertical" onPress={() => {}} />
      </Appbar.Header>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messageList}
        contentContainerStyle={{ padding: 8 }}
        inverted
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchChatRoomData} />}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.select({ ios: 90, android: 0 })}
      >
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
          <IconButton icon="plus" size={24} onPress={() => { /* Open attachment menu */ }} />
          {inputText.length === 0 ? (
             <Pressable
                onPressIn={() => {
                  console.log("Recording started");
                  setIsRecording(true);
                  // Add haptic feedback
                  // Start audio recording logic here
                }}
                onPressOut={() => {
                  console.log("Recording ended");
                  setIsRecording(false);
                  // Stop recording and send the audio message
                }}
                style={({ pressed }) => [styles.micButton, { backgroundColor: pressed ? '#c0c0c0' : '#f0f0f0' }]}
             >
                {isRecording ?
                  <Text style={styles.recordingText}>Recording...</Text> :
                  <Ionicons name="mic" size={24} color="#555" />
                }
             </Pressable>
          ) : (
             <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                multiline
                right={<TextInput.Icon icon="send" onPress={handleSend} />}
             />
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ece5dd' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#f9f9f9' },
  headerTitle: { fontWeight: 'bold' },
  messageList: { flex: 1 },
  keyboardView: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    maxHeight: 120,
    paddingHorizontal: 12,
  },
  micButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  recordingText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    maxWidth: '80%',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
  },
  myMessage: {
    backgroundColor: '#075e54',
    alignSelf: 'flex-end',
    borderTopRightRadius: 5,
  },
  theirMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 5,
  },
  avatar: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 2,
    opacity: 0.8,
  }
}); 