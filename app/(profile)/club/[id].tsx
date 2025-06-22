import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, IconButton, Avatar, TextInput, Divider, ActivityIndicator, Modal, Portal } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../app/context/AuthContext';
import { clubApi } from '../../../shared/api/club';
import { UserApi } from '../../../shared/api/user';
import { ImageService } from '../../services/imageService';
import { getInitials } from '../../utils/textUtils';
import type { Club } from '../../../shared/types/club';
import type { User } from '../../../shared/types/user-unified';
import { MaterialIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const ExpandableText = ({ text, initialLines = 2 }: { text: string | string[]; initialLines?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
      <Text style={styles.section2_bodyText} numberOfLines={isExpanded ? undefined : initialLines}>
        {Array.isArray(text) ? text.join('\n') : text}
      </Text>
    </TouchableOpacity>
  );
};

type SearchResult = {
    _id: string;
    name: string;
    name_sid: string;
    avatar?: string;
};

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSource, setSearchSource] = useState<'admin' | 'member' | null>(null);
  const [isAddAdminModalVisible, setAddAdminModalVisible] = useState(false);
  const [isAddMemberModalVisible, setAddMemberModalVisible] = useState(false);
  
  // 编辑和查看模态窗口状态
  const [isEditDescriptionModalVisible, setEditDescriptionModalVisible] = useState(false);
  const [isEditRulesModalVisible, setEditRulesModalVisible] = useState(false);
  const [isViewDescriptionModalVisible, setViewDescriptionModalVisible] = useState(false);
  const [isViewRulesModalVisible, setViewRulesModalVisible] = useState(false);
  
  // 编辑内容状态
  const [editDescription, setEditDescription] = useState('');
  const [editRules, setEditRules] = useState('');
  
  // 图片上传状态
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  // 获取俱乐部详情
  const fetchClubDetails = async () => {
    if (!id) {
      setError('No club ID provided');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const response = await clubApi.getClub(id as string);
      
      if (response.success && response.data) {
        setClub(response.data);
      } else {
        setError(response.error || 'Failed to load club details');
      }
    } catch (err: any) {
      // 提供更详细的错误信息
      let errorMessage = 'Failed to load club details';
      if (err.message) {
        if (err.message.includes('500')) {
          errorMessage = 'Server error: The club data could not be retrieved. Please try again later.';
        } else if (err.message.includes('404')) {
          errorMessage = 'Club not found: The requested club does not exist.';
        } else if (err.message.includes('401')) {
          errorMessage = 'Authentication required: Please log in to view this club.';
        } else if (err.message.includes('403')) {
          errorMessage = 'Access denied: You do not have permission to view this club.';
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 搜索用户
  const handleSearch = async (query: string, source: 'admin' | 'member') => {
    if (query.length < 2) {
      setUserSearchResults([]);
      return;
    }
    setSearchSource(source);
    try {
      const results = await UserApi.searchUsers(query);
      setUserSearchResults(results);
    } catch (error) {
      console.error('Failed to search users:', error);
      setUserSearchResults([]);
    }
  };

  // 添加管理员
  const handleAddAdmin = async (user: SearchResult) => {
    if (!club?._id) return;
    try {
      await clubApi.addAdmin(club._id, user._id);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to add admin', error);
    }
  };

  // 移除管理员
  const handleRemoveAdmin = async (adminId: string) => {
    if (!club?._id) return;
    Alert.alert(
      "Remove Admin",
      "Are you sure you want to remove this admin?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              await clubApi.removeAdmin(club._id, adminId);
              setRefreshKey(prev => prev + 1);
            } catch (error) {
              console.error('Failed to remove admin', error);
            }
          },
        },
      ]
    );
  };

  // 添加成员
  const handleAddMember = async (user: SearchResult) => {
    if (!club?._id) return;
    try {
      await clubApi.addMember(club._id, user._id);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to add member', error);
    }
  };

  // 移除成员
  const handleRemoveMember = async (memberId: string) => {
    if (!club?._id) return;
    Alert.alert(
      "Remove Member",
      "Are you sure you want to remove this member?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              await clubApi.removeMember(club._id, memberId);
              setRefreshKey(prev => prev + 1);
            } catch (error) {
              console.error('Failed to remove member', error);
            }
          },
        },
      ]
    );
  };

  // 处理封面图片上传
  const handlePickAndUploadCover = async () => {
    if (!club) return;
    
    try {
      const image = await ImageService.pickImage({ 
        aspect: [4, 3], // 封面图片比例改为4:3，更适合移动端显示
        quality: 0.8 
      });
      if (!image) return;

      setIsUploadingCover(true);
      const url = await ImageService.uploadClubCover(image.uri, club._id);
      
      // 更新本地状态
      setClub(prev => prev ? { ...prev, coverImage: url } : null);
      
      // 重新获取俱乐部数据以确保数据同步
      setTimeout(() => {
        fetchClubDetails();
      }, 500);
      
      Alert.alert('Success', 'Cover image uploaded successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload cover image');
    } finally {
      setIsUploadingCover(false);
    }
  };

  // 处理logo图片上传
  const handlePickAndUploadLogo = async () => {
    if (!club) return;
    
    try {
      const image = await ImageService.pickImage({ 
        aspect: [1, 1], // logo图片比例
        quality: 0.8 
      });
      if (!image) return;

      setIsUploadingLogo(true);
      const url = await ImageService.uploadClubLogo(image.uri, club._id);
      
      // 更新本地状态
      setClub(prev => prev ? { ...prev, logo: url } : null);
      
      // 重新获取俱乐部数据以确保数据同步
      setTimeout(() => {
        fetchClubDetails();
      }, 500);
      
      Alert.alert('Success', 'Logo uploaded successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // 处理描述编辑
  const handleEditDescription = () => {
    setEditDescription(club?.description || '');
    setEditDescriptionModalVisible(true);
  };

  // 保存描述
  const handleSaveDescription = async () => {
    if (!club?._id) return;
    
    try {
      const formData = new FormData();
      formData.append('description', editDescription);
      await clubApi.updateClub(club._id, formData);
      setClub(prev => prev ? { ...prev, description: editDescription } : null);
      setEditDescriptionModalVisible(false);
      Alert.alert('Success', 'Description updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update description');
    }
  };

  // 处理规则编辑
  const handleEditRules = () => {
    setEditRules(Array.isArray(club?.rules) ? club.rules.join('\n') : (club?.rules || ''));
    setEditRulesModalVisible(true);
  };

  // 保存规则
  const handleSaveRules = async () => {
    if (!club?._id) return;
    
    try {
      const rulesArray = editRules.split('\n').filter(rule => rule.trim() !== '');
      const formData = new FormData();
      formData.append('rules', JSON.stringify(rulesArray));
      await clubApi.updateClub(club._id, formData);
      setClub(prev => prev ? { ...prev, rules: rulesArray } : null);
      setEditRulesModalVisible(false);
      Alert.alert('Success', 'Rules updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update rules');
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    if (currentUser && id) {
      fetchClubDetails();
    }
  }, [currentUser, id, refreshKey]);

  // 权限判断
  const isFounder = club?.founder?._id === currentUser?._id;
  const isAdmin = club?.admins?.some(admin => admin._id === currentUser?._id) || false;
  const canManage = isFounder || isAdmin;

  // 条件性成员列表组件
  const ConditionalMemberList = ({ 
    members, 
    onRemove, 
    canRemove 
  }: { 
    members: any[]; 
    onRemove: (id: string) => void; 
    canRemove: boolean;
  }) => {
    const memberItems = members.map(member => (
      <View key={member._id} style={styles.memberItem}>
        <View style={styles.memberInfo}>
          {member.avatar ? (
            <Avatar.Image 
              size={32} 
              source={{ uri: ImageService.getImageUrl(member.avatar) }} 
            />
          ) : (
            <Avatar.Text 
              size={32} 
              label={getInitials(member.name_sid)} 
            />
          )}
          <Text style={styles.memberName}>{member.name_sid}</Text>
        </View>
        {club?.founder._id !== member._id && canRemove && (
          <TouchableOpacity 
            onPress={() => onRemove(member._id)}
            style={styles.removeButton}
          >
            <MaterialIcons name="close" size={16} color="#E53935" />
          </TouchableOpacity>
        )}
      </View>
    ));

    // 如果成员数量超过3个，使用ScrollView
    if (members.length > 3) {
      return (
        <ScrollView 
          style={styles.memberList} 
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {memberItems}
        </ScrollView>
      );
    }

    // 否则使用普通View
    return (
      <View style={styles.memberList}>
        {memberItems}
      </View>
    );
  };

  if (!currentUser) {
    return (
      <View style={styles.centered}>
        <Text>Please log in to view this club</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading club details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Error: {error}</Text>
        <Button mode="contained" onPress={fetchClubDetails} style={{ marginTop: 10 }}>
          Retry
        </Button>
      </View>
    );
  }

  if (!club) {
    return (
      <View style={styles.centered}>
        <Text>Club not found</Text>
      </View>
    );
  }

  return (
    <>
      <Portal>
        {/* Add Admin Modal */}
        <Modal visible={isAddAdminModalVisible} onDismiss={() => setAddAdminModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Admin</Text>
            <IconButton icon="close" onPress={() => setAddAdminModalVisible(false)} />
          </View>
          <TextInput
            label="Search user by SID..."
            value={adminSearchQuery}
            onChangeText={(text) => {
              setAdminSearchQuery(text);
              handleSearch(text, 'admin');
            }}
            style={{ marginBottom: 10 }}
          />
          <ScrollView>
            {userSearchResults.map(user => {
              const isAlreadyAdmin = club.admins.some(a => a._id === user._id);
              return (
                <View key={user._id} style={styles.searchResultItem}>
                  <Text style={styles.searchResultText}>{user.name_sid}</Text>
                  <IconButton
                    icon={isAlreadyAdmin ? "check-circle" : "plus-circle"}
                    size={24}
                    onPress={() => handleAddAdmin(user)}
                    disabled={isAlreadyAdmin}
                  />
                </View>
              );
            })}
          </ScrollView>
        </Modal>

        {/* Add Member Modal */}
        <Modal visible={isAddMemberModalVisible} onDismiss={() => setAddMemberModalVisible(false)} contentContainerStyle={styles.modalContainer}>
           <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Member</Text>
            <IconButton icon="close" onPress={() => setAddMemberModalVisible(false)} />
          </View>
          <TextInput
            label="Search user by SID..."
            value={memberSearchQuery}
            onChangeText={(text) => {
              setMemberSearchQuery(text);
              handleSearch(text, 'member');
            }}
            style={{ marginBottom: 10 }}
          />
          <ScrollView>
            {userSearchResults.map(user => {
              const isAlreadyMember = club.members.some(m => m._id === user._id);
              return (
                <View key={user._id} style={styles.searchResultItem}>
                  <Text style={styles.searchResultText}>{user.name_sid}</Text>
                  <IconButton
                    icon={isAlreadyMember ? "check-circle" : "plus-circle"}
                    size={24}
                    onPress={() => handleAddMember(user)}
                    disabled={isAlreadyMember}
                  />
                </View>
              );
            })}
          </ScrollView>
        </Modal>
      </Portal>

      {/* Edit Description Modal */}
      <Portal>
        <Modal visible={isEditDescriptionModalVisible} onDismiss={() => setEditDescriptionModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Club Description</Text>
            <IconButton icon="close" onPress={() => setEditDescriptionModalVisible(false)} />
          </View>
          <TextInput
            label="Description"
            value={editDescription}
            onChangeText={setEditDescription}
            multiline
            numberOfLines={6}
            style={{ marginBottom: 20 }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button mode="outlined" onPress={() => setEditDescriptionModalVisible(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleSaveDescription}>
              Save
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Edit Rules Modal */}
      <Portal>
        <Modal visible={isEditRulesModalVisible} onDismiss={() => setEditRulesModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Club Rules</Text>
            <IconButton icon="close" onPress={() => setEditRulesModalVisible(false)} />
          </View>
          <TextInput
            label="Rules (one per line)"
            value={editRules}
            onChangeText={setEditRules}
            multiline
            numberOfLines={8}
            style={{ marginBottom: 20 }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button mode="outlined" onPress={() => setEditRulesModalVisible(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleSaveRules}>
              Save
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* View Description Modal */}
      <Portal>
        <Modal visible={isViewDescriptionModalVisible} onDismiss={() => setViewDescriptionModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Club Description</Text>
            <IconButton icon="close" onPress={() => setViewDescriptionModalVisible(false)} />
          </View>
          <ScrollView style={{ maxHeight: 300 }}>
            <Text style={{ fontSize: 16, lineHeight: 24 }}>
              {club?.description || 'No description available'}
            </Text>
          </ScrollView>
        </Modal>
      </Portal>

      {/* View Rules Modal */}
      <Portal>
        <Modal visible={isViewRulesModalVisible} onDismiss={() => setViewRulesModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Club Rules</Text>
            <IconButton icon="close" onPress={() => setViewRulesModalVisible(false)} />
          </View>
          <ScrollView style={{ maxHeight: 300 }}>
            {Array.isArray(club?.rules) && club.rules.length > 0 ? (
              club.rules.map((rule, index) => (
                <Text key={index} style={{ fontSize: 16, lineHeight: 24, marginBottom: 10 }}>
                  {index + 1}. {rule}
                </Text>
              ))
            ) : (
              <Text style={{ fontSize: 16, lineHeight: 24 }}>
                No rules available
              </Text>
            )}
          </ScrollView>
        </Modal>
      </Portal>

      <ScrollView style={styles.container}>
        {/* Section 1: Cover Image */}
        <View style={styles.section1}>
          {club.coverImage && (
            <Image 
              source={{ 
                uri: ImageService.getImageUrl(club.coverImage),
              }} 
              style={styles.section1_coverImage} 
              resizeMode="cover" 
            />
          )}
          {isAdmin && (
            <IconButton 
              icon={isUploadingCover ? "loading" : "pencil"} 
              style={styles.section1_editIcon} 
              size={24} 
              onPress={handlePickAndUploadCover}
              disabled={isUploadingCover}
            />
          )}
          <View style={styles.section1_nameContainer}>
            <Text style={styles.section1_clubName}>{club.name}</Text>
            {isAdmin && (
               <IconButton icon="pencil" size={18} onPress={() => { /* 编辑名称 */ }} iconColor="#fff"/>
            )}
          </View>
        </View>

        {/* Section 2: Club Info */}
        <View style={styles.section2}>
          <View style={styles.section2_header}>
            <View style={styles.section2_logoContainer}>
              {club.logo ? (
                <TouchableOpacity onPress={isAdmin ? handlePickAndUploadLogo : undefined}>
                  <Avatar.Image 
                    size={100} 
                    source={{ 
                      uri: ImageService.getImageUrl(club.logo),
                    }} 
                  />
                  {isAdmin && (
                    <View style={styles.logoEditOverlay}>
                      {isUploadingLogo ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <IconButton icon="pencil" size={16} iconColor="#fff" />
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={isAdmin ? handlePickAndUploadLogo : undefined}>
                  <View style={styles.logoPlaceholder}>
                    {isAdmin && (
                      <IconButton icon="plus" size={24} iconColor="#666" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              <Text style={styles.section2_clubId}>@{club.clubId}</Text>
            </View>
            <View style={styles.section2_founderContainer}>
              {club.founder.avatar ? (
                <Avatar.Image 
                  size={50} 
                  source={{ uri: ImageService.getImageUrl(club.founder.avatar) }} 
                />
              ) : (
                <Avatar.Text 
                  size={50} 
                  label={getInitials(club.founder.name_sid)} 
                />
              )}
              <Text style={styles.section2_founderName}>{club.founder.name_sid}</Text>
            </View>
          </View>
          <Divider style={{ backgroundColor: '#fff', marginVertical: 15 }} />
          <View style={styles.section2_details}>
              <View style={styles.section2_detailItem}>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                      <Text style={styles.section2_title}>Club Description</Text>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                          <IconButton 
                            icon="magnify" 
                            size={16} 
                            iconColor="#fff" 
                            onPress={() => setViewDescriptionModalVisible(true)}
                          />
                          {isAdmin && (
                            <IconButton 
                              icon="pencil" 
                              size={16} 
                              iconColor="#fff" 
                              onPress={handleEditDescription}
                            />
                          )}
                      </View>
                  </View>
                  <Text style={styles.section2_bodyText} numberOfLines={2}>
                    {club.description || 'No description available'}
                  </Text>
              </View>
               <View style={styles.section2_detailItem}>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                      <Text style={styles.section2_title}>Club Rule</Text>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                          <IconButton 
                            icon="magnify" 
                            size={16} 
                            iconColor="#fff" 
                            onPress={() => setViewRulesModalVisible(true)}
                          />
                          {isAdmin && (
                            <IconButton 
                              icon="pencil" 
                              size={16} 
                              iconColor="#fff" 
                              onPress={handleEditRules}
                            />
                          )}
                      </View>
                  </View>
                  <Text style={styles.section2_bodyText} numberOfLines={2}>
                    {Array.isArray(club.rules) ? club.rules.join(', ') : (club.rules || 'No rules available')}
                  </Text>
              </View>
          </View>
        </View>

        {/* Section 3: Members & Actions */}
        <View style={styles.section3}>
          {/* Admin Management */}
          {isFounder && (
              <View style={styles.section3_managementBlock}>
                  <Text style={styles.section3_title}>Admins ({club.admins.length})</Text>
                  {/* 管理员列表 - 滚动视图 */}
                  <ConditionalMemberList 
                    members={club.admins} 
                    onRemove={handleRemoveAdmin} 
                    canRemove={isFounder}
                  />
                  <Button 
                      mode="contained" 
                      icon="plus" 
                      onPress={() => setAddAdminModalVisible(true)}
                      style={{ marginTop: 10 }}
                    >
                      Add Admin
                    </Button>
              </View>
          )}
          
          {/* Member Management */}
          {isAdmin && (
              <View style={styles.section3_managementBlock}>
                  <Text style={styles.section3_title}>Members ({club.members.length})</Text>
                  {/* 成员列表 - 滚动视图 */}
                  <ConditionalMemberList 
                    members={club.members} 
                    onRemove={handleRemoveMember} 
                    canRemove={isAdmin}
                  />
                  <Button 
                      mode="contained" 
                      icon="plus" 
                      onPress={() => setAddMemberModalVisible(true)}
                      style={{ marginTop: 10 }}
                    >
                      Add Member
                    </Button>
              </View>
          )}

          {/* Action Buttons */}
          <View style={styles.section3_actions}>
            <Button mode="contained" style={styles.section3_button}>Suggestion</Button>
            <Button mode="contained" style={[styles.section3_button, {backgroundColor: '#B71C1C'}]}>Leave</Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Section 1
  section1: {
    width: screenWidth,
    height: 300,
    backgroundColor: '#000',
  },
  section1_coverImage: {
    width: '100%',
    height: '100%',
  },
  section1_editIcon: {
    position: 'absolute',
    top: 40,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  section1_nameContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  section1_clubName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Section 2
  section2: {
    width: screenWidth,
    height: 320,
    backgroundColor: '#09453E',
    padding: 20,
  },
  section2_header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  section2_logoContainer: {
    alignItems: 'center',
  },
  section2_clubId: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 5,
  },
  section2_founderContainer: {
    alignItems: 'center',
  },
  section2_founderName: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  section2_details: {
      flex: 1,
  },
  section2_detailItem: {
      marginBottom: 10,
  },
  section2_title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  section2_bodyText: {
    color: '#eee',
    fontSize: 14,
    lineHeight: 18,
  },
  // Logo 相关样式
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#666',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEditOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Section 3
  section3: {
    width: screenWidth,
    minHeight: 450,
    backgroundColor: '#90CAF9',
    padding: 20,
  },
  section3_managementBlock: {
    height: 280,
    marginBottom: 20,
  },
  section3_title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
  },
  section3_inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
  },
  section3_input: {
      flex: 1,
      height: 40,
  },
  section3_actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  section3_button: {
    width: 130,
    height: 45,
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  // 搜索结果样式
  searchResults: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 5,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-between',
  },
  searchResultText: {
    marginLeft: 10,
    fontSize: 14,
  },
  // 成员列表样式
  memberList: {
    maxHeight: 200,
    minHeight: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 5,
    marginBottom: 10,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  removeButton: {
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E53935',
    marginLeft: -20,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Modal styles
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 