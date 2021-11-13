import { useState, useEffect } from 'react'
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import AppSearch from "../AppSearch/AppSearch";
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useQuery, gql } from "@apollo/client";
import WDTxnStatCard from '../StatCard/WDTxnStatCard';
import DaysAtZero from '../StatCard/DaysAtZero';
import AtmHotlist from '../StatCard/AtmHotlist';
import PullNewData from '../ActionCards/PullNewData';
import ContactVaulters from '../ActionCards/ContactVaulters';
import ConfigureAlertRules from '../ActionCards/ConfigureAlertRules';
import GotoDashboard from '../ActionCards/GotoDashboard';
import { subQuarters, format, subHours } from 'date-fns';
import ErrorsDock from './ErrorsDock';
import VaultAlertDock from './VaultAlertDock';
import SuspiciousActivity from './SuspiciousActivity';


const HeroDock = styled(Box)`
    padding: 0.25rem 2rem;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    
`;

const HOME_DOCK_QUERY = gql`
    query HomeDockQuery($uid: String!, $errorLogsStartDate: Date, $statsStartDate: Date) {
        app(uid: $uid) {
            terminals(uid: $uid, errorLogsStartDate: $errorLogsStartDate, statsStartDate: $statsStartDate) {
                errors {
                    errorLog {
                        terminalId
                        errorMessage
                        errorCode
                        errorTime
                        }
                    }
                stats {
                    averages {
                        wdTxAmnt
                        terminalId
                        locationName
                    }
                }
                info {
                    terminalId
                    lastBalance
                }
            }
        }
    }
`;


const HomeDock = () => {
    const user = useFirebaseAuth();
    const uid = user.uid;
    const errorLogsStartDate = subHours(new Date(), 2).toString();
    const statsStartDate = subQuarters(new Date(), 1).toString();
    const { loading, error, data } = useQuery(HOME_DOCK_QUERY, {
        variables: { uid, errorLogsStartDate, statsStartDate }
    });
    
    if ( loading || error ) {
        return <p>Loading...{error}</p>;
    }

    console.log(data.app.terminals.errors.errorLog)
    const errorlog = data.app.terminals.errors.errorLog;
    const stats = data.app.terminals.stats.averages;
    const info = data.app.terminals.info;
    return (
        <HeroDock>
            <ErrorsDock 
                errorLog={errorlog} 
            />
            <VaultAlertDock 
                stats={stats} 
                info={info}
                days={200}
            />
            <SuspiciousActivity 
                errorLog={errorlog} 
            />            
        </HeroDock>
    )
}


export default HomeDock
