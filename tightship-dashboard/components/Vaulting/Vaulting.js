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



const VaultingContainer = styled(Box)`
    padding: 2rem;
    margin: 1rem;
    height: 100%;
    width: 100%;

    display: flex;
    flex-direction: column;

`;

const Vaulting = () => {

    return (
        <VaultingContainer>
            <h1>Vaulting Tool</h1>
            <p style={{'marginTop': '0', color: 'grey'}}>Iterate through vaulting plans instantly</p>
            <Divider variant="middle" />
            <Calculator />
        </VaultingContainer>
    )
}





export default Vaulting
