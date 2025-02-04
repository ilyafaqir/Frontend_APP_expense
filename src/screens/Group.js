import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView, TextInput, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { useRoute } from '@react-navigation/native'; 
import { API_URL } from '../../config';
import PushNotification from 'react-native-push-notification';
import { Share } from 'react-native';
 
const App = () => {
  const [modalVisible, setModalVisible] = useState(false);  
  const [formData, setFormData] = useState({ name: '', amount: '' });  
  const [initialBalance, setInitialBalance] = useState(5);  
  const [currentBalance, setCurrentBalance] = useState(5672.70);  
  const [recentTransactions, setRecentTransactions] = useState([]);  
  const [isSubmitting, setIsSubmitting] = useState(false);  
  const [groupIdFromResponse, setGroupIdFromResponse] = useState(null);
  const [participants, setParticipants] = useState([]); 
 
  const route = useRoute();
  const { groupId } = route.params || {};  
  
  const fetchGroupParticipants = async (groupId) => {
    try {
      if (!groupId) {
        alert('Le groupId est requis.');
        return;
      }
      const response = await axios.get(`${API_URL}/groups/${groupId}/participants`);
      console.log('Participants:', response.data.users);
      if (response.status === 200) {
        const participants = response.data.users;
        if (participants.length === 0) {
          alert('Aucun participant trouvé pour ce groupe.');
        } else {
          setParticipants(participants);  
        }
      } else {
        alert(`Erreur: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des participants:', error);
      alert('Une erreur est survenue lors de la récupération des participants.');
    }
  };


  useEffect(() => {
    if (!groupId) {
      console.log('Group ID is not available');
      return;
    }
    fetchGroupParticipants(groupId);

    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/groups/group/${groupId}/expenses`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
    
        if (response.data && response.data.length === 0) {
          console.log('Pas de transaction disponible');
          alert("Aucune transaction trouvée.");
          setRecentTransactions([]);
        } else {
          setRecentTransactions(response.data);
          console.log('Transactions:', response.data);
        }
    
        const updateResponse = await axios.post(
          `${API_URL}/groups/update-group-expenses/${groupId}`
        );
    
        console.log('Group updated successfully:', updateResponse.data);
    
        setInitialBalance(updateResponse.data.price);
        setCurrentBalance(updateResponse.data.recentPrice);
        
        // Utiliser idG de updateResponse
        setGroupIdFromResponse(updateResponse.data.idG);
        console.log('Group ID from response cette id cest le id envoyer:', updateResponse.data.idG);
    
      } catch (error) {
        console.log('Error fetching transactions:', error);
        alert("Erreur lors de la récupération des transactions.");
      }
    };
    
    

    fetchTransactions();
  }, [groupId]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const { name, amount } = formData;

    if (!name || !amount || isNaN(amount)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs correctement.');
      setIsSubmitting(false);
      return;
    }

    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!userId || !groupId) {
        Alert.alert('Erreur', 'Les informations nécessaires ne sont pas disponibles.');
        setIsSubmitting(false);
        return;
      }

      const data = {
        name,
        amount: parseFloat(amount),
        userId,
        groupId,
        description: "Description facultative",
      };

      const response = await axios.post(`${API_URL}/groups/add-expense`, data, {
        headers: { 'Content-Type': 'application/json' },
      });

      Alert.alert('Succès', 'Transaction ajoutée avec succès');
      setFormData({ name: '', amount: '' });

      // Recharger les transactions après l'ajout
      const updatedTransactions = await axios.get(`${API_URL}/groups/group/${groupId}/expenses`);
      setRecentTransactions(updatedTransactions.data);

      const updateResponse = await axios.post(
        `${API_URL}/groups/update-group-expenses/${groupId}`
      );
      setInitialBalance(updateResponse.data.price);
      setCurrentBalance(updateResponse.data.recentPrice);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleShareGroupId = async () => {
    try {
      const code = groupIdFromResponse || groupId || 'TEST123'; 
      console.log('Code à partager :', code);
      
      await Share.share({
        message: `${code}`,
      });
    } catch (error) {
      console.error('Erreur lors du partage :', error);
      Alert.alert('Erreur', 'Impossible de partager le code du groupe.');
    }
  };
  
  
  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning</Text>
        <Text style={styles.username}>Dinith Perera</Text>
      </View>

      <View style={styles.balanceContainer}>
        <View style={styles.balanceLeft}>
          <Text style={styles.balanceLabel}>Initial Balance</Text>
          <Text style={styles.balanceAmount}>${initialBalance.toFixed(2)}</Text>
        </View>
        <View style={styles.balanceRight}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>${currentBalance.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={handleShareGroupId}>
  <Text style={styles.buttonText}>Send</Text>
</TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Recieve</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.quickSend}>Quick Send</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickSendContainer}>
        {participants.map(contact => (
          <TouchableOpacity key={contact.id} style={styles.contact}>
            <Icon name="user" size={50} color="#fff" />
            <Text style={styles.contactName}>{contact.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.transactions}>Recent Transactions</Text>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
       showsVerticalScrollIndicator={false}
        data={recentTransactions}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <Text style={styles.transactionName}>{item.name}</Text>
            <Text style={styles.transactionUser}>
              Utilisateur: {
                item.user && typeof item.user === 'object' && item.user.name
                  ? item.user.name
                  : 'Utilisateur non défini'
              }
            </Text>
            <Text style={styles.transactionDetails}>{item.date}</Text>
            <Text style={styles.transactionAmount}>{item.amount} DH</Text>
          </View>
        )}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader} 
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerButtonText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}       onPress={() => navigation.navigate('Dashbord')} // Navigation vers la page Dashboard
        >
          <Text style={styles.footerButtonText}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.footerButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Modal pour le formulaire */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Transaction</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter Amount"
              keyboardType="numeric"
              value={formData.amount}
              onChangeText={(text) => setFormData({ ...formData, amount: text })}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
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
    backgroundColor: '#ffffff',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    color: '#aaa',
    fontSize: 14,
  },
  username: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  balanceLeft: {
    alignItems: 'flex-start',
  },
  balanceRight: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: '#aaa',
    fontSize: 14,
  },
  balanceAmount: {
    color: '#000',
    fontSize: 32,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#ff6600',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickSend: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
  },
  quickSendContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  contact: {
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
  },
  contactName: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  transactions: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 0,
  },
  transactionItem: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  transactionName: {
    color: '#000',
    fontSize: 16,
  },
  transactionDetails: {
    color: '#aaa',
    fontSize: 12,
  },
  transactionAmount: {
    color: '#ff6600',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#222',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  footerButton: {
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#ff6600',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ff6600',
  },
});

export default App;  