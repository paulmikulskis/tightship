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
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useQuery, gql } from "@apollo/client";
import { subQuarters, format } from 'date-fns';

const StyledCard = styled(Card)`
    width: 100%;
    height: 100%;
    border-radius: 15px;
    display: flex;
    align-items: left;
    flex-direction: column;
`;

const Body = styled(CardContent)`
    h3{
        margin-top: 0.3rem;
    }
    p {
        padding: 0;
        margin: 0;
        color: grey;
        font-size: 12px;
    }

`;

const CallToAction = styled(CardActions)`
    padding-left: 1rem;
    margin-top: -0.5rem;

    button {
        padding: 0.25rem 0.75rem;
        border-radius: 5px;
    }
`;


const ConfigureAlertRules = () => {
    const user = useFirebaseAuth();
    const uid = user.uid;
    const alertRuleCount = 0;
    const [raised, setRaised] = useState(false);

    // const { loading, error, data } = useQuery(DAYS_AT_ZERO_QUERY, {
    //     variables: { uid, start }
    // });

    // if (loading) {
    //     return <p>Loading...</p>;
    // }


    return (
        <StyledCard 
            elevation={raised ? 6 : 0}
            onMouseOver={()=>setRaised(true)} 
            onMouseOut={()=>setRaised(false)} 
        >
            <Body>
                <h3>View Alerting Rules</h3>
                <p>Current running alert rules: {alertRuleCount}</p>
                <p style={{visibility: 'hidden'}}>Hidden</p>
            </Body>
            <CallToAction>
                <Button color="secondary" variant={raised ? 'contained' : 'outlined'} size="small" endIcon={<NotificationsActiveIcon />}>Configure Alerting</Button>
            </CallToAction>

        </StyledCard>
    )
}





export default ConfigureAlertRules
