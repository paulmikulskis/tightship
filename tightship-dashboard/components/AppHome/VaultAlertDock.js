import styled from 'styled-components';
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

const NoTerminalVaults = styled.div`
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

const VaultAlertDock = (props) => {
    const stats = props.stats
    const info = props.info
    const days = props.days ? props.days : 2

    console.log(stats);
    console.log(info);
    const dangerZone = stats.filter(stat => {
        const bal = info.filter(i => i.terminalId === stat.terminalId)[0];
        if (bal) {
            return ((bal.lastBalance / stat.wdTxAmnt) <= days)
        };
    });
    if (dangerZone.length == 0) {
        return (
            <StyledDockCard elevation={1}>
                <StyledDockCardContent>
                    <NoTerminalVaults>
                        <h3>No Emergency Vaulting</h3>
                        <p>to cover next 48hrs</p>
                    </NoTerminalVaults>
                    <CheckCircleIcon style={{fill: "green"}}/>
                </StyledDockCardContent>
            </StyledDockCard>
        )
    };

    const dangerZoneCount = dangerZone.length;
    const lastErrorTerminal = stats[0].terminalId
    const lastErrorMessage = stats[0].errorMessage
    const termp = dangerZoneCount > 1 ? 'terminals' : 'terminal';
    return (
        <StyledDockCard>
            <StyledDockCardContent>
                <ErrorNotification>
                    <NotificationImportantIcon style={{fill: "orange"}}/>
                    <h3 style={{color: 'red'}}>{dangerZoneCount} {termp} close to $0</h3>
                </ErrorNotification>
                <MostRecentError>  
                    <p id='mostRecentLabel'>Soonest: </p>
                    <p>{lastErrorTerminal}</p>
                </MostRecentError>
            </StyledDockCardContent>
        </StyledDockCard>
    )
}




export default VaultAlertDock
