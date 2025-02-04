import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Share } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../utils/colors'; 
import { fonts } from '../../utils/font';  
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../../config';
//import QRCode from 'react-native-qrcode-svg';

import QRCode from 'react-native-qrcode-svg';

const CreateGroupScreen = () => {
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState('');
  const [groupAmount, setGroupAmount] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [groups, setGroups] = useState([]);
  const [qrModalVisible, setQRModalVisible] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');

  const handleDelete = async (groupId, adminId) => {
    const userId = await AsyncStorage.getItem('userId');
    console.log(userId,adminId);
    if (userId !== adminId._id) {
      Alert.alert('Accès refusé', 'Vous n\'êtes pas l\'admin de ce groupe.');
      return;
    }
  
    Alert.alert('Suppression', `Voulez-vous vraiment supprimer le groupe ${groupId}?`, [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'Supprimer',
        onPress: async () => {
          try {
            const response = await axios.delete(`${API_URL}/groups/${groupId}`);
            if (response.status === 200) {
              setGroups(groups.filter(group => group._id !== groupId));
            } else {
              Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression.');
            }
          } catch (error) {
            console.error('Erreur de connexion:', error.message);
            Alert.alert('Erreur', 'Impossible de se connecter au serveur.');
          }
        },
      },
    ]);
  };
  ;

  const handleShowQR = (groupId, groupName) => {
    setSelectedGroupId(groupId);
    setSelectedGroupName(groupName);
    setQRModalVisible(true);
  };

  const fetchGroups = async (adminId) => {
    try {
      const response = await axios.get(`${API_URL}/groups/user-groups/${adminId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
   console.log(response.data)
      if (response.status === 200) {
        setGroups(response.data); 
      } else {
        Alert.alert('Erreur', 'Impossible de récupérer les groupes.');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error.message);
      Alert.alert('Erreur', 'Impossible de se connecter au serveur.');
    }
  };

  useEffect(() => {
    const getUserIdAndFetchGroups = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        fetchGroups(userId); 
      } else {
        Alert.alert('Erreur', 'Utilisateur non connecté.');
      }
    };

    getUserIdAndFetchGroups();
  }, []);

  const handleCreateGroup = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
  
      if (!groupName || !groupAmount || !groupDescription || !targetAmount) {
        Alert.alert('Erreur', 'Tous les champs doivent être remplis.');
        return;
      }
  
      const dataToSend = {
        name: groupName.trim(),
        price: parseFloat(groupAmount),
        targetAmount: parseFloat(targetAmount),
        description: groupDescription.trim(),
        adminId: userId, 
      };
  
      const response = await axios.post(
        `${API_URL}/groups`,
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
  
      if (response.status === 201) {
        Alert.alert('Succès', 'Le groupe a été ajouté avec succès.');
        setGroupName('');
        setGroupAmount('');
        setGroupDescription('');
        setTargetAmount('');
        setModalVisible(false);
  
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          fetchGroups(userId);  // Mise à jour de la liste des groupes
        }
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response) {
        Alert.alert('Erreur', error.response.data.error || 'Erreur côté serveur.');
      } else {
        Alert.alert('Erreur', 'Impossible de se connecter au serveur.');
      }
    }
  };

  const handleShareQR = async () => {
    try {
      await Share.share({
        message: `Voici le QR code pour le groupe ${selectedGroupName}.`,
      });
    } catch (error) {
      console.error('Erreur de partage:', error);
      Alert.alert('Erreur', 'Impossible de partager le QR code.');
    }
  };

  const handleJoinGroup = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Erreur', 'Utilisateur non connecté.');
        return;
      }
  
      if (!joinGroupId) {
        Alert.alert('Erreur', 'Veuillez entrer l\'ID du groupe.');
        return;
      }
  
      const url = `${API_URL}/groups/join-group`;
      console.log("URL de l'API:", url); // Vérification de l'URL
  
      const response = await axios.post(
        url,
        { userId, groupId: joinGroupId }, // Ajout du bon format
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
  
      if (response.status === 200) {
        Alert.alert('Succès', 'Vous avez rejoint le groupe avec succès.');
        setJoinGroupId('');
        fetchGroups(userId); // Mise à jour des groupes
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de la tentative de rejoindre le groupe.');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        console.log('Détails de la réponse:', error.response.data);
        if (error.response.status === 400) {
          // Vérifie si le message d'erreur contient cette information
          if (error.response.data.message === 'L\'utilisateur est déjà membre de ce groupe.') {
            Alert.alert('Erreur', 'Vous êtes déjà membre de ce groupe.');
          } else {
            Alert.alert('Erreur', 'Requête invalide. Vérifiez les informations envoyées.');
          }
        } else if (error.response.status === 404) {
          Alert.alert('Erreur', 'Groupe non trouvé. Veuillez vérifier l\'ID du groupe.');
        } else {
          Alert.alert('Erreur', 'Impossible de rejoindre le groupe. Veuillez réessayer.');
        }
      } else {
        Alert.alert('Erreur', 'Impossible de se connecter au serveur.');
      }
    }
  };
  


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liste des Groupes</Text>

      <View style={styles.joinGroupContainer}>
        <TextInput
          style={styles.joinGroupInput}
          placeholder="Entrez l'ID du groupe"
          value={joinGroupId}
          onChangeText={setJoinGroupId}
        />
        <TouchableOpacity style={styles.joinGroupButton} onPress={handleJoinGroup}>
          <Text style={styles.joinGroupButtonText}>Rejoindre</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.items}>
        {groups.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate('Groupe', { groupId: item._id })}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardText}>
                {item.price ? `${item.price}€` : 'Montant non disponible'} | 
                {item.participants && item.participants.length > 0 
                  ? `${item.participants.length} participants` 
                  : 'Aucun participant'}
              </Text>
              <Text style={styles.cardText}>{item.description}</Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => handleDelete(item._id, item.admin)}
            >
              <Icon name="trash" size={25} color="#FF6B6B" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.qrButton} 
              onPress={() => handleShowQR(item._id, item.name)}
            >
              <Icon name="qrcode" size={25} color="#4e73df" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Icon name="plus" size={30} color={colors.blue} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Créer un Groupe</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom du groupe"
              value={groupName}
              onChangeText={setGroupName}
            />
            <TextInput
              style={styles.input}
              placeholder="Prix initial"
              keyboardType="numeric"
              value={groupAmount}
              onChangeText={setGroupAmount}
            />
            <TextInput
              style={styles.input}
              placeholder="Seuil"
              keyboardType="numeric"
              value={targetAmount}
              onChangeText={setTargetAmount}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              multiline
              numberOfLines={4}
              value={groupDescription}
              onChangeText={setGroupDescription}
            />
            <TouchableOpacity style={styles.button} onPress={handleCreateGroup}>
              <Text style={styles.buttonText}>Créer le groupe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR Modal */}
      <Modal visible={qrModalVisible} animationType="fade" transparent={true} onRequestClose={() => setQRModalVisible(false)}>
        <View style={styles.qrModalContainer}>
          <View style={styles.qrModalContent}>
            <TouchableOpacity style={styles.qrCloseButton} onPress={() => setQRModalVisible(false)}>
              <Icon name="times" size={30} color="#000" />
            </TouchableOpacity>
            <Text style={styles.qrTitle}>{selectedGroupName}</Text>
            <QRCode value={`${API_URL}/groups/${selectedGroupId}`} size={200} />
            <TouchableOpacity style={styles.qrShareButton} onPress={handleShareQR}>
              <Icon name="share-alt" size={30} color="#4e73df" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAED',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
    color: '#333',
  },
  items: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFF',
    marginBottom: 15,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    position: 'relative',
  },
  cardContent: {
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  cardText: {
    fontSize: 16,
    color: '#555',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 50,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  deleteButton: {
    position: 'absolute',
    top: 35,
    right: 20,
  },
  qrButton: {
    position: 'absolute',
    top: 35,
    right: 60,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 10,
    width: '80%',
  },
  qrModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  qrModalContent: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  qrCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  qrShareButton: {
    marginTop: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 5,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: '#4e73df',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#e0e0e0',
    marginTop: 10,
  },
  joinGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  joinGroupInput: {
    flex: 1,
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginRight: 10,
  },
  joinGroupButton: {
    backgroundColor: '#4e73df',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  joinGroupButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateGroupScreen;