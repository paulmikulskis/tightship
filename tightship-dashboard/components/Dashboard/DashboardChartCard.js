import styled from 'styled-components';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';


const StyledDashboardChartCard = styled(Card)`
    width: 100%;
    height: 100%;
`;

const StyledDashboardChartCardBody = styled(CardContent)`
    width: 100%;
    height: 100%;
`;

const DashboardChartCard = (props) => {
    return (
        <StyledDashboardChartCard elevation={2}>
            <StyledDashboardChartCardBody>
                {props.children}
            </StyledDashboardChartCardBody>
        </StyledDashboardChartCard>
    )
}

export default DashboardChartCard
