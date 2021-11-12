import { useState } from 'react'
import styled from 'styled-components';
import { getAuth, signOut } from "firebase/auth";
import { useFirebaseUserInfo } from '../Authentication/FirebaseUserInfoProvider';


const SignOutButton = styled.input`

`;


const SignOut = () => {
    const auth = getAuth();
    const userContext = useFirebaseUserInfo();

    const signOutUser = () => {
        console.log('attempting to sign out user')
        signOut(auth).then(() => {
            userContext.setUserInfo({})
            console.log('successfully signed out user')
          }).catch((error) => {
            console.log('error signing out user')
          });
    }

    return (
        <SignOutButton onClick={signOutUser}>Sign out</SignOutButton>
    )
}

export default SignOut
