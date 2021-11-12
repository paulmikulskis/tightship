/* eslint-disable react-hooks/rules-of-hooks */
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Authentication from '../components/Authentication/Authentication'
import { useFirebaseAuth } from "../components/Authentication/FirebaseAuthProvider";
import * as React from "react";
import styled from 'styled-components';
import { useFirebaseUserInfo } from '../components/Authentication/FirebaseUserInfoProvider';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import UserInfoSetter from '../components/Authentication/UserInfoSetter'

const StyledHomepage = styled.div`
    display: flex;
    width: 100vw;
    height: 100vh;
    align-items: center;
    justify-content: center;
    text-align: center;
    flex-direction: column;

    button {
        height: 3rem;
        width: 6rem;
    }
`;

const index = () => {

    const user = useFirebaseAuth();
    const router = useRouter();

    return (
        <StyledHomepage>
            <p>Tight Ship Home</p>
            <button onClick={() => user ? router.push('/app') : router.push('/login')}>Login</button>
        </StyledHomepage>
    )
}

export default index
