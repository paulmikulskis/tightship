import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '../Authentication/FirebaseAuthProvider';
import styled from 'styled-components';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ShareIcon from '@mui/icons-material/Share';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import { useQuery, gql } from "@apollo/client";

import Calculator from './Calculator';



const TERMINAL_BALANCES_QUERY = gql`
    query TerminalBalancesQuery($uid: String!) {
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


const VaultingContainer = styled(Box)`
    padding: 2rem;
    margin: 1rem;
    height: 100%;
    width: 100%;

    display: flex;
    flex-direction: column;

`;

const Vaulting = () => {

    const user = useFirebaseAuth();
    const uid = user.uid;

    const { loading, error, data } = useQuery(TERMINAL_BALANCES_QUERY,{
        variables: { uid }
    });

    if (loading || error) {
        return <p>Loading...{JSON.stringify(error)}</p>;
    };

    const balances = data.app.terminals.info;


    return (
        <VaultingContainer>
            <h1>Vaulting Tool</h1>
            <p style={{'margin-top': '0', color: 'grey'}}>Iterate through vaulting plans instantly</p>
            <Divider variant="middle" />
            <Calculator terminalData={balances}/>
        </VaultingContainer>
    )
}





export default Vaulting
