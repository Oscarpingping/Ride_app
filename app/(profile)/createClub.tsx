import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Surface, HelperText, Switch, Chip, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { clubApi } from '../../shared/api/club';
import type { Club, CreateClubRequest, ClubLocation, ClubType } from '../../shared/types/club';

const CLUB_TYPES = ['biking', 'climbing', 'hiking', 'skiing', 'surfing', 'running', 'camping'];

type CreateClubForm = {
  name: string;
  description: string;
  contactEmail: string;
  type: string;
  location: ClubLocation;
  rules: string[];
  tags: string[];
  isPrivate: boolean;
  createChatRoom: boolean;
};

const initialForm: CreateClubForm = {
  name: '',
  description: '',
  contactEmail: '',
  type: '',
  location: { city: '', country: '' },
  rules: [],
  tags: [],
  isPrivate: false,
  createChatRoom: true,
};

export default function CreateClubScreen() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuth();
  const [form, setForm] = useState<CreateClubForm>(initialForm);
  const [ruleInput, setRuleInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Partial<CreateClubForm>>({});

  useEffect(() => {
    if (isAuthenticated && currentUser && !currentUser.canCreateClub) {
      router.replace('/profile');
    }
  }, [isAuthenticated, currentUser, router]);

  if (!isAuthenticated || !currentUser || !currentUser.canCreateClub) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }

  const validateForm = (): boolean => {
    const errors: Partial<CreateClubForm> = {};
    
    if (!form.name.trim()) {
      errors.name = 'Club name is required';
    } else if (form.name.length < 3) {
      errors.name = 'Club name must be at least 3 characters';
    } else if (form.name.length > 50) {
      errors.name = 'Club name must be less than 50 characters';
    }

    if (!form.description.trim()) {
      errors.description = 'Description is required';
    } else if (form.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (!form.contactEmail.trim()) {
      errors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      errors.contactEmail = 'Invalid email format';
    }

    if (!form.type) {
      errors.type = 'Club type is required';
    }

    if (!form.location.city.trim()) {
      errors.location = { city: 'City is required', country: form.location.country };
    }

    if (!form.location.country.trim()) {
      errors.location = { city: form.location.city, country: 'Country is required' };
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await clubApi.createClub({
        name: form.name,
        description: form.description,
        type: form.type as ClubType,
        location: form.location,
        isPrivate: form.isPrivate,
        tags: form.tags,
        rules: form.rules,
        contactEmail: form.contactEmail,
        createChatRoom: form.createChatRoom
      });

      if (response.success) {
        setSuccess('Club created successfully!');
        router.push('/profile');
      } else {
        setError(response.error || 'Failed to create club');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setRuleInput('');
    setTagInput('');
    setValidationErrors({});
  };

  const addRule = () => {
    if (ruleInput.trim()) {
      setForm(prev => ({
        ...prev,
        rules: [...prev.rules, ruleInput.trim()]
      }));
      setRuleInput('');
    }
  };

  const removeRule = (index: number) => {
    setForm(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <Text style={styles.title}>Create New Club</Text>

        <TextInput
          label="Club Name"
          value={form.name}
          onChangeText={text => setForm(prev => ({ ...prev, name: text }))}
          error={!!validationErrors.name}
          style={styles.input}
        />
        <HelperText type="error" visible={!!validationErrors.name}>
          {validationErrors.name}
        </HelperText>

        <TextInput
          label="Description"
          value={form.description}
          onChangeText={text => setForm(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={3}
          error={!!validationErrors.description}
          style={styles.input}
        />
        <HelperText type="error" visible={!!validationErrors.description}>
          {validationErrors.description}
        </HelperText>

        <TextInput
          label="Contact Email"
          value={form.contactEmail}
          onChangeText={text => setForm(prev => ({ ...prev, contactEmail: text }))}
          keyboardType="email-address"
          error={!!validationErrors.contactEmail}
          style={styles.input}
        />
        <HelperText type="error" visible={!!validationErrors.contactEmail}>
          {validationErrors.contactEmail}
        </HelperText>

        <View style={styles.typeContainer}>
          <Text style={styles.label}>Club Type</Text>
          <View style={styles.typeChips}>
            {CLUB_TYPES.map(type => (
              <Chip
                key={type}
                selected={form.type === type}
                onPress={() => setForm(prev => ({ ...prev, type }))}
                style={styles.typeChip}
              >
                {type}
              </Chip>
            ))}
          </View>
          <HelperText type="error" visible={!!validationErrors.type}>
            {validationErrors.type}
          </HelperText>
        </View>

        <View style={styles.locationContainer}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            label="City"
            value={form.location.city}
            onChangeText={text => {
              setForm(prev => {
                const newLocation: ClubLocation = {
                  city: text,
                  country: prev.location.country
                };
                return {
                  ...prev,
                  location: newLocation
                };
              });
            }}
            error={!!validationErrors.location?.city}
            style={styles.input}
          />
          <HelperText type="error" visible={!!validationErrors.location?.city}>
            {validationErrors.location?.city}
          </HelperText>

          <TextInput
            label="Country"
            value={form.location.country}
            onChangeText={text => {
              setForm(prev => {
                const newLocation: ClubLocation = {
                  city: prev.location.city,
                  country: text
                };
                return {
                  ...prev,
                  location: newLocation
                };
              });
            }}
            error={!!validationErrors.location?.country}
            style={styles.input}
          />
          <HelperText type="error" visible={!!validationErrors.location?.country}>
            {validationErrors.location?.country}
          </HelperText>
        </View>

        <View style={styles.rulesContainer}>
          <Text style={styles.label}>Rules</Text>
          <View style={styles.ruleInput}>
            <TextInput
              label="Add Rule"
              value={ruleInput}
              onChangeText={setRuleInput}
              style={styles.ruleTextInput}
            />
            <Button mode="contained" onPress={addRule} style={styles.addButton}>
              Add
            </Button>
          </View>
          <View style={styles.rulesList}>
            {form.rules.map((rule, index) => (
              <Chip
                key={index}
                onClose={() => removeRule(index)}
                style={styles.ruleChip}
              >
                {rule}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.tagsContainer}>
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagInput}>
            <TextInput
              label="Add Tag"
              value={tagInput}
              onChangeText={setTagInput}
              style={styles.tagTextInput}
            />
            <Button mode="contained" onPress={addTag} style={styles.addButton}>
              Add
            </Button>
          </View>
          <View style={styles.tagsList}>
            {form.tags.map((tag, index) => (
              <Chip
                key={index}
                onClose={() => removeTag(index)}
                style={styles.tagChip}
              >
                {tag}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.switchContainer}>
          <Text>Private Club</Text>
          <Switch
            value={form.isPrivate}
            onValueChange={value => setForm(prev => ({ ...prev, isPrivate: value }))}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text>Create Chat Room</Text>
          <Switch
            value={form.createChatRoom}
            onValueChange={value => setForm(prev => ({ ...prev, createChatRoom: value }))}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        >
          Create Club
        </Button>

        <Snackbar
          visible={!!error}
          onDismiss={() => setError('')}
          action={{
            label: 'Dismiss',
            onPress: () => setError('')
          }}
        >
          {error}
        </Snackbar>

        <Snackbar
          visible={!!success}
          onDismiss={() => setSuccess('')}
          action={{
            label: 'Dismiss',
            onPress: () => setSuccess('')
          }}
        >
          {success}
        </Snackbar>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  surface: {
    padding: 20,
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  typeContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  typeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  typeChip: {
    margin: 4,
  },
  locationContainer: {
    marginBottom: 16,
  },
  rulesContainer: {
    marginBottom: 16,
  },
  ruleInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleTextInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    marginLeft: 8,
  },
  rulesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ruleChip: {
    margin: 4,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagTextInput: {
    flex: 1,
    marginRight: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    margin: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 16,
  },
  loadingText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },
}); 