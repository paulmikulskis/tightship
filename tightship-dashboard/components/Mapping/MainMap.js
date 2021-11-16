import { useState, useRef, useEffect } from 'react';
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { useQuery, gql } from "@apollo/client";
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, LayerGroup, useMap } from 'react-leaflet';
import styled from 'styled-components';
import Box from '@mui/material/Box';
import * as d3 from 'd3'



const Map = styled(MapContainer)`
    width: 100%;
    height: 80vh;
`;


const MainMap = (props) => {

    const geos = props.terminalData?.app.terminals.info
    const LeafletProvider = props.darkmode ? 
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png' : 
    'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';
    const datas = geos.map(d => {
        return {
            coordinates: [d.lattitude, d.longitude],
            balance: d.lastBalance,
            location: d.locationName,
            id: d.terminalId
        };
    });
    console.log('data:', datas)
    const [zoomLevel, setZoomLevel] = useState(11);
    const terminalData = props.terminalData.app.terminals.info;
    const location = [
        terminalData[0]?.lattitude ? terminalData[0].lattitude : 42.3601,
        terminalData[0]?.longitude ? terminalData[0].longitude : 71.0589,
    ];

    const D3Layer = () => {
        const map = useMap();
        useEffect(() => {
            console.log(`map bounds set to ${JSON.stringify(map.getSize(), null, 2)}, ${map.getSize().y}`)
            const svg = d3.select(map.getPanes().overlayPane).append('svg')
                .attr('width', map.getSize().x)
                .attr('height', map.getSize().y)
            const g = svg.append('g').attr('class', 'leaflet-zoom-hide');
            const Circles = g.selectAll('circle')
                .attr('class', 'atm-bubbles')
                .data(datas)
                .join('circle')
                    .attr('fill', 'red')
                    .attr('stroke', 'black')
                    .attr("cx", d => map.latLngToLayerPoint( [d.coordinates[0], d.coordinates[1]] ).x)
                    .attr("cy", d => map.latLngToLayerPoint( [d.coordinates[0], d.coordinates[1]] ).y) 
                    .attr("r", 10)
            const update = () => Circles
                .attr("cx", d => map.latLngToLayerPoint( [d.coordinates[0], d.coordinates[1]] ).x)
                .attr("cy", d => map.latLngToLayerPoint( [d.coordinates[0], d.coordinates[1]] ).y) 
            map.on("zoomend", update);
        }, []);
        return null;
    };

    return (
        <Map center={location} zoom={13} scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url={LeafletProvider}
            />
            <LayerGroup>
                <D3Layer />
            </LayerGroup>
        </Map>
    )
}




export default MainMap
