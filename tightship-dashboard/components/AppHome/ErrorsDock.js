import styled from 'styled-components';
import { useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import RaisableCard from './RaiseableCard';

const StyledDockCard = styled(RaisableCard)`
    width: 100%;
    height: 100%;
    margin: 0 1rem;
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const StyledDockCardContent = styled(CardContent)`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    h3 {
        margin: 0;
    }
    &:last-child {
      padding-bottom: 0
    };
    padding: 1rem 1rem !important;
`;

const ErrorNotification = styled.div`
    display: flex;
    flex-direction: column;
    align-items: left;
    justify-content: center;
`;

const MostRecentError = styled.div`
    p {
        padding: 0;
        margin: 0;
    }

    #mostRecentLabel {
        color: grey;
        font-size: 12px;
    }
`;

const NoTerminalErrors = styled.div`
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    h3 {
        padding: 0;
    }
    p {
        padding: 0.25rem 0 0 0;
        margin: 0;
    }
`;

const ErrorsDock = (props) => {
    const errorLog = props.errorLog
    
    if (errorLog.length == 0) {
        return (
            <StyledDockCard 
                elevation={1}>
                <StyledDockCardContent>
                <NoTerminalErrors>
                    <h3>No Terminal Errors</h3>
                    <p>in the past two hours</p>
                </NoTerminalErrors>
                    
                    <CheckCircleIcon style={{fill: "green"}}/>
                </StyledDockCardContent>
            </StyledDockCard>
        )
    };

    const errorCount = errorLog.length;
    const lastErrorTerminal = errorLog[0].terminalId
    const lastErrorMessage = errorLog[0].errorMessage
    return (
        <StyledDockCard>
            <StyledDockCardContent>
                <ErrorNotification>
                    <NotificationImportantIcon style={{fill: "orange"}}/>
                    <h3 style={{color: 'red'}}>{errorCount} errors</h3>
                </ErrorNotification>
                <MostRecentError>  
                    <p id='mostRecentLabel'>Most Recent: </p>
                    <p>{lastErrorTerminal}</p>
                </MostRecentError>
            </StyledDockCardContent>
        </StyledDockCard>
    )
}




export default ErrorsDock
