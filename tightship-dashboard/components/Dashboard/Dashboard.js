import { useState, useEffect } from 'react';
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ShareIcon from '@mui/icons-material/Share';

import DashboardChartCard from './DashboardChartCard';
import TerminalBalances from '../ChartComponents/TerminalBalances';
import VaultingDays from '../ChartComponents/VaultingDays';
import CashDeployed from '../ChartComponents/CashDeployed';
import BalancesStreamchart from '../ChartComponents/BalancesStreamchart';

const DashboardWrapper = styled(Box)`
    padding: 2rem;
`;

const DashboardGrid = styled(Box)`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 15rem);
    grid-row-gap: 1rem;
    grid-column-gap: 1rem;
`;

const Center = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;


const Dashboard = () => {


    const widgetPlaceHolder = (<p>dashboard widget placeholder</p>)

    return (
        <DashboardWrapper>
            <DashboardGrid>
                <div style={{'grid-column': '1/3', 'grid-row': '1/3'}}>
                    <DashboardChartCard>
                        <TerminalBalances />
                    </DashboardChartCard>
                </div>
                <div style={{'grid-column': '3/5', 'grid-row': '1/3'}}>
                    <DashboardChartCard>
                        <CashDeployed />
                    </DashboardChartCard>
                </div>
                <div style={{'grid-column': '1/3'}}>
                    <DashboardChartCard>
                        <VaultingDays />
                    </DashboardChartCard>
                </div>
                <div style={{'grid-column': '1/5', 'grid-row': '3/5'}}>
                    <DashboardChartCard>
                        <BalancesStreamchart />
                    </DashboardChartCard>
                </div>
                <Center>{widgetPlaceHolder}</Center>
            </DashboardGrid>
        </DashboardWrapper>
    )
}

export default Dashboard
