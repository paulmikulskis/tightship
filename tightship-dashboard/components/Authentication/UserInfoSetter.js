import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useFirebaseAuth } from "./FirebaseAuthProvider";
import { useFirebaseUserInfo } from './FirebaseUserInfoProvider';
import { useEffect } from 'react';

const UserInfoSetter = ({ children }) => {

    const user = useFirebaseAuth(); 
    const userInfoContext = useFirebaseUserInfo();
    const db = getFirestore();

    useEffect(() => {
        const docRef = doc(db, "connections", user.uid);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                console.log('userinfo setter setting user info context')
                userInfoContext.setUserConnectionInfo(docSnap.data());
            } else {
                console.log('no user settings doc found');
            }
        })
        return true;
    })


    return (
        <div>
            {children}
        </div>
    )
}

export default UserInfoSetter
