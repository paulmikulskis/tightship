import { useState, useRef } from 'react';
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { useQuery, gql } from "@apollo/client";
import { ResponsivePie } from '@nivo/pie'
import { numberWithCommas } from './TerminalBalances'



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

const CashDeployed = (props) => {

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
            'id': el.locationName,
            'label': el.terminalId,
            'value': el.lastBalance
        };
    });
    console.log(balanceData)

    return (
        <div style={{ height: '100%', display: 'flex', 'flex-direction': 'column'}}>
            <p>Live Terminal Balances</p>
            <div style={{ height: '100%'}}>
                <ResponsivePie 
                    valueFormat={(v) => `$${numberWithCommas(v)}`}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                    innerRadius={0.7}
                    padAngle={4}
                    cornerRadius={3}
                    activeInnerRadiusOffset={25}
                    activeOuterRadiusOffset={8}
                    colors={{ scheme: 'pastel1' }}
                    borderWidth={2}
                    borderColor={{ from: 'color', modifiers: [ [ 'darker', '1.5' ] ] }}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsOffset={-2}
                    arcLinkLabelsDiagonalLength={25}
                    arcLinkLabelsStraightLength={19}
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsTextColor={{ from: 'color', modifiers: [ [ 'darker', '2.6' ] ] }}
                    data={balanceData}
                    keys={['balance']}
                    padding={0.3}
                    ariaLabel={"Last Balance Reading"}
                    barAriaLabel={function(e){return e.terminalId}}
                />
                
            </div>
        </div>
    )
}

export default CashDeployed
