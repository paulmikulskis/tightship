import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '../Authentication/FirebaseAuthProvider';
import styled from 'styled-components';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ShareIcon from '@mui/icons-material/Share';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import { useQuery, gql } from "@apollo/client";
import { 
    getDayOfYear, 
    subWeeks, 
    addWeeks, 
    subMonths, 
    subYears, 
    addYears, 
    format, 
    addDays, 
    subQuarters, 
    formatRelative, 
    Interval, 
    eachDayOfInterval 
} from 'date-fns';

import { ResponsiveLine } from '@nivo/line'
import Selector from './Selector';
import SelectCrumbs from './SelectCrumbs';
import BandGranularitySlider from './BandGranularitySlider';
import DaysOutSlider from './DaysOutSlider';
import DepletionLookbackSlider from './DepletionLookbackSlider';
import VaultingDateSelector from './VaultingDateSelector';
import CashLoadRange from './CashLoadRange';
import UseDebounce from './UseDebounce';
import VaultingMaxInput from './VaultingMaxInput';


const StyledCalculator = styled(Box)`
    margin-top: 2rem;
    margin-right: 6rem;
    margin-left: 1rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto;
    grid-column-gap: 3rem;
    grid-row-gap: 4rem;
`;

const DualFlexContainer = styled(Box)`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const SelectorSliderFlex = styled(Box)`
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const NivoBar = styled.div`
    
    height: 20rem;

    @media screen and (min-width: 1301px) {
        grid-column: 1/3;
    };

    @media screen and (max-width: 1300px) {
        grid-column: 1/-1;
    };
`;

const NivoBarTitle = styled.h4`
    margin: 0;
    padding: 0;
    font-size: 12pt;
    color: slategray;
`;

// for the query slider
const marks = [
    {
        value: 1,
        label: '1 Week',
        date: subWeeks(new Date().setHours(0,0,0,0), 1)
    },
    {
        value: 2,
        label: '2 Weeks',
        date: subWeeks(new Date().setHours(0,0,0,0), 2)
    },
    {
        value: 3,
        label: '3 Weeks',
        date: subWeeks(new Date().setHours(0,0,0,0), 3)
    },
    {
        value: 4,
        label: '1 Month',
        date: subMonths(new Date().setHours(0,0,0,0), 1)
    },
    {
        value: 5,
        label: '1 Quarter',
        date: subQuarters(new Date().setHours(0,0,0,0), 1)
    },
    {
        value: 6,
        label: '2 Quarters',
        date: subQuarters(new Date().setHours(0,0,0,0), 2)
    },
    {
        value: 7,
        label: '1 Year',
        date: subYears(new Date().setHours(0,0,0,0), 1)
    }
];


const TERMINAL_BALANCES_QUERY = gql`
    query TerminalBalancesQuery($uid: String!, $statsStartDate: Date) {
        app(uid: $uid) {
            terminals(uid: $uid, statsStartDate: $statsStartDate) {
                info {
                    terminalId
                    locationName
                    lastBalance
                }
                stats {
                    averages {
                        wdTx
                        wdTxAmnt
                        terminalId
                        locationName
                    }
                    transactionsByDay {
                        monday {
                            wdTx
                            wdTxAmnt
                            terminalId
                            locationName
                        }
                        tuesday {
                            wdTx
                            wdTxAmnt
                            terminalId
                            locationName
                        }
                        wednesday {
                            wdTx
                            wdTxAmnt
                            terminalId
                            locationName
                        }
                        thursday {
                            wdTx
                            wdTxAmnt
                            terminalId
                            locationName
                        }
                        friday {
                            wdTx
                            wdTxAmnt
                            terminalId
                            locationName
                        }
                        saturday {
                            wdTx
                            wdTxAmnt
                            terminalId
                            locationName
                        }
                        sunday {
                            wdTx
                            wdTxAmnt
                            terminalId
                            locationName
                        }
                    }
                }
            }
        }
    }
`;

