import { useState, useEffect } from 'react'
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import AppSearch from "../AppSearch/AppSearch";
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { DataGrid } from '@mui/x-data-grid';
import MoneyStatement from './MoneyStatement'
import { useQuery, gql } from "@apollo/client";
import { subQuarters, format } from 'date-fns';


export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const StyledCard = styled(Card)`
    width: 100%;
    height: 100%;
    border-radius: 15px;
    padding: 0;
    margin: 0;
`;

const Body = styled(CardContent)`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 0;
    margin: 0;

    h1 {
        font-size: 4rem;
        padding: 0rem 1rem 0rem 1rem;
        margin: 1rem 1rem;
    }
    p {
        color: grey;
        font-size: 12px;
    }
`;

const StyledDataGrid = styled(DataGrid)`

`;


export const ATM_HOTLIST = gql`
    query AtmHotlistTableQuery($uid: String!) {
        app(uid: $uid) {
            terminals(uid: $uid){
                info {
                    terminalId,
                    locationName
                    lastBalance
                }
            }
        }
    }
`;

const AtmHotlist = () => {
    const user = useFirebaseAuth();
    const uid = user.uid;
    const { loading, error, data } = useQuery(ATM_HOTLIST, {
        variables: { uid }
    });

    if (loading || error) {
        return <p>Loading...</p>;
    }

    const columns = [
        {
            field: 'location',
            headerName: 'Location',
            width: 175
        },
        {
            field: 'balance',
            headerName: 'Balance',
            width: 150
        },
        
    ];
    const rows = data.app.terminals.info.map(terminal => {
        return {
            id: terminal.terminalId,
            location: terminal.locationName,
            balance: `$${numberWithCommas(terminal.lastBalance)}`
        }
    })

    return (
        <StyledCard elevation={6}>
            <Body>
                <h4>Terminal Hotbar</h4>
                <div style={{height: '100%', width: "100%" }}>
                    <StyledDataGrid 
                        rows={rows}
                        columns={columns}
                        density={'compact'}
                        pagination
                        hideFooter={true}
                        components={{
                            footer: () => <div>This is my footer</div>
                        }}
                    />
                </div>
            </Body>
        </StyledCard>
    )
}





export default AtmHotlist
