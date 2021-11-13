import { useState } from 'react'
import {  getAuth, signOut } from "firebase/auth";
import styled from 'styled-components';
import { useFirebaseAuth } from "./FirebaseAuthProvider";
import FormItem from './Login'
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';


const SignOut = styled(Button)`
    height: ${props => props.height ? props.height : '2.75rem'};
    width: ${props => props.width ? props.width : '100%'};
`;

const Logout = (props) => {

    const auth = getAuth();
    const user = useFirebaseAuth();
    const router = useRouter()

    //console.log('loggedin prop:', user ? 'logged in' : 'logged out')

    const signOutUser = () => {
        console.log('attempting to sign out user')
        signOut(auth).then(() => {
            console.log('successfully signed out user')
            router.replace('/')
          }).catch((error) => {
            console.log('error signing out user')
          });
    }

    if (user) {
        return <SignOut 
            width={props.width} 
            height={props.height} 
            onClick={signOutUser}
            variant='contained'
            color='primary'
            >Sign out</SignOut>
    } else {
        return <div></div>;
    }
}

export default Logout
