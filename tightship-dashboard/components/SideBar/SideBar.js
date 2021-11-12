import { useState, useEffect } from 'react'
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Logout from '../Authentication/Logout';
import { BrowserRouter as Router, Switch, Route, Link, useHistory } from 'react-router-dom';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';


const StyledSideBar = styled.div`
    height: 100%;
    //box-shadow: 2px 1px 1px rgba(0,0,0,0.2);
`;

const MenuContainer = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: top;
    align-items: left;
    

    ul {
        width: 100%;
        padding: 0;
        margin: 0;
        list-style-type: none; 
    }

    li {
        margin: 2rem 1rem 2rem 1rem;
    }

`;

const SideBarButton = styled(Button)`
    width: 100%;
    height: 4rem;
    text-align: left;
    padding: 1rem;
    font-size: 1rem; 
    justify-content: left;
    color: black;
`;

const MuiButton = styled(Button)``;


const SideBar = () => {


    const user = useFirebaseAuth();
    const auth = getAuth();
    const router = useRouter();

    let history = useHistory();

    const signOutUser = () => {
        console.log('attempting to sign out user')
        signOut(auth).then(() => {
            console.log('successfully signed out user')
            router.replace('/')
          }).catch((error) => {
            console.log('error signing out user')
          });
    }

    return (
        <StyledSideBar>
            <MenuContainer>
            <div style={{'marginBottom': '-2rem', opacity: '0.7', display: 'flex', 'flexDirection': 'row', padding: '0 1rem 0 1rem', margin: 0, 'justifyContent': 'left', 'textAlign': 'left' }}>
                <p style={{'fontSize': '8px', 'marginTop': '23px'}}>acct: </p>
                <p>{user?.email}</p>
            </div>

            <ButtonGroup
            orientation="vertical"
            aria-label="vertical outlined button group">
                <SideBarButton color='secondary' variant="text" onClick={() => history.replace('/app')}>Home</SideBarButton>
                <SideBarButton color='secondary' variant="text" onClick={() => history.replace('/app/connections')}>Connections</SideBarButton>
                <SideBarButton color='secondary' variant="text" onClick={() => history.replace('/app/account')}>Account</SideBarButton>
                <SideBarButton color='secondary' variant="text" onClick={signOutUser}>Logout</SideBarButton>
            </ButtonGroup>
            </MenuContainer>

        </StyledSideBar>
    )
}

export default SideBar