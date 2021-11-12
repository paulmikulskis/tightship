//require ('tightship-config');
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { collection, doc as fdoc, setDoc, getDoc, where } from "firebase/firestore"; 
import { config } from 'tightship-config';

const App = initializeApp({
  credential: applicationDefault(),
  databaseURL: config.get('firebase.databaseURL'),
});

/**
 * 
 * @returns the Firestore database client
 */
const getDatabase = () => {
  return getFirestore();
}

/**
 * Clears the local emulator firestore database. 
 * This function was originally written to help clear Mocha
 * tests in between each other.
 */
const clearEmulatedFirestore = async () => {
  const pid = config.get('firebase.projectId')
  const endpoint = `http://localhost:8080/emulator/v1/projects/${pid}/databases/(default)/documents`;
  fetch(endpoint, {method: 'DELETE'}).then((response) => {
    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  })
}

const getUserDoc = async (uid) => {
  const db = getDatabase();
  const docRef = db.collection('accounts').doc(uid)
  const docSnap = await docRef.get();
  const doc = docSnap.data();
  if (!doc.email) {
    console.log("ERROR, no user document present for user (yeah, wtf right?!):", uid);
    return undefined;
  }
  return docSnap;
}

/**
 * 
 * @param {String} uid the Firebase user ID
 * @returns the credentials for a PAI account from Firebase 
 */
const getPAICredentials = async (uid) => {
  const db = getDatabase();
  const docRef = db.collection('connections').doc(uid)
  const docSnap = await docRef.get();
  const doc = docSnap.data()
  if (!doc) {
    console.log("ERROR, no connections document present for user:", uid);
    return {
      username: undefined,
      password: undefined,
    };
  }
  // put encryption logic here to decode the username/password
  return {
    username: doc.username,
    password: doc.password,
  }
};

/**
 * 
 * @param {String} uid the Firebase user ID
 * @returns the credentials for a CDS account from Firebase 
 */
const getCDSCredentials = async (uid) => {
    return {undefined, undefined}
}


export { 
  getDatabase, 
  clearEmulatedFirestore,
  getPAICredentials,
  getCDSCredentials,
  getUserDoc,
};
