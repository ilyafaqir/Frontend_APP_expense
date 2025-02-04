import React from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LineChart, BarChart } from 'react-native-chart-kit';  
import { Dimensions } from 'react-native';

const transactionsData = [
  {
    id: 1,
    name: 'Ali',
    amount: -50,
    time: '2025-02-01 10:30',
    initialPrice: 1000,
    finalPrice: 950,
    type: 'Dépense',
  },
  {
    id: 2,
    name: 'Sara',
    amount: 100,
    time: '2025-02-01 12:15',
    initialPrice: 950,
    finalPrice: 1050,
    type: 'Revenu',
  },
  {
    id: 3,
    name: 'Ilyas',
    amount: -30,
    time: '2025-02-01 14:00',
    initialPrice: 1050,
    finalPrice: 1020,
    type: 'Dépense',
  },
  {
    id: 4,
    name: 'Khalid',
    amount: 200,
    time: '2025-02-01 16:30',
    initialPrice: 1020,
    finalPrice: 1220,
    type: 'Revenu',
  },
];

const Dashboard = () => {
  // Calcul de la répartition des revenus et dépenses
  const totalRevenu = transactionsData.filter(item => item.amount > 0).reduce((acc, item) => acc + item.amount, 0);
  const totalDepense = transactionsData.filter(item => item.amount < 0).reduce((acc, item) => acc + item.amount, 0);

  const chartData = {
    labels: ['Revenus', 'Dépenses'],
    datasets: [
      {
        data: [totalRevenu, Math.abs(totalDepense)],
      },
    ],
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Transactions Récentes</Text>
        <FlatList
          data={transactionsData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.transactionItem}>
              <Text style={styles.transactionText}>
                <Text style={styles.bold}>{item.name}</Text> a effectué une{' '}
                <Text style={item.amount < 0 ? styles.expense : styles.income}>
                  {item.type} de {item.amount} USD
                </Text>{' '}
                le {item.time}
              </Text>
              <Text style={styles.transactionText}>
                Prix Initial : {item.initialPrice} USD | Prix Final : {item.finalPrice} USD
              </Text>
            </View>
          )}
        />
      </View>

      {/* Ajout du graphique */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Répartition des Transactions</Text>
        <BarChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffa726',
            },
          }}
          style={{ marginVertical: 10 }}
        />
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => alert('Ajouter une nouvelle transaction')}
      >
        <Icon name="plus" size={30} color="#fff" />
        <Text style={styles.addButtonText}>Ajouter une Transaction</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  transactionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionText: {
    fontSize: 16,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  expense: {
    color: 'red',
  },
  income: {
    color: 'green',
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 50,
    marginTop: 20,
  },
  addButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
  },
});

export default Dashboard;
