import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Avatar, Surface, ActivityIndicator, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessageContext';
import { formatDistanceToNow } from 'date-fns';
import { chatRoomAPI } from '../../services/api';
import { ChatRoom } from '../../../shared/types/club';
import { ImageService } from '../../services/imageService';
import { Colors } from '../../../constants/Colors';

const { width: screenWidth } = Dimensions.get('window');

// 前端扩展的ChatRoom类型，用于消息页面显示
interface ChatRoomDisplay {
  _id: string;
  club: {
    _id: string;
    name: string;
    logo?: string;
  };
  name: string;
  logo?: string;
  type: 'club' | 'group' | 'activity' | 'other';
  members: string[];
  messages: any[];
  lastMessage?: {
    sender: string;
    content: string;
    type: string;
    timestamp: string;
  };
  lastMessageId?: {
    _id: string;
    content: string;
    type: string;
    timestamp: string;
    senderId: {
      _id: string;
      name: string;
      avatar?: string;
    };
  };
  lastMessageTime?: string;
  maxMembers: number;
  autoDeleteDuration: number;
  createdAt: string;
  updatedAt: string;
  isUnread?: boolean;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'chatroom', label: 'Chatroom' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'hello', label: 'Hello!' },
  { key: 'request', label: 'Request' },
];

