import { useState, useRef } from 'react';
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { useQuery, gql } from "@apollo/client";
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveStream } from '@nivo/stream';
import { subQuarters, format, subDays } from 'date-fns';

import { numberWithCommas } from './TerminalBalances';


const TERMINAL_BALANCES_QUERY = gql`
    query TerminalBalancesQuery($uid: String!, $dailyLogsStartDate: Date) {
        app(uid: $uid) {
            terminals(uid: $uid, dailyLogsStartDate: $dailyLogsStartDate) {
                logs {
                  daily {
                    balance
                    log_date
                    terminalId
                  }
                }
                info {
                  locationName
                  terminalId
                }
            }
        }
    }
`;

const BalancesStreamchart = (props) => {

    const user = useFirebaseAuth();
    const uid = user.uid;
    const [dailyLogsStartDate, setDailyLogsStartDate] = useState(subDays(new Date(), 30))
    const { loading, error, data } = useQuery(TERMINAL_BALANCES_QUERY,{
        variables: { uid, dailyLogsStartDate }
    });

    if (loading || error) {
        return <p>Loading...{JSON.stringify(error)}</p>;
    };

    const balances = data.app.terminals.logs.daily;
    const tids = {}
    for (var tid of data.app.terminals.info) {
        tids[tid.terminalId] = tid.locationName;
    }
    const dates = {}
    for (var bal of balances) {
        if(dates[bal.log_date]) {
            dates[bal.log_date][tids[bal.terminalId]] = bal.balance;
            //console.log(`adding tid${bal.terminalId} to dates`)
        } else {
            dates[bal.log_date] = {};
            //console.log(`adding tid${bal.terminalId} to dates`)
            dates[bal.log_date][tids[bal.terminalId]] = bal.balance;
        };
    };
    const dateArray = Object.values(dates).map(el => {
        for(var tid of Object.values(tids)) {
            if (Object.keys(el).indexOf(tid) < 0) {
                el[tid] = null;
            };
        };
        return el;
    })
    console.log("DATES", dateArray)
    console.log("KEYS:", Object.values(tids))

    return (
        <div style={{ height: '100%', display: 'flex', 'flex-direction': 'column'}}>
            <p>Balance Patterns</p>
            <div style={{ height: '80%'}}>
                <ResponsiveStream 
                    valueFormat={(v) => v ? `$${numberWithCommas(v)}` : 'n/a'}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                    keys={Object.values(tids)}
                    data={dateArray}
                    colors={{ scheme: 'pastel1' }}
                    fillOpacity={0.85}
                    offsetType="silhouette"
                    borderColor={{ theme: 'background' }}
                    padding={0.3}
                    ariaLabel={"Last Balance Reading"}
                    barAriaLabel={function(e){return e.terminalId}}
                />
                
            </div>
        </div>
    )
}

export default BalancesStreamchart
