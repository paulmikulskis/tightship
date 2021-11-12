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

export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const StyledCard = styled(Card)`
    width: 100%;
    height: 100%;
    border-radius: 15px;
`;

const Body = styled(CardContent)`
    display: flex;
    flex-direction: column;
    height: 100%;
`;


const TopPerformer = styled(Box)`
    width: 100%;
    display: flex;
    flex-direction: column;
    p {
        margin: 0;
        margin-bottom: -0.5rem;
    }
`;

const TopPerformerName = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    h4 {
        padding-right: 1rem;
    }
    p {
        margin: 0;
        padding: 0;
    }
`;

const StyledMoneyStatement = styled.div`
    padding: 1rem 0;
    display: relative;

`;


const WDTxnStatCard = (props) => {
    console.log(`props.total: ${props.total}`)
    return (
        <StyledCard elevation={6}>
            <Body>
                <h3>Withdrawals This Week</h3>
                <StyledMoneyStatement>
                    <MoneyStatement amount={props.total} />
                </StyledMoneyStatement>
                <TopPerformer>
                    <p style={{color: "#737373", 'font-size': '12px'}}>Top Performer:</p>
                    <TopPerformerName>
                        <h4>{props.highestDraw[1]}: </h4>
                        <p>${numberWithCommas(Math.round(props.highestDraw[0] * 100) / 100)}</p>
                    </TopPerformerName>
                </TopPerformer>
            </Body>
        </StyledCard>
    )
}

export default WDTxnStatCard
