import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Baby, Plus, History } from 'lucide-react-native'
import HomeScreen from '../screens/HomeScreen'
import RecordScreen from '../screens/RecordScreen'
import HistoryScreen from '../screens/HistoryScreen'
import { COLORS } from './theme'

export type AppTabParamList = {
  Home: undefined
  Record: undefined
  History: undefined
}

const Tab = createBottomTabNavigator<AppTabParamList>()

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: COLORS.border },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Meu Filho',
          tabBarLabel: 'Bebê',
          tabBarIcon: ({ color, size }) => <Baby color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Record"
        component={RecordScreen}
        options={{
          title: 'Registrar',
          tabBarLabel: 'Registrar',
          tabBarIcon: ({ color, size }) => <Plus color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Histórico',
          tabBarLabel: 'Histórico',
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  )
}
