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
import Grid from '@mui/material/Grid';

const StyledGrid = styled(Grid)`
    padding: 1rem;
`;

const PlanGrid = () => {
    return (
        <StyledGrid container>
            <Grid item xs={3} >
                <p>Hello</p>
            </Grid>
        </StyledGrid>
    )
}

export default PlanGrid
