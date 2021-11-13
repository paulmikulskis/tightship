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
import MoneyStatement from './MoneyStatement'
import { useQuery, gql } from "@apollo/client";
import { subQuarters, format } from 'date-fns';

const StyledCard = styled(Card)`
    width: 100%;
    height: 100%;
    border-radius: 15px;
`;

const Body = styled(CardContent)`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;

    h1 {
        font-size: 4rem;
        padding: 0rem 1rem 0rem 1rem;
        margin: 1rem 1rem;
    }
    p {
        padding: 0;
        margin: 0;
        color: grey;
        font-size: 12px;
    }
`;


export const DAYS_AT_ZERO_QUERY = gql`
    query DaysAtZero($uid: String!, $start: Date) {
        app(uid: $uid) {
            terminals(uid: $uid, startDate: $start) {
                stats {
                    daysAtZero {
                        terminalId
                        log_date
                    }
                }
            }
        }
    }
`;

const DaysAtZero = () => {
    const user = useFirebaseAuth();
    const uid = user.uid;
    const start = format(subQuarters(new Date(), 1), "M/dd/yyyy");

    const { loading, error, data } = useQuery(DAYS_AT_ZERO_QUERY, {
        variables: { uid, start }
    });

    if (loading || error) {
        return <p>Loading...</p>;
    }

    const daysAtZero = data.app.terminals.stats.daysAtZero.length;

    return (
        <StyledCard elevation={6}>
            <Body>
                <h3>Days at $0</h3>
                <p>(quarter)</p>
                <h1>{daysAtZero}</h1>
            </Body>
        </StyledCard>
    )
}





export default DaysAtZero
