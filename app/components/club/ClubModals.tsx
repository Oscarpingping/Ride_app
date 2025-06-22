import React, { useState } from 'react';
import { Modal, Portal, Button, Text, TextInput, List } from 'react-native-paper';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import type { Club } from '../../../shared/types/club';
import { ClubModalType } from '../../context/ClubModalContext';
import { useAuth } from '../../context/AuthContext';
import { clubApi } from '../../../shared/api/club';
import { UserApi } from '../../../shared/api/user';
import type { User } from '../../../shared/types/user-unified';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from 'react-native-paper';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { ImageService } from '../../../app/services/imageService';

interface ClubModalsProps {
  visible: boolean;
  type: ClubModalType | null;
  club: Club;
  onDismiss: () => void;
  onUpdate: (updatedClub: Club) => void;
}

export const ClubModals: React.FC<ClubModalsProps> = ({
  visible,
  type,
  club,
  onDismiss,
  onUpdate,
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editedClub, setEditedClub] = useState<Partial<Club>>({});
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editError, setEditError] = useState('');

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'UPDATE_LOGO' ? [1, 1] : [16, 9],
        quality: 1,
      });
      if (!result.canceled) {
        let uri = result.assets[0].uri;
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists && fileInfo.size && fileInfo.size > 2 * 1024 * 1024) {
          const isPng = uri.toLowerCase().endsWith('.png');
          const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1280 } }],
            { compress: 0.8, format: isPng ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG }
          );
          uri = manipResult.uri;
        }
        setSelectedImage(uri);
      }
    } catch (error) {
      setUploadError('Failed to pick image.');
    }
  };

  const handleImageUpload = async (type: 'club-logo' | 'club-cover') => {
    console.log('[handleImageUpload] called, type:', type, 'selectedImage:', selectedImage);
    if (!selectedImage) return;
    setUploadLoading(true);
    setUploadError('');
    try {
      let url = '';
      if (type === 'club-logo') {
        url = await ImageService.uploadClubLogo(selectedImage, club._id);
      } else {
        url = await ImageService.uploadClubCover(selectedImage, club._id);
      }
      console.log('uploadClubLogo/ClubCover response:', url);
      onUpdate({
        ...club,
        logo: type === 'club-logo' ? url : club.logo,
        coverImage: type === 'club-cover' ? url : club.coverImage
      });
      Alert.alert('Success', 'Image uploaded successfully');
      onDismiss();
    } catch (error) {
      console.log('[handleImageUpload] error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setLoadingSearch(true);
    try {
      const users = await UserApi.searchUsers(query);
      setSearchResults(users);
    } catch {
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleAdd = async (userId: string, type: 'member' | 'admin') => {
    if (!club._id) return;
    setLoading(true);
    try {
      const formData = new FormData();
      if (type === 'member') formData.append('members', userId);
      if (type === 'admin') formData.append('admins', userId);
      const response = await clubApi.updateClub(club._id, formData);
      if (response.success) {
        onDismiss();
      } else {
        setError(response.error || 'Failed to add member');
      }
    } catch (error) {
      setError('Error adding member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: string, type: 'member' | 'admin') => {
    if (!club._id) return;
    setLoading(true);
    try {
      const formData = new FormData();
      if (type === 'member') formData.append('removeMember', userId);
      if (type === 'admin') formData.append('removeAdmin', userId);
      const response = await clubApi.updateClub(club._id, formData);
      if (response.success) {
        onDismiss();
      } else {
        setError(response.error || 'Failed to remove member');
      }
    } catch (error) {
      setError('Error removing member');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClub = async (formData: FormData) => {
    if (!club._id) return;
    setUploadLoading(true);
    setUploadError('');
    try {
      const response = await clubApi.updateClub(club._id, formData);
      if (response.success && response.data) {
        onUpdate(response.data);
        onDismiss();
      } else {
        setUploadError(response.error || 'Failed to update club');
      }
    } catch (error) {
      setUploadError('Failed to update club. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEditInfo = async () => {
    if (editName.length < 3 || editName.length > 50) {
      setEditError('Name must be 3-50 characters.');
      return;
    }
    if (editDesc.length < 10 || editDesc.length > 500) {
      setEditError('Description must be 10-500 characters.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('description', editDesc);
      await clubApi.updateClub(club._id, formData);
      onDismiss();
    } catch {
      setEditError('Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const renderModalContent = () => {
    switch (type) {
      case 'UPDATE_COVER':
      case 'UPDATE_LOGO':
        return (
          <View style={styles.modalContent}>
            <Text variant="titleMedium">
              {type === 'UPDATE_LOGO' ? 'Update Club Logo' : 'Update Club Cover Image'}
            </Text>
            <View style={styles.imageContainer}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder} />
              )}
            </View>
            <Button mode="contained" onPress={handleImagePick} style={styles.button}>
              Pick Image
            </Button>
            <Button
              mode="contained"
              onPress={() => handleImageUpload(type === 'UPDATE_LOGO' ? 'club-logo' : 'club-cover')}
              loading={uploadLoading}
              disabled={!selectedImage || uploadLoading}
              style={styles.button}
            >
              Upload
            </Button>
            {uploadError ? <Text style={{ color: 'red' }}>{uploadError}</Text> : null}
          </View>
        );

      case 'MANAGE_ADMINS':
        return (
          <View style={styles.modalContent}>
            <Text variant="titleMedium">Manage Admins</Text>
            <TextInput
              label="Search Users"
              value={searchQuery}
              onChangeText={handleSearch}
              style={styles.input}
            />
            {loadingSearch && <ActivityIndicator size="small" style={{ marginBottom: 8 }} />}
            {loading ? (
              <ActivityIndicator />
            ) : (
              <ScrollView style={styles.searchResults}>
                {searchResults.map(user => (
                  <List.Item
                    key={user._id}
                    title={user.name}
                    left={props => <Avatar.Image {...props} source={{ uri: user.avatar }} />}
                    right={props => (
                      <Button onPress={() => handleAdd(user._id, 'admin')}>
                        Add
                      </Button>
                    )}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        );

      case 'MANAGE_MEMBERS':
        return (
          <View style={styles.modalContent}>
            <Text variant="titleMedium">Manage Members</Text>
            <TextInput
              label="Search Users"
              value={searchQuery}
              onChangeText={handleSearch}
              style={styles.input}
            />
            {loadingSearch && <ActivityIndicator size="small" style={{ marginBottom: 8 }} />}
            {loading ? (
              <ActivityIndicator />
            ) : (
              <ScrollView style={styles.searchResults}>
                {searchResults.map(user => (
                  <List.Item
                    key={user._id}
                    title={user.name}
                    left={props => <Avatar.Image {...props} source={{ uri: user.avatar }} />}
                    right={props => (
                      <Button onPress={() => handleAdd(user._id, 'member')}>
                        Add
                      </Button>
                    )}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        );

      case 'HANDLE_JOIN_REQUESTS':
        return (
          <View style={styles.modalContent}>
            <Text variant="titleMedium">Join Requests</Text>
            {/* TODO: 实现加入请求处理UI */}
          </View>
        );

      case 'EDIT_INFO':
        return (
          <View>
            <TextInput
              label="Club Name"
              value={editName}
              onChangeText={setEditName}
              maxLength={50}
            />
            <TextInput
              label="Club Description"
              value={editDesc}
              onChangeText={setEditDesc}
              multiline
              maxLength={500}
              style={{ minHeight: 80 }}
            />
            {editError ? <Text style={{ color: 'red' }}>{editError}</Text> : null}
            <Button mode="contained" onPress={handleEditInfo} loading={loading}>
              Save
            </Button>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        {renderModalContent()}
        {error && (
          <Text style={styles.error}>{error}</Text>
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalContent: {
    padding: 10,
  },
  imageContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  button: {
    marginTop: 16,
  },
  input: {
    marginBottom: 16,
  },
  searchResults: {
    maxHeight: 300,
  },
  error: {
    color: 'red',
    marginTop: 16,
  },
}); 