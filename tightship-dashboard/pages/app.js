/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from 'react';
import { useFirebaseAuth } from "../components/Authentication/FirebaseAuthProvider";
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Header from '../components/Header/Header';
import SideBar from '../components/SideBar/SideBar';
import AppHome from '../components/AppHome/AppHome';
import Connections from '../components/Conections/Connections';
import Account from '../components/Account/Account';
import Dashboard from '../components/Dashboard/Dashboard';
import MappingHome from '../components/Mapping/MappingHome';
import Vaulting from '../components/Vaulting/Vaulting';

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useFirebaseUserInfo } from '../components/Authentication/FirebaseUserInfoProvider';


const StyledHome = styled(Box)`
    width: 100%;
    height: 100vh;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: 15rem auto 2rem;
    grid-template-rows: 5rem auto;
`;

const GridHeader = styled(Box)`
    grid-row: 1 / 2;
    grid-column: 1 / 4;
    height: 100%;
    width: 100%;
`;

const GridSideBar = styled(Box)`
    grid-row: auto;
    grid-column: 1;
    height: 100%;
    width: 100%;
`;

const GridAppHome = styled(Box)`
    width: 100%;
    height: 100%;
    grid-column: 2 / 3;
    grid-row: 2 / auto;
`;

const GridRightSide = styled(Box)`
    grid-row: 2 / auto;
    grid-column: 3;
    height: 100%;
    width: 100%;
    z-index: -1;
`;

const app = () => {

    const user = useFirebaseAuth();
    const router = useRouter();
    const userInfoContext = useFirebaseUserInfo();
    const db = getFirestore();
    const [loading, setLoading] = useState(true);
    const [userSettings, setUserSettings] = useState('');

    const appBackgroundColor = 'background.default';
    const sidebarsBackgroundColor = 'background.paper';
    const headBackgroundColor = 'primary.dark'


    useEffect(() => {
        if (user) {
            const docRef = doc(db, "connections", user.uid);
            getDoc(docRef).then(docSnap => {
                if (docSnap.exists()) {
                    console.log('userinfo setter setting user info context, about to render app..', docSnap.data())
                    userInfoContext.setUserInfo(docSnap.data())
                    //setUserSettings(docSnap.data())
                    setLoading(false)
                } else {
                    console.log('no user settings doc found');
                    setLoading(false)
                }
            })
        }

    }, [user, loading])


    if (loading) {
        return (
            <div>
                <p>You, sir or ma`&apos;`am, must be logged in</p>
                <button type="button" onClick={() => router.push('/')}>
                    Go to TightShip home
                </button>
            </div>
        )
    } else {
        return (
                <Router>
                <StyledHome>
                    <GridHeader sx={{backgroundColor: headBackgroundColor}}><Header /></GridHeader>
                    <GridSideBar sx={{backgroundColor: sidebarsBackgroundColor}}><SideBar /></GridSideBar>
                    <Paper elevation={3}>
                    <Switch>
                        <Route path="/app/dashboard">
                            <Dashboard sx={{backgroundColor: appBackgroundColor}}/>
                        </Route>
                        <Route path="/app/connections">
                            <GridAppHome sx={{backgroundColor: appBackgroundColor}}><Connections /></GridAppHome>
                        </Route>
                        <Route path="/app/account">
                            <Account sx={{backgroundColor: appBackgroundColor}}/>
                        </Route>
                        <Route path="/app/mapping">
                            <MappingHome sx={{backgroundColor: appBackgroundColor}}/>
                        </Route>
                        <Route path="/app/vaulting">
                            <GridAppHome sx={{backgroundColor: appBackgroundColor}}><Vaulting /></GridAppHome>
                        </Route>
                        <Route path="/app">
                            <GridAppHome sx={{backgroundColor: appBackgroundColor}}><AppHome /></GridAppHome>
                        </Route>
                    </Switch>
                    </Paper>
                    <GridRightSide sx={{backgroundColor: sidebarsBackgroundColor}}/>
                </StyledHome>
                </Router>
        )
    }
}

export default app
