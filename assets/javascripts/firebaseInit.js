import Firebase from 'firebase';
import config from './firebase.config';

const firebaseInit = Firebase.initializeApp(config);
const database = firebaseInit.database();

export default database;
