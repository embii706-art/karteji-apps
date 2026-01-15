import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Firebase configuration is in google-services.json and GoogleService-Info.plist

export const db = firestore();
export const authService = auth();
export const storageService = storage();

export default {
  db,
  auth: authService,
  storage: storageService,
};
