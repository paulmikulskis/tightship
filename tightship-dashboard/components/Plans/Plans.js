import { useState, useEffect } from 'react'
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { collection, doc, getDocs, addDoc, setDoc, getFirestore } from "firebase/firestore"; 
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import theme from '../../pages/themes';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useQuery, gql } from "@apollo/client";

import PlanGrid from './PlanGrid';

const StyledHome = styled(Box)`
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: left;
    height: 100%;
    width: '100%';
`;

const Header = styled(Box)`
    padding: 1rem;
`;

const Center = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

const TERMINAL_NAMES = gql`
    query TerminalNames($uid: String!) {
        app(uid: $uid) {
            terminals(uid: $uid) {
                info {
                    terminalId
                    locationName
                    lastBalance
                }
            }
        }
    }
`;

const Plans = () => {

    const db = getFirestore();
    const user = useFirebaseAuth();
    const userName = user.displayName.split(' ')[0];
    const [vaultPlans, setVaultPlans] = useState({});
    const { data, error, loading } = useQuery(TERMINAL_NAMES, {
        variables: { uid: user.uid }
    });

    const getVaultPlans = async () => {
        const saveResult = await getDocs(collection(db, 'vaulting', user.uid, 'plans'));
        const plans = {};
        saveResult.forEach((doc) => {
            const plan = doc.data();
            plan.date = plan.date.toDate();
            plans[doc.id] = plan;
        });
        setVaultPlans(plans);
        return true;
    };

    useEffect( () => {
        getVaultPlans();
    }, [])

    if (loading || error) {
        return <p>Loading...{JSON.stringify(error)}</p>;
    };

    return (
        <StyledHome>
            <Header>
                <Typography variant='h4'>{userName}'s Vaulting Plans</Typography>
            </Header>
            <PlanGrid allTerminals={data.app.terminals.info} vaultPlans={[vaultPlans, setVaultPlans]}/>
            <Typography variant='caption'></Typography>
            
        </StyledHome>
    )
}

export default Plans
