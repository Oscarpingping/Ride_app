import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Surface, TextInput, IconButton, Avatar } from 'react-native-paper';
import { useMessages } from '../context/MessageContext';
import type { ChatThread, Message } from '../context/MessageContext';

export default function MessagesScreen() {
  const { threads, messages, selectedThread, selectThread, sendMessage } = useMessages();
  const [newMessage, setNewMessage] = useState('');

  const renderThread = ({ item }: { item: ChatThread }) => (
    <Surface style={[styles.threadItem, selectedThread?.id === item.id && styles.selectedThread]} onTouchEnd={() => selectThread(item)}>
      <Avatar.Text size={40} label={item.participants[0][0]} />
      <View style={styles.threadInfo}>
        <Text variant="titleMedium">{item.participants.join(', ')}</Text>
        {item.lastMessage && (
          <Text variant="bodyMedium" numberOfLines={1} style={styles.lastMessage}>
            {item.lastMessage.content}
          </Text>
        )}
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unreadCount}</Text>
        </View>
      )}
    </Surface>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.senderId === 'currentUser' ? styles.sentMessage : styles.receivedMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.senderId === 'currentUser' ? styles.sentMessageText : styles.receivedMessageText
      ]}>{item.content}</Text>
      <Text style={[
        styles.timestamp,
        item.senderId === 'currentUser' ? styles.sentTimestamp : styles.receivedTimestamp
      ]}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  const handleSend = () => {
    if (newMessage.trim() && selectedThread) {
      sendMessage(newMessage.trim(), selectedThread.id);
      setNewMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.threadList}>
        <FlatList
          data={threads}
          renderItem={renderThread}
          keyExtractor={thread => thread.id}
        />
      </View>
      
      <View style={styles.chatContainer}>
        {selectedThread ? (
          <>
            <FlatList
              data={messages.filter(m => 
                selectedThread.participants.includes(m.senderId) &&
                selectedThread.participants.includes(m.receiverId)
              )}
              renderItem={renderMessage}
              keyExtractor={message => message.id}
              style={styles.messageList}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                right={
                  <TextInput.Icon 
                    icon="send"
                    onPress={handleSend}
                  />
                }
              />
            </View>
          </>
        ) : (
          <View style={styles.noSelection}>
            <Text>Select a chat to start messaging</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  threadList: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    backgroundColor: '#ffffff',
  },
  threadItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  selectedThread: {
    backgroundColor: '#e3f2fd',
  },
  threadInfo: {
    flex: 1,
    marginLeft: 12,
  },
  lastMessage: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#2196f3',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  messageList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 8,
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0084ff',
    borderTopRightRadius: 4,
    marginLeft: '20%',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 4,
    marginRight: '20%',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentMessageText: {
    color: '#ffffff',
  },
  receivedMessageText: {
    color: '#000000',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  sentTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  receivedTimestamp: {
    color: 'rgba(0,0,0,0.5)',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#ffffff',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  noSelection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
}); 