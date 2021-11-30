import { useState, useEffect } from 'react'
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { useFirebaseUserInfo } from '../Authentication/FirebaseUserInfoProvider';

import { useRouter } from 'next/router';
import styled from 'styled-components';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import PaiConnect from './PaiConnect';
import Vaulters from './Vaulters';
import Locations from './Locations';

const ConnectionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 2rem 1rem;
    
`;

const Center = styled.div`
    height: 100%;
    width: 65%; 

    @media screen and (min-width: 1301px) {
        width: 65%;
    };

    @media screen and (max-width: 1300px) {
        width: 85%;
    };

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: top;
`;

const ConnectionsAccordion = styled(Accordion)`
    margin-top: 1rem;
    margin-bottom: 1rem;
    width: 100%;
    padding: 1rem;
`;

const Connections = () => {

    const [expanded, setExpanded] = useState(false);
    const user = useFirebaseAuth();
    const userInfoContext = useFirebaseUserInfo();
    const userVaulters= userInfoContext.userVaulters;
    
    const handleChange = (panel) => (event, isExpanded) => {
      setExpanded(isExpanded ? panel : false);
    };


    return (
        <ConnectionsContainer>
        <Center>
            <ConnectionsAccordion 
                expanded={expanded === 'panel1'} 
                onChange={handleChange('panel1')} 
                sx={{
                    borderRadius: '10px',
                    '&:before': {
                            display: 'none',
                        }
                    }}
                >
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header">
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>
                            Payment Alliance International
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails >
                        <PaiConnect />
                    </AccordionDetails>
            </ConnectionsAccordion>
            <ConnectionsAccordion 
                expanded={expanded === 'panel2'} 
                onChange={handleChange('panel2')} 
                sx={{
                    borderRadius: '10px',
                    '&:before': {
                        display: 'none',
                    }
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2bh-content"
                        id="panel2bh-header">
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>Vaulters</Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                            {
                                userVaulters == undefined ? 
                                    `You currently have no contacts configured for vaulting` :
                                    `You have ${Object.keys(userVaulters).length} configured contacts`
                            }
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Vaulters />
                    </AccordionDetails>
            </ConnectionsAccordion>
            <ConnectionsAccordion 
                expanded={expanded === 'panel3'} 
                onChange={handleChange('panel3')} 
                sx={{
                    borderRadius: '10px',
                    '&:before': {
                        display: 'none',
                    }
                }}
            >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel3bh-content"
                        id="panel3bh-header">
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>
                            Locations
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                            Configure important locations
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Locations />
                    </AccordionDetails>
            </ConnectionsAccordion>
            <ConnectionsAccordion 
                expanded={expanded === 'panel4'} 
                onChange={handleChange('panel4')} 
                sx={{
                    borderRadius: '10px',
                    '&:before': {
                        display: 'none',
                    }
                }}
            >
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel4bh-content"
                    id="panel4bh-header"
                    >
                    <Typography sx={{ width: '33%', flexShrink: 0 }}>Personal data</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Typography>
                        Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit
                        amet egestas eros, vitae egestas augue. Duis vel est augue.
                    </Typography>
                    </AccordionDetails>
            </ConnectionsAccordion>
        </Center>
        </ConnectionsContainer>
    )
}

export default Connections
