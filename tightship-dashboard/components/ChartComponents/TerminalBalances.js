import { useState, useRef } from 'react';
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { useQuery, gql } from "@apollo/client";
import { ResponsiveBar } from '@nivo/bar';


export const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const TERMINAL_BALANCES_QUERY = gql`
    query TerminalBalancesQuery($uid: String!) {
        app(uid: $uid) {
            terminals(uid: $uid) {
                info {
                    terminalId
                    locationName
                    lastBalance
                }
            }
        }
    }
`;

const TerminalBalances = (props) => {

    const user = useFirebaseAuth();
    const uid = user.uid;

    const { loading, error, data } = useQuery(TERMINAL_BALANCES_QUERY,{
        variables: { uid }
    });

    if (loading || error) {
        return <p>Loading...{JSON.stringify(error)}</p>;
    };

    const balances = data.app.terminals.info;
    const balanceData = balances.map( el => {
        return {
            'location': el.locationName,
            'terminalId': el.terminalId,
            'balance': el.lastBalance
        };
    });
    console.log(balanceData)

    return (
        <div style={{ height: '100%', display: 'flex', 'flex-direction': 'column'}}>
            <p>Live Terminal Balances</p>
            <div style={{ height: '80%'}}>
                <ResponsiveBar
                    axisLeft={{
                        format: function(value) { 
                            return value % 2000 == 0 ? `$${numberWithCommas(value)}` : '';
                        }
                    }}
                    axisBottom={{
                        tickRotation: 38
                    }}
                    valueFormat={(v) => `$${numberWithCommas(v)}`}
                    data={balanceData}
                    indexBy={'location'}
                    keys={['balance']}
                    colors={{ scheme: 'pastel2' }}
                    margin={{ top: 0, right: 50, bottom: 25, left: 60 }}
                    padding={0.3}
                    ariaLabel={"Last Balance Reading"}
                    barAriaLabel={function(e){return e.terminalId}}
                />
                
            </div>
        </div>
    )
}

export default TerminalBalances
