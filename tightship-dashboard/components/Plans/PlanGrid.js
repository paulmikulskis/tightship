/* eslint-disable react/jsx-key */
import { useState, useCallback } from 'react'
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { collection, doc, getDocs, addDoc, setDoc, getFirestore } from "firebase/firestore"; 
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Popover from '@mui/material/Popover';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import theme from '../../pages/themes';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import EditIcon from '@mui/icons-material/Edit';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlanDataGrid from './PlanDataGrid';
import MoneyStatement from '../StatCard/MoneyStatement';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import PlanCard from './PlanCard';

const StyledGrid = styled(Grid)`
    padding: 1rem;
`;

const StyledVaultPlanCard = styled(Card)`
    min-height: 300px;
`;

const PlanGrid = (props) => {

    const allTerminals = props.allTerminals;
    const [vaultPlans, setVaultPlans] = props.vaultPlans;
    const [invisible, setInvisible] = useState([]);

    console.log(`invisible cardsnames: ${invisible}`)
    
    //console.log(`main component vaultPlans: ${JSON.stringify(vaultPlans, null, 1)}`);
    var cards = Object.entries(vaultPlans)
        .filter(p => !invisible.includes(p[0]))
        .map( ([name, vaultPlan], index) => {
            console.log(`making new card ${name}`);
            return (
                <Grid item xs={4}>
                    <PlanCard 
                        allTerminals={allTerminals}
                        key={name} 
                        name={name} 
                        vaultPlan={vaultPlan} 
                        invisible={[invisible, setInvisible]} 
                    />
                </ Grid>)
        });

    return (
        <div>
        <StyledGrid 
            spacing={2}
            container
            sx={{
                width: '100%',
            }}
        >
            {cards}
        </StyledGrid>
        </div>
    )
}

export default PlanGrid