export default function MessagesScreen() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuth();
  const { messages, loading, error, getMessages } = useMessages();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [chatRooms, setChatRooms] = useState<ChatRoomDisplay[]>([]);
  const [loadingChatRooms, setLoadingChatRooms] = useState(false);
  const [combinedList, setCombinedList] = useState<ChatRoomDisplay[]>([]);

  const userId = currentUser?._id;

  const fetchChatRooms = useCallback(async () => {
    if (!userId) {
      // console.log('[UI] No userId, skipping fetchChatRooms.');
      return;
    }
    setLoadingChatRooms(true);
    setRefreshing(true);
    try {
      // console.log(`[UI] Fetching chatrooms for userId: ${userId}`);
      const response = await chatRoomAPI.getUserChatRooms(userId);
      // console.log('[UI] chatRoomAPI.getUserChatRooms 返回值:', JSON.stringify(response, null, 2));

      let chatRoomList: ChatRoomDisplay[] = [];
      if (response && typeof response === 'object' && 'success' in response && response.success) {
        chatRoomList = (response as any).data || [];
      } else if (Array.isArray(response)) {
        chatRoomList = response;
      }
      // console.log('[UI] 处理后的chatRoomList:', JSON.stringify(chatRoomList, null, 2));
      setChatRooms(chatRoomList);
    } catch (e) {
      console.error('[UI] Error fetching chatrooms:', e);
    }
    setLoadingChatRooms(false);
    setRefreshing(false);
  }, [userId]);

  useEffect(() => {
    if (isAuthenticated) {
      getMessages();
      fetchChatRooms();
    }
  }, [isAuthenticated, getMessages, userId]);

  useEffect(() => {
    const allItems = [...chatRooms].sort((a, b) => {
      const timeA = new Date(a.lastMessageTime || a.lastMessageId?.timestamp || a.lastMessage?.timestamp || 0);
      const timeB = new Date(b.lastMessageTime || b.lastMessageId?.timestamp || b.lastMessage?.timestamp || 0);
      return timeB.getTime() - timeA.getTime();
    });
    setCombinedList(allItems);
  }, [chatRooms, messages]);

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

  // 为UI演示目的，扩展Message类型为any，避免类型报错，真实数据结构需后续完善
  const filteredMessages = (messages as any[]).filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'contacts') return item.type === 'CHAT' && !item.clubLogo;
    if (filter === 'hello') return item.type === 'CHAT' && item.isHello; // 这里isHello为UI层自定义字段
    if (filter === 'request') return item.type === 'JOIN_REQUEST';
    if (filter === 'chatroom') return !!item.clubLogo;
    return true;
  });

  const renderItem = ({ item }: { item: ChatRoomDisplay }) => {
    const isChatRoom = !!item.lastMessageId || item.type === 'club' || item.type === 'group' || item.type === 'activity';
    
    // 安全的时间格式化函数
    const formatTime = (timestamp: any) => {
      if (!timestamp) return '--';
      try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return '--';
        return formatDistanceToNow(date, { addSuffix: true });
      } catch (error) {
        console.warn('Invalid timestamp:', timestamp, error);
        return '--';
      }
    };

    // 获取logo URL的逻辑
    const getLogoUrl = (item: ChatRoomDisplay) => {
      // console.log('[UI] getLogoUrl - item:', JSON.stringify({
      //   id: item._id,
      //   name: item.name,
      //   logo: item.logo,
      //   clubLogo: item.club?.logo,
      //   senderAvatar: item.lastMessageId?.senderId?.avatar
      // }, null, 2));
      
      // 优先使用聊天室自己的logo
      if (item.logo) {
        const fullUrl = ImageService.getImageUrl(item.logo);
        // console.log('[UI] 使用聊天室logo:', fullUrl);
        return fullUrl;
      }
      // 使用俱乐部的logo
      if (item.club?.logo) {
        const fullUrl = ImageService.getImageUrl(item.club.logo);
        // console.log('[UI] 使用俱乐部logo:', fullUrl);
        return fullUrl;
      }
      // 最后使用发送者头像作为备选
      if (item.lastMessageId?.senderId?.avatar) {
        const fullUrl = ImageService.getImageUrl(item.lastMessageId.senderId.avatar);
        // console.log('[UI] 使用发送者头像:', fullUrl);
        return fullUrl;
      }
      // 默认头像
      // console.log('[UI] 使用默认头像');
      return 'https://i.pravatar.cc/150?u=default';
    };
    
    return (
      <TouchableOpacity onPress={() => isChatRoom && router.push(`/messages/${item._id}`)}>
        <Surface style={styles.messageCard} elevation={1}>
          <View style={styles.messageHeader}>
            <Avatar.Image size={40} source={{ uri: getLogoUrl(item) }} />
            <View style={styles.messageInfo}>
              <View style={styles.nameTimeRow}>
                <Text variant="titleMedium" style={styles.chatroomName}>
                  {item.name || item.club?.name || 'Unknown'}
                </Text>
                <Text variant="bodySmall" style={styles.timestamp}>
                  {formatTime(item.lastMessageTime || item.lastMessageId?.timestamp || item.lastMessage?.timestamp)}
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.messageContent} numberOfLines={1}>
                {item.lastMessageId?.content || item.lastMessage?.content || 'No content'}
              </Text>
            </View>
            {/* 新消息蓝点 */}
            {item.isUnread && <View style={styles.unreadDot} />}
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 顶部标题 */}
      <Text variant="headlineMedium" style={styles.title}>Chat!</Text>
      {/* Filter 按钮横向排列 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* 消息列表 */}
      <FlatList
        data={combinedList}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={refreshing || loadingChatRooms}
        onRefresh={fetchChatRooms}
        refreshControl={<RefreshControl refreshing={refreshing || loadingChatRooms} onRefresh={fetchChatRooms} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text variant="titleMedium">No messages yet</Text>
            <Text variant="bodyMedium">Start a conversation or join a club chatroom!</Text>
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
    alignItems: 'flex-start',
  },
  title: {
    marginTop: 32,
    marginBottom: 12,
    fontWeight: 'bold',
    color: Colors.light.tint,
    alignSelf: 'center',
  },
  filterBar: {
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row',
    marginBottom: 8,
    marginTop: 4,
    alignSelf: 'center',
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 4,
  },
  filterBtnActive: {
    backgroundColor: Colors.light.tint,
  },
  filterText: {
    color: Colors.light.tint,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 8,
    paddingTop: 0,
  },
  messageCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    minHeight: 70,
    width: screenWidth,  // 屏幕宽度
    // 其他宽度选项：
    // width: '100%',           // 占满父容器宽度
    // width: screenWidth * 0.95, // 屏幕宽度的95%
    // width: screenWidth * 0.85, // 屏幕宽度的85%
    // width: screenWidth - 40,   // 屏幕宽度减去40px边距
    alignSelf: 'flex-start',       // 居中对齐
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageInfo: {
    marginLeft: 8,
    flex: 1,
  },
  nameTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  chatroomName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  timestamp: {
    color: '#666',
    fontSize: 11,
  },
  messageContent: {
    color: '#666',
    fontSize: 12,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2d7cff',
    marginLeft: 6,
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
}); 