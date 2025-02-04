import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Image, Animated, TouchableOpacity } from 'react-native';
import { DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

export default function CustomDrawerContent(props) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showGroups, setShowGroups] = useState(false);

  // Liste statique des groupes
  const groups = [
    { id: 1, name: "Développeurs React" },
    { id: 2, name: "Groupe UI/UX Design" },
    { id: 3, name: "Team Mobile Apps" },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogout = () => {
    alert('Déconnexion réussie');
    props.navigation.navigate('Login');
  };

  return (
    <Animated.View style={[styles.container, isDarkMode && styles.darkContainer, { opacity: fadeAnim }]}>
      {/* Profil utilisateur */}
      <Animatable.View animation="fadeInDown" duration={1000} style={[styles.userInfoWrapper, isDarkMode && styles.darkUserInfoWrapper]}>
        <Image source={{ uri: 'https://via.placeholder.com/70' }} style={styles.avatar} />
        <Text style={[styles.userName, isDarkMode && styles.darkText]}>John Doe</Text>
        <Text style={[styles.userEmail, isDarkMode && styles.darkText]}>john.doe@email.com</Text>
      </Animatable.View>

      <View style={[styles.separator, isDarkMode && styles.darkSeparator]} />

      {/* Liste des options du Drawer */}
      <DrawerItemList {...props} />

      {/* Mes Groupes */}
      <TouchableOpacity onPress={() => setShowGroups(!showGroups)}>
        <View style={styles.drawerItem}>
          <Ionicons name="people-outline" size={24} color={isDarkMode ? '#fff' : '#333'} />
          <Text style={[styles.drawerLabel, isDarkMode && styles.darkText]}>Mes Groupes</Text>
          <Ionicons name={showGroups ? "chevron-up" : "chevron-down"} size={20} color={isDarkMode ? '#fff' : '#333'} />
        </View>
      </TouchableOpacity>

      {/* Affichage dynamique des groupes */}
      {showGroups && (
        <Animatable.View animation="fadeIn" duration={500} style={styles.groupsContainer}>
          {groups.map(group => (
            <TouchableOpacity key={group.id} style={styles.groupItem} onPress={() => alert(`Groupe : ${group.name}`)}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={isDarkMode ? '#fff' : '#007AFF'} />
              <Text style={[styles.groupText, isDarkMode && styles.darkText]}>{group.name}</Text>
            </TouchableOpacity>
          ))}
        </Animatable.View>
      )}

      {/* Mode sombre */}
      <Animatable.View animation="fadeInUp" duration={1000} style={styles.switchContainer}>
        <Text style={[styles.switchText, isDarkMode && styles.darkText]}>Dark Mode</Text>
        <Switch 
          value={isDarkMode} 
          onValueChange={setIsDarkMode}
          thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      </Animatable.View>

      {/* Déconnexion */}
      <TouchableOpacity style={styles.logoutContainer} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={isDarkMode ? '#fff' : '#333'} />
        <Text style={[styles.logoutText, isDarkMode && styles.darkText]}>Déconnexion</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#1E1E1E',
  },
  userInfoWrapper: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f4f4f4',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  darkUserInfoWrapper: {
    backgroundColor: '#2C2C2C',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#777',
  },
  darkText: {
    color: '#fff',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  darkSeparator: {
    backgroundColor: '#444',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupsContainer: {
    paddingLeft: 50,
    paddingTop: 5,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  groupText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  switchText: {
    fontSize: 16,
    color: '#333',
  },
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
});

