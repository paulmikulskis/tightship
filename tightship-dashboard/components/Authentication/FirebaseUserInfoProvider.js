import * as React from "react";
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { doc, getDoc, getFirestore } from "firebase/firestore";

const FirebaseUserInfoContext = React.createContext({
  userInfo: undefined, 
  setUserInfo: () => {},
});

const FirebaseUserInfoProvider = ({ children }) => {

    const user = useFirebaseAuth();
    const db = getFirestore();

    let userConnections; 
    if (user) {
      userConnections = getDoc(doc(db, 'connections', user.uid)).then((savedDoc) => {
        userConnections = savedDoc.data();
        return savedDoc.data()
      })
    } else {
      userConnections = undefined;
    }


    const setUserInfo = (info) => {
      setState({...state, userInfo: info})
    }

    const initState = {
      userInfo: userConnections,
      setUserInfo: setUserInfo,
    }

    const [state, setState] = React.useState(initState);

    return (
        <FirebaseUserInfoContext.Provider value={state}>
            {children}
        </FirebaseUserInfoContext.Provider>
    );
};

function useFirebaseUserInfo() {
    const userInfoContext = React.useContext(FirebaseUserInfoContext);
    if (userInfoContext === undefined) {
      throw new Error(
        "'userInfoContext' is undefined, useFirebaseUserInfo must be used within a FirebaseUserInfoProvider"
      );
    }
    return userInfoContext;
  }

export { FirebaseUserInfoProvider, useFirebaseUserInfo };
