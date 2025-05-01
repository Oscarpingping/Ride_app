import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RideProvider } from '../context/RideContext';
import { MessageProvider } from '../context/MessageContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <RideProvider>
          <MessageProvider>
            <Stack>
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="messages"
                options={{
                  title: 'Messages',
                }}
              />
              <Stack.Screen
                name="create-ride"
                options={{
                  title: 'Create Ride',
                }}
              />
              <Stack.Screen
                name="profile"
                options={{
                  title: 'Profile',
                }}
              />
              <Stack.Screen
                name="ride/[id]"
                options={{
                  headerShown: false,
                }}
              />
            </Stack>
          </MessageProvider>
        </RideProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
