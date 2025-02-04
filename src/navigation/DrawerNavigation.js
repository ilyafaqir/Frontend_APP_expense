import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/Home';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import CustomDrawerContent from '../components/CustomerDrawerContent'; // Importation du CustomDrawerContent
import { Ionicons } from '@expo/vector-icons'; // Importation des icônes

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}  // Personnalisation du Drawer
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#f4f4f4',
          width: 240,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
        drawerActiveTintColor: '#4CAF50',
        drawerInactiveTintColor: '#333',
      }}
    >
      {/* Ajout de l'icône pour Home */}
 

      {/* Ajout de l'icône pour CreateGroup */}
      <Drawer.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
