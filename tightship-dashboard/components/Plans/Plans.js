import { useState, useEffect } from 'react'
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
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

import PlanGrid from './PlanGrid';

const StyledHome = styled(Box)`
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: left;
    height: 100%;
`;

const Center = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

const Plans = () => {
    return (
        <StyledHome>
            <Typography variant='h4'>Vault Plans</Typography>
            <PlanGrid />
            <Typography variant='caption'>Footer</Typography>
            
        </StyledHome>
    )
}

export default Plans
