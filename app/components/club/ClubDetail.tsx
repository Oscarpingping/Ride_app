import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Surface, Text, Avatar, Button, Chip, IconButton, Portal, Modal, TextInput } from 'react-native-paper';
import type { Club } from '../../../shared/types/club';
import { useAuth } from '../../context/AuthContext';
import { ClubModals } from './ClubModals';
import { useClubModal } from '../../context/ClubModalContext';

interface ClubDetailProps {
  club: Club;
  onRefresh?: () => void;
}

export function ClubDetail({ club, onRefresh }: ClubDetailProps) {
  const { currentUser } = useAuth();
  const { modalType, modalProps, openModal, closeModal } = useClubModal();
  const [isLoading, setIsLoading] = useState(false);

  // 权限判断兼容 _id 和 userId
  const getId = (user: any) => user?._id || user?.userId;
  
  const isAdmin = getId(currentUser) === getId(club.founder) || club.admins.some(admin => getId(admin) === getId(currentUser));
  const isMember = club.members.some(member => getId(member) === getId(currentUser));

  console.log('currentUser:', currentUser);
  console.log('club.founder:', club.founder);
  console.log('club.founder_id:', club.founder._id);
  console.log('club.founder_userId:', club.founder.userId);
  const handleEditClub = () => {
    openModal('UPDATE_COVER', { club });
  };

  const handleManageAdmins = () => {
    openModal('MANAGE_ADMINS', { club });
  };

  const handleManageMembers = () => {
    openModal('MANAGE_MEMBERS', { club });
  };

  const handleJoinRequest = () => {
    openModal('HANDLE_JOIN_REQUESTS', { club });
  };

  return (
    <ScrollView style={styles.container}>
      {/* 封面图片 */}
      <View style={styles.coverContainer}>
        <Image
          source={club.coverImage ? { uri: club.coverImage } : require('../../../assets/default-cover.png')}
          style={styles.coverImage}
        />
        {isAdmin && (
          <IconButton
            icon="pencil"
            size={20}
            style={styles.editButton}
            onPress={handleEditClub}
          />
        )}
      </View>

      {/* 俱乐部基本信息 */}
      <Surface style={styles.infoCard} elevation={2}>
        <View style={styles.header}>
          <Avatar.Image
            size={80}
            source={club.logo ? { uri: club.logo } : require('../../../assets/default-logo.png')}
          />
          <View style={styles.headerInfo}>
            <Text variant="headlineMedium" style={styles.clubName}>{club.name}</Text>
            <Text variant="bodyMedium" style={styles.clubId}>ID: {club.clubId}</Text>
            {club.location && (
              <View style={styles.location}>
                <IconButton icon="map-marker" size={16} />
                <Text variant="bodyMedium">{`${club.location.city}, ${club.location.country}`}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 俱乐部统计信息 */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text variant="titleLarge">{club.stats.memberCount}</Text>
            <Text variant="bodySmall">Members</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="titleLarge">{club.stats.activityCount || 0}</Text>
            <Text variant="bodySmall">Activities</Text>
          </View>
        </View>

        {/* 俱乐部描述 */}
        {club.description && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>About</Text>
            <Text variant="bodyMedium">{club.description}</Text>
          </View>
        )}

        {/* 创始人信息 */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Founder</Text>
          <View style={styles.founder}>
            <Avatar.Text
              size={48}
              label={club.founder.name_sid.split(' ').map(n => n[0]).join('')}
            />
            <View style={styles.founderInfo}>
              <Text variant="titleMedium">{club.founder.name_sid}</Text>
              <Text variant="bodySmall">Founder</Text>
            </View>
          </View>
        </View>

        {/* 管理员列表 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Admins</Text>
            {isAdmin && (
              <IconButton
                icon="account-plus"
                size={20}
                onPress={handleManageAdmins}
              />
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {club.admins.map(admin => (
              <View key={admin.userId} style={styles.member}>
                <Avatar.Text
                  size={40}
                  label={admin.name_sid.split(' ').map(n => n[0]).join('')}
                />
                <Text variant="bodySmall" numberOfLines={1}>{admin.name_sid}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 成员列表 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Members</Text>
            {isAdmin && (
              <IconButton
                icon="account-plus"
                size={20}
                onPress={handleManageMembers}
              />
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {club.members.map(member => (
              <View key={member.userId} style={styles.member}>
                <Avatar.Text
                  size={40}
                  label={member.name_sid.split(' ').map(n => n[0]).join('')}
                />
                <Text variant="bodySmall" numberOfLines={1}>{member.name_sid}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 操作按钮 */}
        {!isMember && (
          <Button
            mode="contained"
            onPress={handleJoinRequest}
            style={styles.joinButton}
            loading={isLoading}
          >
            Join Club
          </Button>
        )}
      </Surface>

      {/* 模态框组件 */}
      <ClubModals
        visible={!!modalType}
        type={modalType}
        onDismiss={closeModal}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  coverContainer: {
    position: 'relative',
    height: 200,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  clubName: {
    marginBottom: 4,
  },
  clubId: {
    color: '#666',
    marginBottom: 4,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  stat: {
    alignItems: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  founder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  founderInfo: {
    marginLeft: 12,
  },
  member: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  joinButton: {
    marginTop: 16,
  },
}); 