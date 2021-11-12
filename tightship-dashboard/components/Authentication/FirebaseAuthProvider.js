import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import * as React from "react";
//import Config from "../Config";

const FirebaseAuthContext = React.createContext(undefined);

const FirebaseAuthProvider = ({ children }) => {
    const [user, setUser] = React.useState(null);
    const value = { user };
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSENGER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
    };
  
    const app = initializeApp(firebaseConfig);

    const db = getFirestore();
    const auth = getAuth(app);
    auth.languageCode = 'en';

    if((process.env.NODE_ENV === 'development') && (typeof window === 'undefined' || !window['_init'])) {
      connectAuthEmulator(auth, "http://localhost:9099");
      connectFirestoreEmulator(db, 'localhost', 8080);
      if(typeof window !== 'undefined') {
         window['_init'] = true;
      }
    }

    React.useEffect(() => {
        const unsubscribe = auth.onIdTokenChanged(setUser);
        return unsubscribe;
    }, []);

    return (
        <FirebaseAuthContext.Provider value={value}>
        {children}
        </FirebaseAuthContext.Provider>
    );
    };

function useFirebaseAuth() {
    const context = React.useContext(FirebaseAuthContext);
    if (context === undefined) {
      throw new Error(
        "useFirebaseAuth must be used within a FirebaseAuthProvider"
      );
    }
    return context.user;
  }

export { FirebaseAuthProvider, useFirebaseAuth };
