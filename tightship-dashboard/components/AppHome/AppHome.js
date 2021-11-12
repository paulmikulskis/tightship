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
import { useQuery, gql } from "@apollo/client";
import WDTxnStatCard from '../StatCard/WDTxnStatCard';
import DaysAtZero from '../StatCard/DaysAtZero';
import AtmHotlist from '../StatCard/AtmHotlist';
import { subQuarters, format } from 'date-fns';

/**
 * Notes on MUI cards to keep good style:
 * 
 * <Card> wraps content and actions for a single topic
 * <CardMedia> acts as banner and <CardHeader> as header
 * <CardContent> acts as body and <CardActions> as footer
 * <CardActions> contain UI controls and is placed at the bottom
 * <Card> inherits from <Paper> and so its props are availabe
 * 
 */

const StyledHome = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: 0.3fr 1.3fr 0.75fr 0.5fr;
    row-gap: 1rem;
    column-gap: 1rem;
    padding: 1rem;
    height: 100%;    
`;

const Center = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

export const PaperNav = styled.div`
    grid-column: 1/-1;
    height: 100%;
`;

const CardStats = styled.div`
    grid-column: 1/-1;
    height: 100%;
    margin: 0 3rem;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    row-gap: 1rem;
    column-gap: 1rem;
    padding: 1rem;
`;

const HomeHero = styled(Card)`
    h1 {
        font-size: 6rem;
    }
    grid-column: 1/-1;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;

const WITHDRAWAL_STATS_QUERY = gql`
    query Withdrawals($uid: String!, $start: Date) {
        app(uid: $uid) {
            atmStats(uid: $uid, startDate: $start) {
                totals {
                    terminalId
                    locationName
                    wdTxAmnt
                    wdTx
                }
            }
        }
    }
`;

const Home = () => {

    const user = useFirebaseAuth();
    const uid = user.uid;
    const avatarname = user.displayName.split(' ')[0]
    const { loading, error, data } = useQuery(WITHDRAWAL_STATS_QUERY, {
        variables: { uid }
    });

    if (loading) {
        return (
            <p>Loading</p>
        )
    }
    if (error) return <p>{error.toString()}</p>;
    var totals = data.app.atmStats.totals
    console.log(totals)
    const total = totals.map(t => t.wdTxAmnt).reduce((a, b) => a + b)
    const highestDraw = totals.map(t => [t.wdTxAmnt, t.locationName]).reduce((a, b) => {
        return a[0] > b[0] ? a : b
    })
    const zeroDays = true;
    console.log(`HIGHEST DRAW: ${JSON.stringify(highestDraw)}`)
    return (
        <StyledHome>
            <PaperNav>
                <AppSearch />
            </PaperNav>
            <HomeHero>
                <CardContent>
                    <h1>Hey there, {avatarname}</h1>
                </CardContent>
            </HomeHero>
            <CardStats>
                <Center><WDTxnStatCard total={total} highestDraw={highestDraw}/></Center>
                <Center><DaysAtZero /></Center>
                <Center style={{'grid-column': '3/5'}}><AtmHotlist /></Center>
            </CardStats>
            <Center><p>Home App Component</p></Center>
            <Center><p>Home App Component</p></Center>
            <Center><p>Home App Component</p></Center>
            <Center><p>Home App Component</p></Center>
        </StyledHome>
    )
}

export default Home
