import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Permissions from 'expo-permissions';
import { Alert } from 'react-native';

// Fonction pour demander la permission et récupérer le token Expo
export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission refusée', 'Activez les notifications dans les paramètres.');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);
  } else {
    Alert.alert('Erreur', 'Les notifications ne fonctionnent pas sur un simulateur.');
  }

  return token;
}

// Fonction pour envoyer une notification locale
export async function sendNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔔 Notification",
      body: "Ceci est une notification locale 🚀",
      data: { info: 'Donnée test' },
    },
    trigger: { seconds: 2 },
  });
}
