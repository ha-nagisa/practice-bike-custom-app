import Firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const config = {
  apiKey: 'AIzaSyD-pAc_OBEfdYnE06CFrmxQTpifeX-eeac',
  authDomain: 'instagram-app-f8cfc.firebaseapp.com',
  projectId: 'instagram-app-f8cfc',
  storageBucket: 'instagram-app-f8cfc.appspot.com',
  messagingSenderId: '764391997135',
  appId: '1:764391997135:web:f804326333e9afef7701ba',
};

const firebase = Firebase.initializeApp(config);
const { FieldValue } = Firebase.firestore;

export { firebase, FieldValue };
