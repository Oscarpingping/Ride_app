import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput, Avatar, Portal, Modal, ActivityIndicator, List, Divider, FAB } from 'react-native-paper';
import { useAuth } from './context/AuthContext';
import { useRides } from './context/RideContext';
import { ClubApi } from '../shared/api/club';
import { ContactApi } from '../shared/api/contact';
import { AuthApi } from '../shared/api/auth';
import type { User } from '../shared/types/user';
import type { Ride } from '../shared/types/ride';
import type { Club } from '../shared/types/club';

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

  // 添加调试日志
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-9), `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    // 给用户一些时间浏览页面，然后再显示登录提示
    if (!isAuthenticated && !isLoading && !userDismissedModal) {
      const timer = setTimeout(() => {
        setShowLoginModal(true);
      }, 2000); // 2秒后显示登录模态框
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, userDismissedModal]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts();
      fetchClubs();
    }
  }, [isAuthenticated]);

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

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setFormError('Please fill in all fields');
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
    if (registerData.password !== registerData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    setFormError(null);
    await register({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
    });
    if (!error) {
      setShowRegisterModal(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setFormError('Please enter your email address');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setFormError('Please enter a valid email address');
      return;
    }
    
    setFormError(null);
    try {
      const response = await AuthApi.requestPasswordReset({ email: resetEmail });
      if (response.success) {
        setShowForgotPasswordModal(false);
        setResetEmail('');
        // 显示成功消息
        setFormError(null);
        alert('If an account exists with this email, you will receive a password reset link shortly.');
      } else {
        setFormError(response.error || 'Failed to send password reset email');
      }
    } catch (err) {
      setFormError('Network error. Please check your connection and try again.');
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Login</Text>
              <Button 
                mode="text" 
                onPress={() => {
                  setShowLoginModal(false);
                  setUserDismissedModal(true);
                }}
                style={styles.closeButton}
              >
                ✕
              </Button>
            </View>
            <TextInput
              label="Email"
              value={loginData.email}
              onChangeText={(text) => setLoginData({ ...loginData, email: text })}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              label="Password"
              value={loginData.password}
              onChangeText={(text) => setLoginData({ ...loginData, password: text })}
              style={styles.input}
              secureTextEntry
            />
            {(error || formError) && <Text style={styles.errorText}>{error || formError}</Text>}
            
            {/* Debug Panel */}
            {debugLogs.length > 0 && (
              <View style={styles.debugPanel}>
                <Text style={styles.debugTitle}>Debug Logs:</Text>
                {debugLogs.map((log, index) => (
                  <Text key={index} style={styles.debugText}>{log}</Text>
                ))}
              </View>
            )}
            
            <Button mode="contained" onPress={handleLogin} style={styles.modalButton}>
              Login
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
          </Modal>

          <Modal
            visible={showRegisterModal}
            onDismiss={() => {
              setShowRegisterModal(false);
              setUserDismissedModal(true);
            }}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register</Text>
              <Button 
                mode="text" 
                onPress={() => {
                  setShowRegisterModal(false);
                  setUserDismissedModal(true);
                }}
                style={styles.closeButton}
              >
                ✕
              </Button>
            </View>
            <TextInput
              label="Name"
              value={registerData.name}
              onChangeText={(text) => setRegisterData({ ...registerData, name: text })}
              style={styles.input}
            />
            <TextInput
              label="Email"
              value={registerData.email}
              onChangeText={(text) => setRegisterData({ ...registerData, email: text })}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              label="Password"
              value={registerData.password}
              onChangeText={(text) => setRegisterData({ ...registerData, password: text })}
              style={styles.input}
              secureTextEntry
            />
            <TextInput
              label="Confirm Password"
              value={registerData.confirmPassword}
              onChangeText={(text) => setRegisterData({ ...registerData, confirmPassword: text })}
              style={styles.input}
              secureTextEntry
            />
            {(error || formError) && <Text style={styles.errorText}>{error || formError}</Text>}
            <Button mode="contained" onPress={handleRegister} style={styles.modalButton}>
              Register
            </Button>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <Button 
                mode="text" 
                onPress={() => {
                  setShowForgotPasswordModal(false);
                  setResetEmail('');
                  setFormError(null);
                }}
                style={styles.closeButton}
              >
                ✕
              </Button>
            </View>
            <Text style={styles.resetDescription}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
            <TextInput
              label="Email"
              value={resetEmail}
              onChangeText={setResetEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {formError && <Text style={styles.errorText}>{formError}</Text>}
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
          <Text style={styles.modalTitle}>Add Contact</Text>
          <TextInput
            label="Contact's Email"
            value={contactEmail}
            onChangeText={setContactEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {formError && <Text style={styles.errorText}>{formError}</Text>}
          <Button mode="contained" onPress={handleAddContact} style={styles.modalButton}>
            Add Contact
          </Button>
        </Modal>

        <Modal
          visible={showCreateClubModal}
          onDismiss={() => setShowCreateClubModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Create Club</Text>
          <TextInput
            label="Club Name"
            value={clubData.name}
            onChangeText={(text) => setClubData({ ...clubData, name: text })}
            style={styles.input}
          />
          <TextInput
            label="Contact Email"
            value={clubData.contactEmail}
            onChangeText={(text) => setClubData({ ...clubData, contactEmail: text })}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            label="Description"
            value={clubData.description}
            onChangeText={(text) => setClubData({ ...clubData, description: text })}
            style={styles.input}
            multiline
            numberOfLines={4}
          />
          {formError && <Text style={styles.errorText}>{formError}</Text>}
          <Button mode="contained" onPress={handleCreateClub} style={styles.modalButton}>
            Create Club
          </Button>
        </Modal>

        <Modal
          visible={showJoinClubModal}
          onDismiss={() => setShowJoinClubModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Join Club</Text>
          <ScrollView>
            {clubs.map((club) => (
              <List.Item
                key={club._id}
                title={club.name}
                description={club.description}
                onPress={() => handleJoinClub(club._id)}
              />
            ))}
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    minWidth: 40,
  },
  input: {
    marginBottom: 15,
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
}); 