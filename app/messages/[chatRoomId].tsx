import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Pressable, KeyboardAvoidingView, Platform, RefreshControl, Alert, ScrollView, Keyboard, Dimensions, Animated } from 'react-native';
import { Appbar, Avatar, Text, TextInput, ActivityIndicator, IconButton, Surface } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { messageAPI, chatRoomAPI } from '../services/api';
import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from '../../shared/config/api';
import { ChatRoom } from '../../shared/types/club';
import { ChatMessage } from '../../shared/types/entities';
import { ImageService } from '../services/imageService';
import { Colors } from '../../constants/Colors';

// 成员类型定义
interface ChatMember {
  _id: string;
  name: string;
  name_sid: string;
  avatar?: string;
}

// 提及建议类型
interface MentionSuggestion {
  _id: string;
  name: string;
  name_sid: string;
  avatar?: string;
  displayText: string;
}

export default function ChatRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { chatRoomId } = params;
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // @提及相关状态
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  
  // 附件菜单相关状态
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<any>(null);
  const keyboardAnimation = useRef(new Animated.Value(0)).current;

  // 初始化Socket.IO连接
  useEffect(() => {
    if (!currentUser?._id || !chatRoomId) return;

    const newSocket = io(getApiBaseUrl(), {
      transports: Platform.OS === 'web' ? ['polling', 'websocket'] : ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      
      // 用户登录
      newSocket.emit('login', currentUser._id);
      
      // 加入聊天室
      newSocket.emit('join_room', chatRoomId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('[Socket] Error:', error);
    });

    // 监听新消息
    newSocket.on('message_event', (event) => {
      if (event.type === 'message_received' && event.data.chatRoomId === chatRoomId) {
        setMessages(prev => [event.data.message, ...prev]);
      }
    });

    // 监听聊天室事件
    newSocket.on('chatroom_event', (event) => {
      if (event.data.chatRoomId === chatRoomId) {
        if (event.type === 'message') {
          setMessages(prev => [event.data.message, ...prev]);
        }
      }
    });

    // 监听聊天室信息更新事件
    newSocket.on('chatroom_info_updated', (event) => {
      if (event.chatRoomId === chatRoomId) {
        console.log('[ChatRoom] Chatroom info updated:', event.updates);
        // 更新聊天室信息
        setChatRoom(prev => prev ? { ...prev, ...event.updates } : null);
      }
    });

    // 监听用户提及通知
    newSocket.on('user_mentioned', (event) => {
      if (event.userId === currentUser?._id) {
        // console.log('[ChatRoom] User mentioned:', event);
        // 可以在这里显示通知或播放声音
        Alert.alert(
          'You were mentioned!',
          `${event.mentionedBy} mentioned you in a message: "${event.message}"`,
          [{ text: 'OK' }]
        );
      }
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('leave_room', chatRoomId);
        newSocket.disconnect();
      }
    };
  }, [currentUser?._id, chatRoomId]);

  // 加载聊天室信息
  const fetchChatRoomData = useCallback(async () => {
    if (!chatRoomId) return;
    
    setRefreshing(true);
    try {
      const response = await chatRoomAPI.getChatRoom(chatRoomId as string);
      // console.log('[ChatRoom] getChatRoom response:', JSON.stringify(response, null, 2));
      if (response && typeof response === 'object' && 'success' in response && response.success) {
        const chatRoomData = (response as any).data;
        setChatRoom(chatRoomData);
        // console.log('[ChatRoom] Set chatRoom data:', JSON.stringify(chatRoomData, null, 2));
        
        // 提取成员信息
        if (chatRoomData.members && Array.isArray(chatRoomData.members)) {
          const memberList: ChatMember[] = chatRoomData.members.map((member: any) => ({
            _id: member._id,
            name: member.name,
            name_sid: member.name_sid || member.name, // 如果没有name_sid，使用name
            avatar: member.avatar
          }));
          setMembers(memberList);
          // console.log('[ChatRoom] Set members:', memberList);
        }
      } else {
        Alert.alert('Error', 'Failed to load chatroom data');
      }
    } catch (error) {
      console.error('[ChatRoom] Error fetching chatroom data:', error);
      Alert.alert('Error', 'Failed to load chatroom data');
    }
    setRefreshing(false);
  }, [chatRoomId]);

  // 加载消息
  const fetchMessages = useCallback(async () => {
    if (!chatRoomId) return;
    
    setIsLoading(true);
    try {
      const response = await messageAPI.getChatRoomMessages(chatRoomId as string, 50, 0);
      if (response && typeof response === 'object' && 'success' in response && response.success) {
        setMessages((response as any).data || []);
      } else {
        Alert.alert('Error', 'Failed to load messages');
      }
    } catch (error) {
      console.error('[ChatRoom] Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
    setIsLoading(false);
  }, [chatRoomId]);

  // 发送消息
  const handleSend = async () => {
    if (!inputText.trim() || !chatRoomId || isSending) return;

    setIsSending(true);
    try {
      // 解析提及的用户
      const mentionRegex = /@(\w+)/g;
      const mentions: string[] = [];
      let match;
      
      while ((match = mentionRegex.exec(inputText)) !== null) {
        const name_sid = match[1];
        const mentionedMember = members.find(member => member.name_sid === name_sid);
        if (mentionedMember) {
          mentions.push(mentionedMember._id);
        }
      }

      const messageData = {
        content: inputText.trim(),
        type: 'text' as const,
        mentions: mentions // 添加提及的用户ID列表
      };

      const response = await messageAPI.sendChatRoomMessage(chatRoomId as string, messageData);
      
      if (response && typeof response === 'object' && 'success' in response && response.success) {
        setInputText('');
        setShowMentionSuggestions(false);
        setMentionSuggestions([]);
        
        // 如果有提及的用户，通过Socket.IO发送通知
        if (mentions.length > 0 && socket) {
          mentions.forEach(userId => {
            socket.emit('user_mentioned', {
              chatRoomId,
              userId,
              message: inputText.trim(),
              mentionedBy: currentUser?._id
            });
          });
        }
      } else {
        Alert.alert('Error', 'Failed to send message');
      }
    } catch (error) {
      console.error('[ChatRoom] Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
    setIsSending(false);
  };

  // 处理@提及搜索
  const handleMentionSearch = useCallback((text: string, position: number) => {
    const beforeCursor = text.substring(0, position);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      setMentionQuery(query);
      
      // 搜索匹配的成员
      const suggestions = members
        .filter(member => 
          member.name_sid.toLowerCase().includes(query) ||
          member.name.toLowerCase().includes(query)
        )
        .map(member => ({
          ...member,
          displayText: `@${member.name_sid}`
        }))
        .slice(0, 5); // 限制显示5个建议
      
      setMentionSuggestions(suggestions);
      setShowMentionSuggestions(suggestions.length > 0);
    } else {
      setShowMentionSuggestions(false);
      setMentionSuggestions([]);
    }
  }, [members]);

  // 选择提及建议
  const selectMention = useCallback((suggestion: MentionSuggestion) => {
    const beforeMention = inputText.substring(0, cursorPosition).replace(/@\w*$/, '');
    const afterMention = inputText.substring(cursorPosition);
    const newText = beforeMention + suggestion.displayText + ' ' + afterMention;
    
    setInputText(newText);
    setShowMentionSuggestions(false);
    setMentionSuggestions([]);
    
    // 设置光标位置到提及后
    const newPosition = beforeMention.length + suggestion.displayText.length + 1;
    setCursorPosition(newPosition);
    
    // 聚焦到输入框
    setTimeout(() => {
      textInputRef.current?.focus();
      textInputRef.current?.setNativeProps({
        selection: { start: newPosition, end: newPosition }
      });
    }, 100);
  }, [inputText, cursorPosition]);

  // 处理文本输入变化
  const handleTextChange = useCallback((text: string) => {
    setInputText(text);
    handleMentionSearch(text, cursorPosition);
  }, [handleMentionSearch, cursorPosition]);

  // 处理光标位置变化
  const handleSelectionChange = useCallback((event: any) => {
    const position = event.nativeEvent.selection?.start || 0;
    setCursorPosition(position);
    handleMentionSearch(inputText, position);
  }, [inputText, handleMentionSearch]);

  // 处理附件菜单
  const handleAttachmentMenu = useCallback(() => {
    setShowAttachmentMenu(!showAttachmentMenu);
  }, [showAttachmentMenu]);

  // 关闭附件菜单
  const closeAttachmentMenu = useCallback(() => {
    setShowAttachmentMenu(false);
  }, []);

  // 处理选择图片
  const handleSelectImage = useCallback(async () => {
    setShowAttachmentMenu(false);
    // TODO: 实现图片选择功能
    Alert.alert('Coming Soon', 'Image selection feature will be available soon!');
  }, []);

  // 处理选择文件
  const handleSelectFile = useCallback(async () => {
    setShowAttachmentMenu(false);
    // TODO: 实现文件选择功能
    Alert.alert('Coming Soon', 'File selection feature will be available soon!');
  }, []);

  // 处理选择位置
  const handleSelectLocation = useCallback(async () => {
    setShowAttachmentMenu(false);
    // TODO: 实现位置选择功能
    Alert.alert('Coming Soon', 'Location sharing feature will be available soon!');
  }, []);

  // 处理录音
  const handleStartRecording = useCallback(async () => {
    setShowAttachmentMenu(false);
    setIsRecording(true);
    // TODO: 实现录音功能
    Alert.alert('Coming Soon', 'Voice recording feature will be available soon!');
    setTimeout(() => setIsRecording(false), 1000);
  }, []);

  // 处理输入框聚焦
  const handleInputFocus = useCallback(() => {
    // 输入框聚焦时滚动到最新消息
    setTimeout(() => {
      if (flatListRef.current && messages.length > 0) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    }, 300);
  }, [messages.length]);

  // 键盘监听
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
      
      // Android 键盘动画
      if (Platform.OS === 'android') {
        Animated.timing(keyboardAnimation, {
          toValue: event.endCoordinates.height,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
      
      // 键盘显示时滚动到最新消息
      setTimeout(() => {
        if (flatListRef.current && messages.length > 0) {
          flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
      }, 100);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
      
      // Android 键盘隐藏动画
      if (Platform.OS === 'android') {
        Animated.timing(keyboardAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [messages.length, keyboardAnimation]);

  // 初始化数据
  useEffect(() => {
    fetchChatRoomData();
    fetchMessages();
  }, [fetchChatRoomData, fetchMessages]);



  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const sender = item.senderId;
    if (!sender || !sender._id) return null;
    const isMyMessage = sender._id === currentUser?._id;
    const messageTime = new Date(item.createdAt).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // 处理提及的用户
    const renderMessageContent = (content: string) => {
      if (!content) return null;
      
      const mentionRegex = /@(\w+)/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = mentionRegex.exec(content)) !== null) {
        // 添加提及前的文本
        if (match.index > lastIndex) {
          parts.push(
            <Text key={`text-${lastIndex}`} style={{ 
              color: isMyMessage ? 'white' : 'black',
              textAlign: isMyMessage ? 'right' : 'left'
            }}>
              {content.substring(lastIndex, match.index)}
            </Text>
          );
        }
        
        // 添加提及的用户
        const name_sid = match[1];
        const mentionedMember = members.find(member => member.name_sid === name_sid);
        parts.push(
          <Text 
            key={`mention-${match.index}`} 
            style={{ 
              color: isMyMessage ? '#ffeb3b' : '#2196f3',
              fontWeight: 'bold',
              textAlign: isMyMessage ? 'right' : 'left'
            }}
          >
            {match[0]}
          </Text>
        );
        
        lastIndex = match.index + match[0].length;
      }
      
      // 添加剩余的文本
      if (lastIndex < content.length) {
        parts.push(
          <Text key={`text-${lastIndex}`} style={{ 
            color: isMyMessage ? 'white' : 'black',
            textAlign: isMyMessage ? 'right' : 'left'
          }}>
            {content.substring(lastIndex)}
          </Text>
        );
      }
      
      return parts.length > 0 ? parts : (
        <Text style={{ 
          color: isMyMessage ? 'white' : 'black',
          textAlign: isMyMessage ? 'right' : 'left'
        }}>
          {content}
        </Text>
      );
    };

    return (
      <View style={isMyMessage ? styles.myMessageRow : styles.theirMessageRow}> 
        {!isMyMessage && (
          <Avatar.Image 
            size={32} 
            source={{ uri: sender.avatar ? ImageService.getImageUrl(sender.avatar) : 'https://i.pravatar.cc/150?u=default' }} 
            style={styles.avatar} 
          />
        )}
        <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
          {!isMyMessage && (
            <Text style={styles.senderName}>{sender.name}</Text>
          )}
          <View style={styles.messageContent}>
            {renderMessageContent(item.content)}
            {item.isEdited && <Text style={styles.editedText}> (edited)</Text>}
          </View>
          <Text style={[styles.timestamp, { color: isMyMessage ? '#e0e0e0' : '#555' }]}> 
            {messageTime}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Loading..." />
        </Appbar.Header>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} onTouchStart={closeAttachmentMenu}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Avatar.Image 
          size={40} 
          source={{ 
            uri: chatRoom?.logo ? ImageService.getImageUrl(chatRoom.logo) : 'https://i.pravatar.cc/150?u=default' 
          }} 
        />
        <Appbar.Content 
          title={chatRoom?.name || 'Chatroom'} 
          subtitle={`${chatRoom?.members?.length || 0} members`} 
          titleStyle={styles.headerTitle} 
        />
        <View style={styles.headerActions}>
          {!isConnected && (
            <View style={styles.connectionIndicator}>
              <Text style={styles.connectionText}>Offline</Text>
            </View>
          )}

        <Appbar.Action icon="dots-vertical" onPress={() => {}} />
        </View>
      </Appbar.Header>

      {/* Web版本输入框 - 显示在顶部 */}
      {Platform.OS === 'web' && (
        <View style={styles.webInputContainer}>
          <View style={styles.inputContainer} onTouchStart={(e) => e.stopPropagation()}>
            <IconButton icon="plus" size={24} onPress={handleAttachmentMenu} />
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              value={inputText}
              onChangeText={handleTextChange}
              placeholder="Type a message..."
              multiline
              disabled={isSending}
              onSelectionChange={handleSelectionChange}
              onFocus={handleInputFocus}
              right={
                <TextInput.Icon 
                  icon={isSending ? "loading" : "send"} 
                  onPress={handleSend}
                  disabled={isSending}
                />
              }
            />
          </View>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item._id}
        style={styles.messageList}
        contentContainerStyle={{ padding: 8 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => {
              fetchChatRoomData();
              fetchMessages();
            }} 
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        )}
        inverted={Platform.OS !== 'web'}
      />

      {/* @提及建议列表 */}
      {showMentionSuggestions && mentionSuggestions.length > 0 && (
        <Surface style={styles.mentionSuggestionsContainer} elevation={4}>
          <ScrollView style={styles.mentionSuggestionsList}>
            {mentionSuggestions.map((suggestion) => (
              <Pressable
                key={suggestion._id}
                style={styles.mentionSuggestionItem}
                onPress={() => selectMention(suggestion)}
              >
                <Avatar.Image
                  size={32}
                  source={{
                    uri: suggestion.avatar
                      ? ImageService.getImageUrl(suggestion.avatar)
                      : 'https://i.pravatar.cc/150?u=default'
                  }}
                  style={styles.mentionAvatar}
                />
                <View style={styles.mentionInfo}>
                  <Text style={styles.mentionName}>{suggestion.name}</Text>
                  <Text style={styles.mentionSid}>{suggestion.displayText}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </Surface>
      )}

      {/* 附件菜单 */}
      {showAttachmentMenu && (
        <Surface style={styles.attachmentMenuContainer} elevation={4}>
          <View style={styles.attachmentMenu} onTouchStart={(e) => e.stopPropagation()}>
            <Pressable style={styles.attachmentMenuItem} onPress={handleSelectImage}>
              <View style={styles.attachmentIconContainer}>
                <Ionicons name="image" size={24} color="#2196f3" />
              </View>
              <Text style={styles.attachmentText}>Photo</Text>
            </Pressable>
            
            <Pressable style={styles.attachmentMenuItem} onPress={handleSelectFile}>
              <View style={styles.attachmentIconContainer}>
                <Ionicons name="document" size={24} color="#4caf50" />
              </View>
              <Text style={styles.attachmentText}>Document</Text>
            </Pressable>
            
            <Pressable style={styles.attachmentMenuItem} onPress={handleSelectLocation}>
              <View style={styles.attachmentIconContainer}>
                <Ionicons name="location" size={24} color="#ff9800" />
              </View>
              <Text style={styles.attachmentText}>Location</Text>
            </Pressable>
            
            <Pressable style={styles.attachmentMenuItem} onPress={handleStartRecording}>
              <View style={styles.attachmentIconContainer}>
                <Ionicons name="mic" size={24} color="#f44336" />
              </View>
              <Text style={styles.attachmentText}>Voice</Text>
            </Pressable>
          </View>
        </Surface>
      )}

      {/* 手机版本输入框 - 显示在底部 */}
      {Platform.OS !== 'web' && (
        <>
          {Platform.OS === 'ios' ? (
            <KeyboardAvoidingView
              behavior="padding"
              style={styles.keyboardView}
              keyboardVerticalOffset={-insets.top}
              enabled
            >
              <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]} onTouchStart={(e) => e.stopPropagation()}>
                <IconButton icon="plus" size={24} onPress={handleAttachmentMenu} />
                <TextInput
                  ref={textInputRef}
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={handleTextChange}
                  placeholder="Type a message..."
                  multiline
                  disabled={isSending}
                  onSelectionChange={handleSelectionChange}
                  onFocus={handleInputFocus}
                  right={
                    <TextInput.Icon 
                      icon={isSending ? "loading" : "send"} 
                      onPress={handleSend}
                      disabled={isSending}
                    />
                  }
                />
              </View>
            </KeyboardAvoidingView>
          ) : (
            <Animated.View style={[styles.keyboardView, { marginBottom: keyboardAnimation }]}>
              <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]} onTouchStart={(e) => e.stopPropagation()}>
                <IconButton icon="plus" size={24} onPress={handleAttachmentMenu} />
                <TextInput
                  ref={textInputRef}
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={handleTextChange}
                  placeholder="Type a message..."
                  multiline
                  disabled={isSending}
                  onSelectionChange={handleSelectionChange}
                  onFocus={handleInputFocus}
                  right={
                    <TextInput.Icon 
                      icon={isSending ? "loading" : "send"} 
                      onPress={handleSend}
                      disabled={isSending}
                    />
                  }
                />
              </View>
            </Animated.View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ece5dd' 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  header: { 
    backgroundColor: '#f9f9f9' 
  },
  headerTitle: { 
    fontWeight: 'bold' 
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionIndicator: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  connectionText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageList: { 
    flex: 1 
  },
  webInputContainer: {
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  keyboardView: {
    width: '100%',
    backgroundColor: '#f9f9f9',
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
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    maxWidth: '80%',
  },
  myMessageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    maxWidth: '90%',
    alignSelf: 'flex-end',
  },
  theirMessageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    flexShrink: 1,
  },
  messageContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  myMessage: {
    backgroundColor: Colors.light.tint,
    alignSelf: 'flex-end',
    borderTopRightRadius: 5,
    alignItems: 'flex-end',
  },
  theirMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 5,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 2,
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
  },
  editedText: {
    fontSize: 10,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  mentionSuggestionsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
    zIndex: 1000,
  },
  mentionSuggestionsList: {
    maxHeight: 200,
  },
  mentionSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  mentionAvatar: {
    marginRight: 12,
  },
  mentionInfo: {
    flex: 1,
  },
  mentionName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  mentionSid: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  attachmentMenuContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderColor: '#ddd',
    zIndex: 1000,
  },
  attachmentMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  attachmentMenuItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    minWidth: 80,
  },
  attachmentIconContainer: {
    marginBottom: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  attachmentText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
}); 