import { useState, useEffect } from 'react';
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Logout from '../Authentication/Logout';
import { BrowserRouter as Router, Switch, Route, Link, useHistory } from 'react-router-dom';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import HomeIcon from '@mui/icons-material/Home';
import ShareIcon from '@mui/icons-material/Share';
import MapIcon from '@mui/icons-material/Map';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';

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
    padding: 1rem;
    font-size: 1rem; 
    color: black;

`;



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
            aria-label="vertical outlined button group"
            style={{'paddingLeft': '0.5rem'}}>
                <SideBarButton endIcon={<HomeIcon />} color='secondary' variant="text" onClick={() => history.replace('/app')} style={{padding: "1rem", justifyContent: "flex-start"}}>Home</SideBarButton>
                <SideBarButton endIcon={<DashboardIcon />} color='secondary' variant="text" onClick={() => history.replace('/app/dashboard')} style={{padding: "1rem", justifyContent: "flex-start"}}>Dashboard</SideBarButton>
                <SideBarButton endIcon={<ShareIcon />} color='secondary' variant="text" onClick={() => history.replace('/app/connections')} style={{padding: "1rem", justifyContent: "flex-start"}}>Connections</SideBarButton>
                <SideBarButton endIcon={<MapIcon />} color='secondary' variant="text" onClick={() => history.replace('/app/mapping')} style={{padding: "1rem", justifyContent: "flex-start"}}>Mapping</SideBarButton>
                <SideBarButton endIcon={<MonetizationOnIcon />} color='secondary' variant="text" onClick={() => history.replace('/app/vaulting')} style={{padding: "1rem", justifyContent: "flex-start"}}>Vaulting</SideBarButton>
                <SideBarButton endIcon={<StickyNote2Icon />} color='secondary' variant="text" onClick={() => history.replace('/app/plans')} style={{padding: "1rem", justifyContent: "flex-start"}}>Plans</SideBarButton>
                <SideBarButton endIcon={<ListAltIcon />} color='secondary' variant="text" onClick={() => history.replace('/app/account')} style={{padding: "1rem", justifyContent: "flex-start"}}>Data</SideBarButton>
                <SideBarButton endIcon={<AccountCircleIcon />} color='secondary' variant="text" onClick={() => history.replace('/app/account')} style={{padding: "1rem", justifyContent: "flex-start"}}>Account</SideBarButton>
                <SideBarButton endIcon={<LogoutIcon />} color='secondary' variant="text" onClick={signOutUser} style={{padding: "1rem", justifyContent: "flex-start"}}>Logout</SideBarButton>
            </ButtonGroup>
            </MenuContainer>

        </StyledSideBar>
    )
}

export default SideBar
