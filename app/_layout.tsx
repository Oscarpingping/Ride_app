import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { MessageProvider } from './context/MessageContext';
import { RideProvider } from './context/RideContext';
import { ClubProvider } from './context/ClubContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <RideProvider>
            <ClubProvider>
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
                  <Stack.Screen
                    name="club/[id]"
                    options={{
                      title: 'Club Details',
                    }}
                  />
                  <Stack.Screen
                    name="create-club"
                    options={{
                      title: 'Create Club',
                    }}
                  />
                </Stack>
              </MessageProvider>
            </ClubProvider>
          </RideProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
