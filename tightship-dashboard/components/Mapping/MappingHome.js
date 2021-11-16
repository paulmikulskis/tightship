import { useState, useRef, useEffect, useMemo } from 'react';
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { useQuery, gql } from "@apollo/client";
import styled from 'styled-components';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ShareIcon from '@mui/icons-material/Share';
import dynamic from 'next/dynamic';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const StyledMappingHome = styled(Box)`
    padding: 1rem;
    background-color: aliceblue;
`;



const MAPPING_INFO_QUERY = gql`
    query MappingInfo($uid: String!) {
        app(uid: $uid) {
            terminals(uid: $uid) {
                info {
                  locationName
                  terminalId
                  lattitude
                  longitude
                  lastBalance
                }
            }
        }
    }
`;

const MapHeader = styled(Box)`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;


const MappingHome = () => {
    const [mapDarkMode, setMapDarkMode] = useState(true);
    const MainMap = useMemo( () => dynamic(
        () => import('./MainMap'), // replace '@components/map' with your component's location
        { 
            loading: () => <p>Leaflet Map is loading</p>,
            ssr: false
        } // This line is important. It's what prevents server-side render
    ), [mapDarkMode] ); // `[]` is list of variables that should trigger a re-rendering of the Leaflet Map

    const user = useFirebaseAuth();
    const [domLoaded, setDomLoaded] = useState(false);
    

    const uid = user.uid
    const { loading, error, data } = useQuery(MAPPING_INFO_QUERY, {
        variables: { uid }
    });

    function toggleConnection() {
        setMapDarkMode(!mapDarkMode);
    }


    useEffect(() => {
        setDomLoaded(true)
    });

    if (loading) {
        return <p>Loading...</p>
    };
    if (error) {
        return <p>Error! {JSON.stringify(error, null, 2)}</p>
    };

    if(!domLoaded || (typeof window == "undefined") ) {
        return <p>No mapping functionality yet</p>
    }

    return (
        <StyledMappingHome>
            <MapHeader>
                <h2 className="map-h2">Your Fleet</h2>
                <FormGroup>
                    <FormControlLabel onChange={() => toggleConnection()} control={<Switch checked={mapDarkMode}/>} label="Dark Mode" />
                </FormGroup>
            </MapHeader>
            <MainMap terminalData={data} darkmode={mapDarkMode}/>
        </StyledMappingHome>
    )
}




export default MappingHome
