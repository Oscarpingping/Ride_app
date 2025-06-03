import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, Button, TextInput, Avatar, Portal, Modal, ActivityIndicator, List, Divider, FAB, Surface, HelperText, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useRides } from '../context/RideContext';
import { ClubApi } from '../../shared/api/club';
import { ContactApi } from '../../shared/api/contact';
import { UserApi } from '../../shared/api/user';
import type { User, TerrainType, PaceLevel, DifficultyLevel, UserPreferences } from '../../shared/types/user-unified';
import { TERRAIN_OPTIONS, PACE_OPTIONS, DIFFICULTY_OPTIONS } from '../../shared/types/user-unified';
import type { Ride } from '../../shared/types/ride';
import type { Club } from '../../shared/types/club';

export default function ProfileScreen() {
  const { currentUser, isAuthenticated, isLoading, error, login, register, logout } = useAuth();
  const { rides } = useRides();
  const [activeTab, setActiveTab] = useState('activities');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showCreateClubModal, setShowCreateClubModal] = useState(false);
  const [showJoinClubModal, setShowJoinClubModal] = useState(false);
  const [userDismissedModal, setUserDismissedModal] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [resetEmail, setResetEmail] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [clubData, setClubData] = useState({
    name: '',
    contactEmail: '',
    description: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState<{
    name: string;
    bio: string;
    location: {
      city: string;
      province: string;
      country: string;
    };
    preferences: {
      terrain: TerrainType[];
      pace: PaceLevel[];
      difficulty: DifficultyLevel[];
    };
  }>({
    name: '',
    bio: '',
    location: {
      city: '',
      province: '',
      country: ''
    },
    preferences: {
      terrain: [],
      pace: [],
      difficulty: []
    }
  });
  const router = useRouter();

  // 添加调试日志
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-9), `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    if (!isAuthenticated && !isLoading && !userDismissedModal) {
      const timer = setTimeout(() => {
        setShowLoginModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, userDismissedModal]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts();
      fetchClubs();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentUser) {
      const user = currentUser as any;
      setEditedProfile({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || {
          city: '',
          province: '',
          country: ''
        },
        preferences: user.preferences || {
          terrain: [],
          pace: [],
          difficulty: []
        }
      });
    }
  }, [currentUser]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setFormError('Please fill in all fields');
      return;
    }
    if (!validateEmail(loginData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    setFormError(null);
    addDebugLog(`Starting login for: ${loginData.email}`);
    try {
      const result = await login(loginData);
      addDebugLog(`Login completed. Success: ${result.success}, Error: ${result.error || 'none'}`);
      if (result.success) {
        setShowLoginModal(false);
        addDebugLog('Login successful, modal closed');
      } else {
        addDebugLog(`Login failed: ${result.error}`);
        setFormError(result.error || 'Login failed');
      }
    } catch (err) {
      addDebugLog(`Login exception: ${err}`);
      setFormError('An unexpected error occurred');
    }
  };

  const handleRegister = async () => {
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }
    if (!validateEmail(registerData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    setFormError(null);
    try {
      await register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
      });
      setShowRegisterModal(false);
    } catch (err) {
      setFormError('Registration failed. Please try again.');
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setFormError('Please enter your email address');
      return;
    }
    if (!validateEmail(resetEmail)) {
      setFormError('Please enter a valid email address');
      return;
    }
    setFormError(null);
    try {
      const response = await UserApi.requestPasswordReset({ email: resetEmail });
      if (response.success) {
        setShowForgotPasswordModal(false);
        setResetEmail('');
        Alert.alert(
          'Password Reset Sent',
          'If an account exists with this email, you will receive a password reset link shortly.'
        );
      } else {
        setFormError(response.error || 'Failed to send password reset email');
      }
    } catch (err) {
      setFormError('Network error. Please check your connection and try again.');
    }
  };

  const fetchContacts = async () => {
    const response = await ContactApi.getContacts();
    if (response.success && response.data) {
      setContacts(response.data);
    }
  };

  const fetchClubs = async () => {
    const response = await ClubApi.getClubs();
    if (response.success && response.data) {
      setClubs(response.data);
    }
  };

  const handleAddContact = async () => {
    if (!validateEmail(contactEmail)) {
      setFormError('Please enter a valid email address');
      return;
    }
    const response = await ContactApi.addContact({ email: contactEmail });
    if (response.success) {
      setShowAddContactModal(false);
      setContactEmail('');
      setFormError(null);
      fetchContacts();
    } else {
      setFormError(response.error || 'Failed to add contact');
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    const response = await ContactApi.removeContact(contactId);
    if (response.success) {
      fetchContacts();
    } else {
      setFormError(response.error || 'Failed to remove contact');
    }
  };

  const handleCreateClub = async () => {
    if (!validateEmail(clubData.contactEmail)) {
      setFormError('Please enter a valid contact email');
      return;
    }
    const response = await ClubApi.createClub(clubData);
    if (response.success) {
      setShowCreateClubModal(false);
      setClubData({ name: '', contactEmail: '', description: '' });
      setFormError(null);
      fetchClubs();
    } else {
      setFormError(response.error || 'Failed to create club');
    }
  };

  const handleJoinClub = async (clubId: string) => {
    const response = await ClubApi.joinClub(clubId);
    if (response.success) {
      setShowJoinClubModal(false);
      fetchClubs();
    } else {
      setFormError(response.error || 'Failed to join club');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await UserApi.updateUser(editedProfile);
      if (response.success && response.data) {
        const user = response.data as any;
        setEditedProfile({
          name: user.name || '',
          bio: user.bio || '',
          location: user.location || {
            city: '',
            province: '',
            country: ''
          },
          preferences: user.preferences || {
            terrain: [],
            pace: [],
            difficulty: []
          }
        });
        setEditProfileModalVisible(false);
      } else {
        console.error('Failed to update profile:', response.error);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Welcome to WildPals</Text>
          <Text style={styles.authSubtitle}>Please login or register to continue</Text>
          <View style={styles.authButtons}>
            <Button mode="contained" onPress={() => {
              setShowLoginModal(true);
              setUserDismissedModal(false);
            }} style={styles.authButton}>
              Login
            </Button>
            <Button mode="outlined" onPress={() => {
              setShowRegisterModal(true);
              setUserDismissedModal(false);
            }} style={styles.authButton}>
              Register
            </Button>
          </View>
        </View>

        <Portal>
          <Modal
            visible={showLoginModal}
            onDismiss={() => {
              setShowLoginModal(false);
              setUserDismissedModal(true);
            }}
            contentContainerStyle={styles.modalContainer}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <Surface style={styles.surface}>
                  <Text variant="headlineMedium" style={styles.modalTitle}>Welcome Back</Text>
                  <TextInput
                    label="Email"
                    value={loginData.email}
                    onChangeText={(text) => setLoginData({ ...loginData, email: text })}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TextInput
                    label="Password"
                    value={loginData.password}
                    onChangeText={(text) => setLoginData({ ...loginData, password: text })}
                    style={styles.input}
                    mode="outlined"
                    secureTextEntry
                  />
                  {(error || formError) && <HelperText type="error" visible={true}>{error || formError}</HelperText>}
                  <Button mode="contained" onPress={handleLogin} style={styles.modalButton}>
                    Sign In
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => {
                      setShowLoginModal(false);
                      setShowForgotPasswordModal(true);
                    }}
                    style={styles.forgotPasswordButton}
                  >
                    Forgot Password?
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => {
                      setShowLoginModal(false);
                      setShowRegisterModal(true);
                    }}
                    style={styles.switchButton}
                  >
                    New User? Sign Up
                  </Button>
                </Surface>
              </ScrollView>
            </KeyboardAvoidingView>
          </Modal>

          <Modal
            visible={showRegisterModal}
            onDismiss={() => {
              setShowRegisterModal(false);
              setUserDismissedModal(true);
            }}
            contentContainerStyle={styles.modalContainer}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <Surface style={styles.surface}>
                  <Text variant="headlineMedium" style={styles.modalTitle}>Create Account</Text>
                  <TextInput
                    label="Name"
                    value={registerData.name}
                    onChangeText={(text) => setRegisterData({ ...registerData, name: text })}
                    style={styles.input}
                    mode="outlined"
                    autoCapitalize="none"
                  />
                  <TextInput
                    label="Email"
                    value={registerData.email}
                    onChangeText={(text) => setRegisterData({ ...registerData, email: text })}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TextInput
                    label="Password"
                    value={registerData.password}
                    onChangeText={(text) => setRegisterData({ ...registerData, password: text })}
                    style={styles.input}
                    mode="outlined"
                    secureTextEntry
                  />
                  <TextInput
                    label="Confirm Password"
                    value={registerData.confirmPassword}
                    onChangeText={(text) => setRegisterData({ ...registerData, confirmPassword: text })}
                    style={styles.input}
                    mode="outlined"
                    secureTextEntry
                  />
                  {(error || formError) && <HelperText type="error" visible={true}>{error || formError}</HelperText>}
                  <Button mode="contained" onPress={handleRegister} style={styles.modalButton}>
                    Sign Up
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => {
                      setShowRegisterModal(false);
                      setShowLoginModal(true);
                    }}
                    style={styles.switchButton}
                  >
                    Already have an account? Sign In
                  </Button>
                </Surface>
              </ScrollView>
            </KeyboardAvoidingView>
          </Modal>

          <Modal
            visible={showForgotPasswordModal}
            onDismiss={() => {
              setShowForgotPasswordModal(false);
              setResetEmail('');
              setFormError(null);
            }}
            contentContainerStyle={styles.modalContainer}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <Surface style={styles.surface}>
                  <Text variant="headlineMedium" style={styles.modalTitle}>Reset Password</Text>
                  <Text style={styles.resetDescription}>
                    Enter your email address and we'll send you a link to reset your password.
                  </Text>
                  <TextInput
                    label="Email"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {formError && <HelperText type="error" visible={true}>{formError}</HelperText>}
                  <Button mode="contained" onPress={handleForgotPassword} style={styles.modalButton}>
                    Send Reset Link
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => {
                      setShowForgotPasswordModal(false);
                      setShowLoginModal(true);
                      setResetEmail('');
                      setFormError(null);
                    }}
                    style={styles.backToLoginButton}
                  >
                    Back to Login
                  </Button>
                </Surface>
              </ScrollView>
            </KeyboardAvoidingView>
          </Modal>
        </Portal>
      </View>
    );
  }

  const userRides = rides.filter((ride) => ride.creatorId === currentUser?._id);
  const joinedRides = rides.filter((ride) => 
    ride.participants.some((participant) => participant.id === currentUser?._id)
  );

  const renderActivities = () => (
    <View style={styles.activitiesContainer}>
      <Text style={styles.sectionTitle}>Upcoming Rides</Text>
      {userRides.length > 0 ? (
        userRides.map((ride) => (
          <View key={ride._id} style={styles.rideItem}>
            <Text style={styles.rideTitle}>{ride.title}</Text>
            <Text style={styles.rideDate}>
              {new Date(ride.date).toLocaleDateString()}
            </Text>
            <Text style={styles.rideStatus}>Status: {ride.status}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No upcoming rides</Text>
      )}

      <Text style={styles.sectionTitle}>Past Rides</Text>
      {joinedRides.length > 0 ? (
        joinedRides.map((ride) => (
          <View key={ride._id} style={styles.rideItem}>
            <Text style={styles.rideTitle}>{ride.title}</Text>
            <Text style={styles.rideDate}>
              {new Date(ride.date).toLocaleDateString()}
            </Text>
            <Text style={styles.rideStatus}>Status: {ride.status}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No past rides</Text>
      )}
    </View>
  );

  const renderContacts = () => (
    <View style={styles.contactsContainer}>
      <Text style={styles.sectionTitle}>Contacts</Text>
      {contacts.length > 0 ? (
        contacts.map((contact) => (
          <List.Item
            key={contact._id}
            title={contact.name}
            description={contact.email}
            left={props => <Avatar.Text {...props} label={contact.name.substring(0, 2).toUpperCase()} />}
            right={props => (
              <Button
                {...props}
                onPress={() => handleRemoveContact(contact._id)}
                mode="text"
                textColor="red"
              >
                Remove
              </Button>
            )}
          />
        ))
      ) : (
        <Text style={styles.emptyText}>No contacts yet</Text>
      )}
    </View>
  );

  const renderClubs = () => (
    <View style={styles.clubsContainer}>
      <Text style={styles.sectionTitle}>My Clubs</Text>
      {clubs.length > 0 ? (
        clubs.map((club) => (
          <List.Item
            key={club._id}
            title={club.name}
            description={club.description}
            left={props => <List.Icon {...props} icon="account-group" />}
          />
        ))
      ) : (
        <Text style={styles.emptyText}>No clubs yet</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={currentUser?.name?.substring(0, 2).toUpperCase() || '??'}
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{currentUser?.name}</Text>
          <Text style={styles.email}>{currentUser?.email}</Text>
        </View>
        <Button mode="outlined" onPress={logout} style={styles.logoutButton}>
          Logout
        </Button>
        <Button
          mode="contained"
          onPress={() => {
            const user = currentUser as any;
            setEditedProfile({
              name: user?.name || '',
              bio: user?.bio || '',
              location: user?.location || {
                city: '',
                province: '',
                country: ''
              },
              preferences: user?.preferences || {
                terrain: [],
                pace: [],
                difficulty: []
              }
            });
            setEditProfileModalVisible(true);
          }}
          style={styles.editButton}
        >
          Edit Profile
        </Button>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{currentUser?.ridesCreated || 0}</Text>
          <Text style={styles.statLabel}>Rides Created</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{currentUser?.ridesJoined || 0}</Text>
          <Text style={styles.statLabel}>Rides Joined</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{currentUser?.rating || 0}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <Button
          mode={activeTab === 'activities' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('activities')}
          style={styles.tabButton}
        >
          Activities
        </Button>
        <Button
          mode={activeTab === 'contacts' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('contacts')}
          style={styles.tabButton}
        >
          Contacts
        </Button>
        <Button
          mode={activeTab === 'clubs' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('clubs')}
          style={styles.tabButton}
        >
          Clubs
        </Button>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'activities' && renderActivities()}
        {activeTab === 'contacts' && renderContacts()}
        {activeTab === 'clubs' && renderClubs()}
      </ScrollView>

      {activeTab === 'contacts' && (
        <FAB
          icon="account-plus"
          style={styles.fab}
          onPress={() => setShowAddContactModal(true)}
        />
      )}

      {activeTab === 'clubs' && (
        <View style={styles.clubFabContainer}>
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => setShowCreateClubModal(true)}
          />
          <FAB
            icon="account-group-plus"
            style={[styles.fab, styles.joinClubFab]}
            onPress={() => setShowJoinClubModal(true)}
          />
        </View>
      )}

      <Portal>
        <Modal
          visible={showAddContactModal}
          onDismiss={() => setShowAddContactModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Surface style={styles.surface}>
                <Text style={styles.modalTitle}>Add Contact</Text>
                <TextInput
                  label="Contact's Email"
                  value={contactEmail}
                  onChangeText={setContactEmail}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {formError && <HelperText type="error" visible={true}>{formError}</HelperText>}
                <Button mode="contained" onPress={handleAddContact} style={styles.modalButton}>
                  Add Contact
                </Button>
              </Surface>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>

        <Modal
          visible={showCreateClubModal}
          onDismiss={() => setShowCreateClubModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Surface style={styles.surface}>
                <Text style={styles.modalTitle}>Create Club</Text>
                <TextInput
                  label="Club Name"
                  value={clubData.name}
                  onChangeText={(text) => setClubData({ ...clubData, name: text })}
                  style={styles.input}
                  mode="outlined"
                />
                <TextInput
                  label="Contact Email"
                  value={clubData.contactEmail}
                  onChangeText={(text) => setClubData({ ...clubData, contactEmail: text })}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  label="Description"
                  value={clubData.description}
                  onChangeText={(text) => setClubData({ ...clubData, description: text })}
                  style={styles.input}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                />
                {formError && <HelperText type="error" visible={true}>{formError}</HelperText>}
                <Button mode="contained" onPress={handleCreateClub} style={styles.modalButton}>
                  Create Club
                </Button>
              </Surface>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>

        <Modal
          visible={showJoinClubModal}
          onDismiss={() => setShowJoinClubModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Surface style={styles.surface}>
                <Text style={styles.modalTitle}>Join Club</Text>
                {clubs.map((club) => (
                  <List.Item
                    key={club._id}
                    title={club.name}
                    description={club.description}
                    onPress={() => handleJoinClub(club._id)}
                  />
                ))}
              </Surface>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>

        <Modal
          visible={editProfileModalVisible}
          onDismiss={() => setEditProfileModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView>
            <TextInput
              label="Name"
              value={editedProfile.name}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, name: text })}
              style={styles.input}
            />
            <TextInput
              label="Bio"
              value={editedProfile.bio}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, bio: text })}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            <TextInput
              label="City"
              value={editedProfile.location?.city}
              onChangeText={(text) => setEditedProfile({
                ...editedProfile,
                location: { ...editedProfile.location, city: text }
              })}
              style={styles.input}
            />
            <TextInput
              label="Province"
              value={editedProfile.location?.province}
              onChangeText={(text) => setEditedProfile({
                ...editedProfile,
                location: { ...editedProfile.location, province: text }
              })}
              style={styles.input}
            />
            <TextInput
              label="Country"
              value={editedProfile.location?.country}
              onChangeText={(text) => setEditedProfile({
                ...editedProfile,
                location: { ...editedProfile.location, country: text }
              })}
              style={styles.input}
            />
            <Text style={styles.sectionTitle}>Ride Preferences</Text>
            <View style={styles.preferencesSection}>
              <Text style={styles.preferenceLabel}>Terrain</Text>
              <View style={styles.preferenceOptions}>
                {TERRAIN_OPTIONS.map((type) => (
                  <Chip
                    key={type}
                    selected={editedProfile.preferences.terrain.includes(type as TerrainType)}
                    onPress={() => {
                      const terrain = editedProfile.preferences.terrain;
                      const newTerrain = terrain.includes(type as TerrainType)
                        ? terrain.filter(t => t !== type)
                        : [...terrain, type as TerrainType];
                      setEditedProfile({
                        ...editedProfile,
                        preferences: {
                          ...editedProfile.preferences,
                          terrain: newTerrain
                        }
                      });
                    }}
                    style={styles.chip}
                  >
                    {type}
                  </Chip>
                ))}
              </View>
              <Text style={styles.preferenceLabel}>Pace</Text>
              <View style={styles.preferenceOptions}>
                {PACE_OPTIONS.map((level) => (
                  <Chip
                    key={level}
                    selected={editedProfile.preferences.pace.includes(level as PaceLevel)}
                    onPress={() => {
                      const pace = editedProfile.preferences.pace;
                      const newPace = pace.includes(level as PaceLevel)
                        ? pace.filter(p => p !== level)
                        : [...pace, level as PaceLevel];
                      setEditedProfile({
                        ...editedProfile,
                        preferences: {
                          ...editedProfile.preferences,
                          pace: newPace
                        }
                      });
                    }}
                    style={styles.chip}
                  >
                    {level}
                  </Chip>
                ))}
              </View>
              <Text style={styles.preferenceLabel}>Difficulty</Text>
              <View style={styles.preferenceOptions}>
                {DIFFICULTY_OPTIONS.map((level) => (
                  <Chip
                    key={level}
                    selected={editedProfile.preferences.difficulty.includes(level as DifficultyLevel)}
                    onPress={() => {
                      const difficulty = editedProfile.preferences.difficulty;
                      const newDifficulty = difficulty.includes(level as DifficultyLevel)
                        ? difficulty.filter(d => d !== level)
                        : [...difficulty, level as DifficultyLevel];
                      setEditedProfile({
                        ...editedProfile,
                        preferences: {
                          ...editedProfile.preferences,
                          difficulty: newDifficulty
                        }
                      });
                    }}
                    style={styles.chip}
                  >
                    {level}
                  </Chip>
                ))}
              </View>
            </View>
            <Button mode="contained" onPress={handleUpdateProfile} style={styles.saveButton}>
              Save Changes
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  authButtons: {
    width: '100%',
    maxWidth: 300,
  },
  authButton: {
    marginVertical: 5,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  surface: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  modalButton: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    color: '#666',
  },
  logoutButton: {
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    marginTop: 5,
  },
  tabs: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  content: {
    flex: 1,
  },
  activitiesContainer: {
    padding: 20,
  },
  contactsContainer: {
    padding: 20,
  },
  clubsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  rideItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  rideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rideDate: {
    color: '#666',
    marginTop: 5,
  },
  rideStatus: {
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  clubFabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  joinClubFab: {
    marginTop: 16,
  },
  forgotPasswordButton: {
    marginTop: 10,
  },
  resetDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  backToLoginButton: {
    marginTop: 10,
  },
  switchButton: {
    marginTop: 10,
  },
  debugPanel: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    maxHeight: 150,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugText: {
    fontSize: 10,
    color: '#333',
    marginBottom: 2,
  },
  editButton: {
    marginLeft: 10,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  saveButton: {
    marginTop: 20,
  },
  preferencesSection: {
    marginBottom: 20,
  },
  preferenceLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  preferenceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  chip: {
    margin: 4,
  },
}); 