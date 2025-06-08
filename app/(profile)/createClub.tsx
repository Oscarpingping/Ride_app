import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Image, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, HelperText, Switch, Chip, ActivityIndicator, Snackbar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ClubApi } from '../../shared/api/club';
import type { Club } from '../../shared/types/club';
// 假设有ChatRoomApi
// import { ChatRoomApi } from '../../shared/api/chatroom';

const CLUB_TYPES = ['biking', 'climbing', 'hiking', 'skiing', 'surfing', 'running', 'camping'];

type CreateClubForm = {
  name: string;
  description: string;
  contactEmail: string;
  type: string;
  logo: string;
  coverImage: string;
  location: { city: string; province: string; country: string; coordinates?: any };
  rules: string[];
  tags: string[];
  isPrivate: boolean;
  createChatRoom: boolean;
};

export default function CreateClubScreen() {
  const router = useRouter();
  const [form, setForm] = useState<CreateClubForm>({
    name: '',
    description: '',
    contactEmail: '',
    type: '',
    logo: '',
    coverImage: '',
    location: { city: '', province: '', country: '', coordinates: undefined },
    rules: [],
    tags: [],
    isPrivate: false,
    createChatRoom: true,
  });
  const [ruleInput, setRuleInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const pickImage = async (field: 'logo' | 'coverImage') => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0].uri) {
      // 这里应上传到服务器，拿到url
      setForm({ ...form, [field]: result.assets[0].uri });
    }
  };

  const handleAddRule = () => {
    if (ruleInput.trim()) {
      setForm({ ...form, rules: [...form.rules, ruleInput.trim()] });
      setRuleInput('');
    }
  };
  const handleAddTag = () => {
    if (tagInput.trim()) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  };
  const handleRemoveRule = (idx: number) => {
    setForm({ ...form, rules: form.rules.filter((_, i) => i !== idx) });
  };
  const handleRemoveTag = (idx: number) => {
    setForm({ ...form, tags: form.tags.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // 1. 上传图片（略，假设直接用本地uri）
      // 2. 创建club
      const { createChatRoom, ...clubData } = form;
      const clubRes = await ClubApi.createClub(clubData);
      if (!clubRes.success) throw new Error(clubRes.error || 'Create club failed');
      const club = clubRes.data;
      // 3. 如需创建聊天室
      if (form.createChatRoom && club && club._id) {
        // await ChatRoomApi.createChatRoom({ clubId: club._id });
        // 假设后端自动创建或有接口
      }
      setSuccess('Club created successfully!');
      setTimeout(() => router.replace('/profile'), 1200);
    } catch (e: any) {
      setError(e.message || 'Create club failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <Text variant="headlineMedium" style={styles.title}>Create Club</Text>
        <TextInput
          label="Club Name"
          value={form.name}
          onChangeText={v => setForm({ ...form, name: v })}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Description"
          value={form.description}
          onChangeText={v => setForm({ ...form, description: v })}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={3}
        />
        <TextInput
          label="Contact Email"
          value={form.contactEmail}
          onChangeText={v => setForm({ ...form, contactEmail: v })}
          style={styles.input}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {CLUB_TYPES.map(type => (
            <Chip
              key={type}
              selected={form.type === type}
              onPress={() => setForm({ ...form, type })}
              style={styles.chip}
            >
              {type}
            </Chip>
          ))}
        </ScrollView>
        <Text style={styles.label}>Logo</Text>
        <Button mode="outlined" onPress={() => pickImage('logo')} style={styles.input}>Upload Logo</Button>
        {form.logo ? <Image source={{ uri: form.logo }} style={styles.logo} /> : null}
        <Text style={styles.label}>Cover Image</Text>
        <Button mode="outlined" onPress={() => pickImage('coverImage')} style={styles.input}>Upload Cover</Button>
        {form.coverImage ? <Image source={{ uri: form.coverImage }} style={styles.logo} /> : null}
        <Text style={styles.label}>Location</Text>
        <TextInput
          label="City"
          value={form.location.city}
          onChangeText={v => setForm({ ...form, location: { ...form.location, city: v } })}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Province"
          value={form.location.province}
          onChangeText={v => setForm({ ...form, location: { ...form.location, province: v } })}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Country"
          value={form.location.country}
          onChangeText={v => setForm({ ...form, location: { ...form.location, country: v } })}
          style={styles.input}
          mode="outlined"
        />
        {/* 坐标可选，略 */}
        <Text style={styles.label}>Rules</Text>
        <View style={styles.row}>
          <TextInput
            label="Add Rule"
            value={ruleInput}
            onChangeText={setRuleInput}
            style={[styles.input, { flex: 1 }]}
            mode="outlined"
          />
          <Button onPress={handleAddRule} style={{ marginLeft: 8 }}>Add</Button>
        </View>
        <View style={styles.chipRow}>
          {form.rules.map((rule, idx) => (
            <Chip key={idx} onClose={() => handleRemoveRule(idx)} style={styles.chip}>{rule}</Chip>
          ))}
        </View>
        <Text style={styles.label}>Tags</Text>
        <View style={styles.row}>
          <TextInput
            label="Add Tag"
            value={tagInput}
            onChangeText={setTagInput}
            style={[styles.input, { flex: 1 }]}
            mode="outlined"
          />
          <Button onPress={handleAddTag} style={{ marginLeft: 8 }}>Add</Button>
        </View>
        <View style={styles.chipRow}>
          {form.tags.map((tag, idx) => (
            <Chip key={idx} onClose={() => handleRemoveTag(idx)} style={styles.chip}>{tag}</Chip>
          ))}
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Private Club</Text>
          <Switch value={form.isPrivate} onValueChange={v => setForm({ ...form, isPrivate: v })} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Create Club ChatRoom</Text>
          <Switch value={form.createChatRoom} onValueChange={v => setForm({ ...form, createChatRoom: v })} />
        </View>
        {error ? <HelperText type="error" visible={true}>{error}</HelperText> : null}
        {success ? <HelperText type="info" visible={true}>{success}</HelperText> : null}
        <Button mode="contained" onPress={handleSubmit} loading={loading} disabled={loading} style={styles.submitBtn}>
          Create Club
        </Button>
      </Surface>
      <Snackbar visible={!!success} onDismiss={() => setSuccess('')} duration={1200}>{success}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  surface: { margin: 16, padding: 20, borderRadius: 10, elevation: 4 },
  title: { textAlign: 'center', marginBottom: 24 },
  input: { marginBottom: 16 },
  label: { fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
  chip: { marginRight: 8, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  logo: { width: 64, height: 64, borderRadius: 32, marginBottom: 12, alignSelf: 'center' },
  submitBtn: { marginTop: 16 },
}); 