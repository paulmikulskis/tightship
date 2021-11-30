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

import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import LocationsTable from './LocationsTable';


const LocationsContainer = styled(Box)`
    padding: 1rem;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: top;
`; 

const StyledLocationsTable = styled(Box)`
    padding: 2rem;
    padding-top: 4rem;
`;

const Locations = () => {

    const db = getFirestore();
    const user = useFirebaseAuth();
    const [locations, setLocations] = useState({})

    const getLocations = async () => {
        const saveResult = await getDoc(doc(db, 'locations', user.uid));
        setLocations(saveResult.data());
        return true;
    };

    useEffect( () => {
        getLocations();
    }, [])


    return (
        <LocationsContainer>
            <GooglePlacesAutocomplete
                apiKey={process.env.FIREBASE_API_KEY}
            />
            <StyledLocationsTable>
                <LocationsTable locations={[locations, setLocations]}/>
            </StyledLocationsTable>
        </LocationsContainer>
    )
}

export default Locations
