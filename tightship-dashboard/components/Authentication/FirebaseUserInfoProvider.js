/******
 * This file acts as a general global application-state management context
 * for user information, settings, and other lightweight, important settings like that.
 * 
 * This in essensce replaces Redux
 * We should try and keep values and context put in here to a light load, such as vaulter names, numbers,
 * or perhaps which payment processor connections this user has enabled=true
 * 
 * Fetching things like 1000 lines of transactional history or photos should be left to component-level
 * resolvers.
 * 
 * 
 * There are four steps to adding a new level of context to the UserInfoProvider:
 *  1.) add a variable and variableSetter to the FirebaseUserInfoContext (directly beneath imports)
 *  2.) add a new useState() hook to track the state of the variables you created in the context component above
 *  3.) add a check under the if(user) clause to populate the information if it is undefined on app load
 *  4.) in the useEffect() hook, add another dict entry with the key being the name of the variable from step 1 
 *      and the value being the const used in the useState() hook.  Also add this to the useEffect() watchlist []
 *  5.) add the same key and value to the initState, along with the variable useState() setter
 *  6.) [optional] to make the varibale load every time on /app refresh, add to app.js (check file)
 */

import * as React from "react";
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { doc, getDoc, getFirestore } from "firebase/firestore";

// step 1 ----------------------------------------------------------------
const FirebaseUserInfoContext = React.createContext({
  userConnectionInfo: undefined, 
  setUserConnectionInfo: () => {},
  userVaulters: undefined,
  setUserVaulters: () => {},
});

const FirebaseUserInfoProvider = ({ children }) => {
    const user = useFirebaseAuth();
    const db = getFirestore();

    // step 2 ----------------------------------------------------------------
    const [userConnections, setUserConnections] = React.useState(undefined);
    const [userVaulters, setUserVaulters] = React.useState(undefined)

    // step 3 ----------------------------------------------------------------
    if (user) {
      if (userConnections === undefined) {
        getDoc(doc(db, 'connections', user.uid)).then((savedDoc) => {
          setUserConnections(savedDoc.data());
        });
      };
      if (userVaulters === undefined) {
        getDoc(doc(db, 'vaulters', user.uid)).then((savedDoc) => {
          setUserVaulters(savedDoc.data());
        });
      };
    };

    // step 4 ----------------------------------------------------------------
    React.useEffect(() => {
      setState({ ...state, userVaulters: userVaulters, userConnectionInfo: userConnections })
      return;
    }, [userConnections, userVaulters]);


    const setUserConnectionInfo = (connectionInfo) => {
      setUserConnections(connectionInfo)
    };

    const setUserVaultersState = (vaulters) => {
      setUserVaulters(vaulters)
    };

    // step 5 ----------------------------------------------------------------
    const initState = {
      userConnectionInfo: userConnections,
      setUserConnectionInfo: setUserConnectionInfo,

      userVaulters: userVaulters,
      setUserVaulters: setUserVaultersState
    };

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