const Calculator = (props) => {

    const user = useFirebaseAuth();
    const uid = user.uid;
    const [transactionalLookback, setTransactionalLookback] = useState(subWeeks(new Date().setHours(0,0,0,0), 1))
    const debouncedTransactionalLookback = UseDebounce(transactionalLookback, 2000);
    
    const { loading, error, data } = useQuery(TERMINAL_BALANCES_QUERY,{
        variables: { uid, statsStartDate: debouncedTransactionalLookback }
    });
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [vaultingDate, setVaultingDate] = useState(addWeeks(new Date(), 4));
    const [bandGranularity, setBandGranularity] = useState(0);
    const [cashLoadRange, setCashLoadRange] = useState([100,10000]);
    const [vaultMaxSum, setVaultMaxSum] = useState('20000');

    if (loading || error) {
        return <p>Loading...{JSON.stringify(error)}</p>;
    };

    const terminalInfo = data.app.terminals.info;
    const averages = data.app.terminals.stats.averages;
    console.log(`terminal averages: ${JSON.stringify(averages, null, 3)}`);
    const terminalStats = data.app.terminals.stats.transactionsByDay;
    console.log(`vaulting date=${vaultingDate}\nbandGranularity=${bandGranularity}\nlookback=${formatRelative(transactionalLookback, new Date())}\ncash range=${cashLoadRange}`);
    const atmNames = terminalInfo.map(info => info.locationName)
    console.log(`operating on ATMs: ${atmNames}`)

    // assembling a dict of {locationName: [DailyAverages]}
    var atmWithdrawalRates = {};
    for (var atmName of selectedOptions) {
        atmWithdrawalRates[atmName] = Object.fromEntries(
            Object.entries(terminalStats)
                .filter( ([k,v]) => !k.startsWith('__'))
                .map( ([k,v]) => {
                    var boi = [k, v.filter( doi => doi.locationName == atmName)[0]];
                    // if we are missing data for that specific day, then we take the general average
                    if (!boi[1]) {
                        console.log(`the boi has been called for ${k}, averages=${JSON.stringify(averages, null, 3)}`)
                        boi[1] = { 
                            ...averages.filter(a => a.locationName == atmName)[0], 
                            global: true 
                        }
                    };
                    return boi;
            })
        );
    };

    /**
     * 
     * @param {dict} rates a dictionary representing the daily withdrawal rates for each terminal
     * this value is likely obtained from the atmWithdrawalRates var from the Calculator componenet 
     * @param {[Date, Float]} fillup an optional Array of length two describing [Date, FillupAmnt]
     * for when the ATM plans to be vaulted. 
     * @param {Date} date TODO: the date at which to project out to
 
     */
    const dailyTerminalProjection = (rates, fillup=undefined, date=addYears(new Date(), 6969)) => {
        console.log(`rates: ${JSON.stringify(rates, null, 3)}`)
        const deathTown = {};
        Object.entries(rates).forEach( ([k, v]) => {
            var daTime = new Date().setHours(0,0,0,0);
            var curB = terminalInfo.filter((t) => t.locationName == k)[0].lastBalance;
            deathTown[k] = [curB];
            while (curB >= 0 && daTime < date) {
                daTime = addDays(daTime, 1);
                const dayName = format(daTime, 'EEEE').toLowerCase();
                const balanceDifferential = (v[dayName].wdTxAmnt) * (-1.2);
                console.log(`balance differential for ${k} = ${balanceDifferential}`)
                curB = curB + balanceDifferential;
                if (curB < 0) {
                    deathTown[k].push(0);
                } else {
                    deathTown[k].push(curB);
                }
            };
            return
        });
        //console.log(`deathTown: ${JSON.stringify(deathTown, null, 3)}`)
        return deathTown;
    };

    const NivoDeathProjection = (deathTown) => {
        return Object.entries(deathTown).map( ([k, v] ) => {
            const daTime = new Date().setHours(0,0,0,0);
            return {
                id: k,
                data: v.map((bal, i) => {
                    return { x: format(addDays(daTime, i), 'M/dd'), y: bal}
                })
            }
        })
    };



    //console.log(`withdrawal rates: ${JSON.stringify(atmWithdrawalRates, null, 2)}`)
    const projection = dailyTerminalProjection(atmWithdrawalRates, undefined, addDays(vaultingDate, 30));
    var maxYofProjection = Math.max.apply(null, Object.entries(projection).map( ([k,v]) => {
        return v[0]
    }));
    maxYofProjection = maxYofProjection > 9000 ? maxYofProjection * (1.1) : maxYofProjection * (1.4)
    console.log('maxYofProjection', maxYofProjection)
    const nivoData = NivoDeathProjection(projection);
    console.log(JSON.stringify(nivoData, null, 3))

    return (
        <StyledCalculator>
            <SelectorSliderFlex>
                <Selector 
                    selectState={[selectedOptions, setSelectedOptions]}
                    terminalData={terminalInfo}
                />
                <DualFlexContainer>
                    <VaultingDateSelector 
                        dateState={[vaultingDate, setVaultingDate]}
                    />
                    <VaultingMaxInput
                        setMax={[vaultMaxSum, setVaultMaxSum]}
                    />
                </DualFlexContainer>
            </SelectorSliderFlex>
            <SelectCrumbs
                selectState={[selectedOptions, setSelectedOptions]}
                terminalData={terminalInfo}
            />

            <BandGranularitySlider 
                bandGranularity={[bandGranularity, setBandGranularity]}
            />
            <DepletionLookbackSlider 
                transactionalLookback={[transactionalLookback, setTransactionalLookback]}
                marks={marks}
            />
            <CashLoadRange 
                cashLoadRange={[cashLoadRange, setCashLoadRange]}
            />


            <NivoBar>
                <NivoBarTitle>Terminal Cash Load Decay - Pattern History: {marks.filter( m => m.date.getTime() == (transactionalLookback).getTime() )[0].label}</NivoBarTitle>
                <ResponsiveLine
                        curve={'natural'}
                        useMesh={true}
                        data={nivoData}
                        margin={{ top: 50, right: 110, bottom: 50, left: 70 }}
                        xScale={{ type: 'point', min: 100}}
                        yScale={{ type: 'linear', min: 0, max: maxYofProjection ? maxYofProjection : 20000, stacked: false, reverse: false }}
                        yFormat=" >-.2f"
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            orient: 'bottom',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'days out',
                            legendOffset: 36,
                            legendPosition: 'middle',
                            format: (value) =>
                                `${getDayOfYear(new Date(value)) % 4 == 0 ? value : ""}`
                        }}
                        enableArea={true}
                        axisLeft={{
                            orient: 'left',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Balance',
                            legendOffset: -60,
                            legendPosition: 'middle',
                            format: (value) =>
                                `$${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                        }}
                        lineWidth={3}
                        pointSize={0}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        colors={{ scheme: 'pastel2' }}
                        pointLabelYOffset={-12}
                        legends={[
                            {
                                anchor: 'bottom-right',
                                direction: 'column',
                                justify: false,
                                translateX: 100,
                                translateY: 0,
                                itemsSpacing: 0,
                                itemDirection: 'left-to-right',
                                itemWidth: 80,
                                itemHeight: 20,
                                itemOpacity: 0.75,
                                symbolSize: 12,
                                symbolShape: 'circle',
                                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemBackground: 'rgba(0, 0, 0, .03)',
                                            itemOpacity: 1
                                        }
                                    }
                                ]
                            }
                        ]}
                    />
                </NivoBar>






        </StyledCalculator>
    )
}





export default Calculator
