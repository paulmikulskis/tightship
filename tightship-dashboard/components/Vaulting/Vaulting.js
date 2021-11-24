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
import Stack from '@mui/material/Stack';
import { useQuery, gql } from "@apollo/client";

import Calculator from './Calculator';
import DefaultStepper from './DefaultStepper';


const StyledDefaultStepper = styled(Box)`
    width: 100%;
`;

const VaultingContainer = styled(Box)`
    padding: 2rem;
    margin: 1rem;
    height: 100%;
    width: 100%;

    display: flex;
    flex-direction: column;

`;

const VaultingHeader = styled(Stack)`
    padding: 0rem 1rem 2rem 0;
`;

const Vaulting = () => {

    const [stepperStep, setStepperStep] = useState(0);


    return (
        <VaultingContainer>
            <VaultingHeader direction="row" spacing={6} sx={{width: '100%'}}>
                <Box sx={{width: '100%'}}>   
                    <h1 style={{'padding-bottom': '1rem'}}>Vaulting Tool</h1>
                    <StyledDefaultStepper>
                        <DefaultStepper stepperStep={[stepperStep, setStepperStep]} />
                    </StyledDefaultStepper>
                </Box>
            </VaultingHeader>
            <Divider variant="middle" />
            <Calculator stepperStep={[stepperStep, setStepperStep]}/>
        </VaultingContainer>
    )
}





export default Vaulting
