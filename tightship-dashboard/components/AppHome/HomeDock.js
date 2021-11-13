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
import PullNewData from '../ActionCards/PullNewData';
import ContactVaulters from '../ActionCards/ContactVaulters';
import ConfigureAlertRules from '../ActionCards/ConfigureAlertRules';
import GotoDashboard from '../ActionCards/GotoDashboard';
import { subQuarters, format } from 'date-fns';



const HomeDock = () => {
    return (
        <div>
            <p>Home Dock</p>
        </div>
    )
}


export default HomeDock
