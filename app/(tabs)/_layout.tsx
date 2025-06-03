import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';

function ProfileTabIcon() {
  const { currentUser, isAuthenticated } = useAuth();
  if (isAuthenticated && currentUser?.name) {
    const initials = currentUser.name.substring(0, 2).toUpperCase();
    return <Avatar.Text size={28} label={initials} style={{ backgroundColor: '#7c3aed' }} />;
  }
  // 未登录用户显示人形icon
  return <IconSymbol size={28} name="person.crop.circle" color="#888" />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message" color={color} />,
        }}
      />
      <Tabs.Screen
        name="createRide"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          title: 'Clubs',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.3.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <ProfileTabIcon />,
        }}
      />
    </Tabs>
  );
}
