import Firebase from 'firebase';
import config from './firebase.config';

export const firebaseInit = Firebase.initializeApp(config);

// export const provider = new Firebase.auth.GoogleAuthProvider();
//
// export const auth = firebaseInit.auth();
export const database = firebaseInit.database();
