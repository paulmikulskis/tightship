/* eslint-disable react/jsx-key */
import { useState, useEffect } from 'react'
import { collection, doc, getDoc, addDoc, setDoc, getFirestore } from "firebase/firestore"; 
import { useFirebaseAuth } from '../Authentication/FirebaseAuthProvider';

import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
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
import Geocode from "react-geocode";

import axios from 'axios';
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

const StyledAddNew = styled(Box)`
    margin: 1rem 1rem 0 1rem;
    padding: 1rem 20%;
`;

const Locations = () => {

    const db = getFirestore();
    const user = useFirebaseAuth();
    const [locations, setLocations] = useState({});
    const [newName, setNewName] = useState(null);
    const [newCategory, setNewCategory] = useState(null);
    const [newPlace, setNewPlace] = useState(null);

    const formReady = (
        (newPlace != null) &&
        (newCategory != null) &&
        (newName != null && newName.length > 3)
    );

    const getLocations = async () => {
        const saveResult = await getDoc(doc(db, 'locations', user.uid));
        setLocations(saveResult.data());
        return true;
    };

    console.log(JSON.stringify(newPlace, null, 3))
    useEffect( () => {
        getLocations();
    }, []);

    const selectChange = (e) => {
        setNewCategory(e.target.value);
    };

    const saveNewLocation = async () => {
        const url=`https://maps.googleapis.com/maps/api/geocode/json?place_id=${newPlace.value.place_id}&key=${process.env.FIREBASE_API_KEY}`
        await axios({
            method: 'get',
            url: url,
        }).then(result => {
            const firstPick = result.data.results.pop();
            console.log(JSON.stringify(firstPick, null, 3))
            const { lat, lng } = firstPick.geometry.location;
            const streetNum = firstPick.address_components.filter(c => c.types.includes('street_number')).pop()?.short_name || '';
            const streetName = firstPick.address_components.filter(c => c.types.includes('route')).pop()?.short_name || '';
            const locality = firstPick.address_components.filter(c => c.types.includes('locality')).pop()?.short_name || '';
            const zip = firstPick.address_components.filter(c => c.types.includes('postal_code')).pop()?.short_name || '';
            const data = { [newName]: {
                name: newName,
                category: newCategory,
                placeId: newPlace.value.place_id,
                lat: lat,
                lon: lng,
                address: `${streetNum} ${streetName}`,
                locality: locality,
                zip: zip,
            }};
            setDoc(
                doc(db, 'locations', user.uid),
                data,
                { merge: true }
            ).then(() => {
                setLocations({...locations, ...data})
            })
        });
    };


    return (
        <LocationsContainer>
            <GooglePlacesAutocomplete
                selectProps={{
                    newPlace,
                    onChange: setNewPlace,
                }}
                apiKey={process.env.FIREBASE_API_KEY}
            />
            <StyledAddNew>
                <Stack direction='row' spacing={1}>
                    <TextField
                        color='secondary'
                        sx={{
                            width: '100%',
                        }}
                        label='new place nickname'
                        variant={'standard'}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <Select
                        color='secondary'
                        sx={{
                            width: '100%'
                        }}
                        value={newCategory}
                        label="Category"
                        onChange={selectChange}
                        >
                        <MenuItem value={'personal'}>personal</MenuItem>
                        <MenuItem value={'vaulter'}>vaulter</MenuItem>
                        <MenuItem value={'business'}>business</MenuItem>
                        <MenuItem value={'bank'}>bank</MenuItem>
                    </Select>
                    <Button
                        variant={formReady ? 'outlined' : 'disabled'}
                        color='secondary'
                        sx={{
                            width: '100%',
                        }}
                        onClick={() => saveNewLocation()}
                    >
                        <Stack direction='column' alignItems='center' spacing={0}>
                            <AddBusinessIcon />
                            <Typography sx={{fontSize: '7pt'}} variant="caption">add location</Typography>
                        </Stack>
                    </Button>
                </Stack>

            </StyledAddNew>
            <StyledLocationsTable>
                <LocationsTable locations={[locations, setLocations]}/>
            </StyledLocationsTable>
        </LocationsContainer>
    )
}

export default Locations
