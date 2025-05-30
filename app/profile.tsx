import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput, Avatar, Portal, Modal, ActivityIndicator, List, Divider, FAB } from 'react-native-paper';
import { useAuth } from './context/AuthContext';
import { useRides } from './context/RideContext';
import { ClubApi } from '../shared/api/club';
import { ContactApi } from '../shared/api/contact';
import type { User } from '../shared/types/user';
import type { Ride } from '../shared/types/ride';
import type { Club } from '../shared/types/club';

export default function ProfileScreen() {
  const { currentUser, isAuthenticated, isLoading, error, login, register, logout } = useAuth();
  const { rides } = useRides();
  const [activeTab, setActiveTab] = useState('activities');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showCreateClubModal, setShowCreateClubModal] = useState(false);
  const [showJoinClubModal, setShowJoinClubModal] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [contactEmail, setContactEmail] = useState('');
  const [clubData, setClubData] = useState({
    name: '',
    contactEmail: '',
    description: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated, isLoading]);

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
    const response = await ClubApi.getUserClubs();
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
    await login(loginData);
    if (!error) {
      setShowLoginModal(false);
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
            <Button mode="contained" onPress={() => setShowLoginModal(true)} style={styles.authButton}>
              Login
            </Button>
            <Button mode="outlined" onPress={() => setShowRegisterModal(true)} style={styles.authButton}>
              Register
            </Button>
          </View>
        </View>

        <Portal>
          <Modal
            visible={showLoginModal}
            onDismiss={() => setShowLoginModal(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>Login</Text>
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
            <Button mode="contained" onPress={handleLogin} style={styles.modalButton}>
              Login
            </Button>
          </Modal>

          <Modal
            visible={showRegisterModal}
            onDismiss={() => setShowRegisterModal(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>Register</Text>
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
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
}); 