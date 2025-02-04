import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, StyleSheet, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Card } from "react-native-paper";
import axios from "axios";
import { API_URL } from '../../config';

const PortfolioScreen = ({ route }) => {
  const { groupId } = route.params || {}; 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/groups/${groupId}/info`);
        setData(response.data);
        console.log("Données reçues :", response.data);
      } catch (err) {
        setError(err.message);
        console.error("Erreur lors de la récupération des données :", err);
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchData();
    }
  }, [groupId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erreur : {error}</Text>
      </View>
    );
  }

  if (!data || !data.transactions || data.transactions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noData}>Aucune transaction trouvée.</Text>
      </View>
    );
  }

  // Extraction des transactions pour le graphe
  const transactionAmounts = data.transactions.map((t) => t.amount);
  const transactionDates = data.transactions.map((t) => {
    const date = new Date(t.date);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });
  const transactionsByDate = {};

data.transactions.forEach((transaction) => {
  const date = new Date(transaction.date).toISOString().split("T")[0]; // Extraire la date sans l'heure

  if (!transactionsByDate[date]) {
    transactionsByDate[date] = { total: 0, count: 0 };
  }

  transactionsByDate[date].total += transaction.amount;
  transactionsByDate[date].count += 1;
});

// Calcul du prix moyen par jour
const dailyAverages = Object.keys(transactionsByDate).map((date) => ({
  date,
  average: transactionsByDate[date].total / transactionsByDate[date].count,
}));

// Calcul du total des transactions
const totalTransactions = data.transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

// Calcul du pourcentage consommé
const percentageConsumed = ((totalTransactions / data.initialPrice) * 100).toFixed(2);

  return (
    <View style={styles.container}>
      <Text style={styles.groupName}>Détails du groupe</Text>

      <LineChart
        data={{
          labels: transactionDates,
          datasets: [
            {
              data: transactionAmounts,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              strokeWidth: 2,
            },
          ],
        }}
        width={Dimensions.get("window").width - 30}
        height={220}
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 10 },
          propsForDots: { r: "5", strokeWidth: "2", stroke: "#007AFF" },
        }}
        bezier
        style={styles.chart}
      />

      {/* Portefeuille */}
      <View style={styles.portfolio}>
        <Text style={styles.portfolioTitle}>Votre Portefeuille</Text>
        <View style={styles.row}>
          <Card style={styles.card}>
          <Text style={styles.label}>Prix Initial</Text>
<Text style={styles.value}>{data?.initialPrice || "N/A"} €</Text>

          </Card>
          <Card style={styles.card}>
          <Text style={styles.label}>Prix Initial</Text>
<Text style={styles.value}>{data?.recentPrice || "N/A"} €</Text>

          </Card>
        </View>
        <View style={styles.row}>
   <Card style={styles.card}>
    <Text style={styles.label}>Nombre de Transactions</Text>
    <Text style={styles.value}>{data?.transactions.length || 0}</Text>
  </Card>


          <Card style={styles.card}>
            <Text style={styles.label}>Gain/Pertes</Text>
            <Text style={[styles.value, { color: "red" }]}>
            ▼{percentageConsumed ? `${percentageConsumed} %` : "N/A"}
            </Text>
          </Card>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 15,
  },
  groupName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
    top: 50,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    top: 50,
  },
  portfolio: {
    backgroundColor: "#F1F3F6",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  portfolioTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
    padding: 15,
    margin: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: "#888",
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PortfolioScreen;
