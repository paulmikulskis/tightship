/* eslint-disable react/jsx-key */
import { useState, useEffect } from 'react'
import { collection, doc, getDoc, addDoc, setDoc, getFirestore } from "firebase/firestore"; 
import { useFirebaseAuth } from '../Authentication/FirebaseAuthProvider';

import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ShareIcon from '@mui/icons-material/Share';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Card from '@mui/material/Card';
import RaiseableCard from '../AppHome/RaiseableCard';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Backdrop from '@mui/material/Backdrop';
import Typography from '@mui/material/Typography';

import BigPlusSVG from './BigPlusSVG';
import { useFirebaseUserInfo } from '../Authentication/FirebaseUserInfoProvider';

import NewVaulterForm from './NewVaulterForm';
import VaulterCard from './VaulterCard';

const VaultPad = styled(Box)`

    p {
        padding: 3rem;
    }

`;

const StyledVaulterCard = styled(RaiseableCard)`
    width: 100%;
    height: 100%;
    border-radius: 15px;
`;

const CenteredCardContent = styled(CardContent)`
    display: flex;
    flex-direction: column;
    align-items: center;

`;

const Vaulters = () => {

    const user = useFirebaseAuth();
    const db = getFirestore();
    const userInfoContext = useFirebaseUserInfo();
    const userVaulters= userInfoContext.userVaulters;
    const setUserContextVaulters = userInfoContext.setUserVaulters;
    
    const [addVaulterOpen, setAddVaulterOpen] = useState(false);
    const [hoverNewVaulter, setHoverNewVaulter] = useState(false);

    console.log(`component vaulters: ${JSON.stringify(userVaulters, null, 3)}`)
    
    var vaulterCards = Object.entries(userVaulters ? userVaulters : []).map(([k, v]) => {
        return (<VaulterCard name={k} info={v} />)
    });
    vaulterCards = [
        <Grid item xs={4}>
            <StyledVaulterCard margin={'0'}>
                <CenteredCardContent
                    onMouseOver={e => setHoverNewVaulter(true)}
                    onMouseOut={e => setHoverNewVaulter(false)}
                    onClick={e => setAddVaulterOpen(true)}
                    sx={{pt: 2, pb: 0}}
                >
                    <Typography variant="subtitle" sx={{m: 0, p: 0, pb: 3}}>
                        Add Vaulter
                    </Typography>
                    <BigPlusSVG 
                        fill={hoverNewVaulter ? '#f1e694' : '#777777'} 
                        SVGWidth={'50%'}  
                        style={{margin: 0, padding: 0}}  
                    />
                </CenteredCardContent>
            </StyledVaulterCard>
        </Grid>,
        ...vaulterCards
    ];

    return (
        <VaultPad sx={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f5f5f5',
            borderRadius: '10px',
            border: '1px solid #cccccc',
            boxShadow: '0px 1px 6px #dddddd'
        }}>
            <Grid 
                container 
                spacing={2}
                sx={{padding: '1rem'}}
            >
                {vaulterCards}
            </Grid>
        
            <Modal
                open={addVaulterOpen}
                onClose={e => setAddVaulterOpen(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                style: {opacity: '70%'},
                timeout: 500,
                }}
            >
                <Fade in={addVaulterOpen}>
                <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '40%',
                        bgcolor: 'background.paper',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        boxShadow: 14,
                        p: 4,
                    }}
                >
                    <NewVaulterForm modalOpen={[addVaulterOpen, setAddVaulterOpen]}/>
                </Box>
                </Fade>
            </Modal>



        </VaultPad>
    )
}





export default Vaulters
