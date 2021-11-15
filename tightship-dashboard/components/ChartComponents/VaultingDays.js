import { useState, useRef } from 'react';
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { useQuery, gql } from "@apollo/client";
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveTimeRange } from '@nivo/calendar';
import { subQuarters, format } from 'date-fns';
import styled from 'styled-components';



export const VAULTING_DAYS_QUERY = gql`
    query VaultingDaysQuery($uid: String!, $dailyLogsStartDate: Date) {
        app(uid: $uid) {
            terminals(uid: $uid, dailyLogsStartDate: $dailyLogsStartDate) {
                logs {
                  vaulting {
                    balance
                    vaultAmnt
                    log_date
                    terminalId
                  }
                }
                info {
                  terminalId
                  locationName
                }
            }
        }
    }
`;

const VaultingContainer = styled.div`
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: 1fr 3fr;
    height: 100%;
    width: 100%;
    padding: 0 1rem;
`;

const VaultingInfoContainer = styled.div`
    margin: 0.25rem 1rem 1rem 0.25rem;
    padding: 0.25rem;

`;

const VaultingChartContainer = styled.div`
    margin: 0.25rem 0.5rem 1rem 0.75rem;

    height: 90%;
    grid-column: 2/3;
`;

const VaultingDays = (props) => {

    const user = useFirebaseAuth();
    const uid = user.uid;
    const [dailyLogsStartDate, setDailyLogsStartDate] = useState(subQuarters(new Date(), 1));
    const { loading, error, data } = useQuery(VAULTING_DAYS_QUERY, {
        variables: { uid, dailyLogsStartDate }
    });

    if (loading || error) {
        return <p>Loading :D ...</p>
    }
    
    console.log(data.app.terminals)
    var vaultingData = data.app.terminals.logs.vaulting.map(d => {
        return {value: d.vaultAmnt, day: format(new Date(d.log_date), 'yyyy-MM-dd')}
    });

    const chartStart = format(new Date(dailyLogsStartDate), 'yyyy-MM-dd');
    const chartEnd = format(new Date(), 'yyyy-MM-dd');

    console.log('vaulting data:', vaultingData)

    return (
        <VaultingContainer>
            <VaultingInfoContainer>
                <p>Vaulting Days</p>
            </VaultingInfoContainer>
            <VaultingChartContainer>
                <ResponsiveTimeRange
                    monthLegend={(y,m,d) => new Date(`${m}/${d}/${y}`).getUTCMonth}
                    data={vaultingData}
                    from={chartStart}
                    to={chartEnd}
                    emptyColor="#eeeeee"
                    colors={[ '#61cdbb', '#97e3d5', '#e8c1a0', '#f47560' ]}
                    margin={{ top: 10, right: 20, bottom: 15, left: 10 }}
                    yearSpacing={40}
                    monthBorderColor="#ffffff"
                    dayBorderWidth={2}
                    dayBorderColor="#ffffff"
                />
            </VaultingChartContainer>

        </VaultingContainer>
    )
}

export default VaultingDays
