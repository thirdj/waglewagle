import Firebase from 'firebase';
import config from './firebase.config';

export const firebaseInit = Firebase.initializeApp(config);

export const database = firebaseInit.database();
