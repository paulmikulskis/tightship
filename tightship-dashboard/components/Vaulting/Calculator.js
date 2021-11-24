import { useRef, useState } from 'react';
import { useFirebaseAuth } from '../Authentication/FirebaseAuthProvider';
import styled from 'styled-components';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
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
    differenceInCalendarDays, 
    eachDayOfInterval 
} from 'date-fns';

import { ResponsiveLine } from '@nivo/line'
import Selector from './Selector';
import SelectCrumbs from './SelectCrumbs';
import BandGranularitySlider from './BandGranularitySlider';
import DepletionLookbackSlider from './DepletionLookbackSlider';
import VaultingDateSelector from './VaultingDateSelector';
import CashLoadRange from './CashLoadRange';
import UseDebounce from './UseDebounce';
import VaultingMaxInput from './VaultingMaxInput';
import VaultPlanDataGrid from './VaultPlanDataGrid';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Backdrop from '@mui/material/Backdrop';
import Typography from '@mui/material/Typography';


import {schemePastel2, interpolateWarm} from 'd3-scale-chromatic';


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
    grid-column: 1/2;
    flex-direction: column;
    justify-content: space-between;
`;

const TwoThirdsFull = styled.div`
    
    height: 30rem;

    @media screen and (min-width: 1301px) {
        grid-column: 1/3;
    };

    @media screen and (max-width: 1300px) {
        grid-column: 1/-1;
    };
`;

const VaultPlanGrid = styled(Box)`
    margin: 0;
    height: 35rem;
    display: flex;
    flex-direction: column;
    align-items: left;
    justify-content: space-around;

    @media screen and (min-width: 1650px) {
        grid-column: 3/4;
        width: 500px;
    };

    @media screen and (max-width: 1650px) {
        grid-column: 1/-1;
        width: 700px
    };
`;

const NivoBarTitleStack = styled(Stack)`
    padding: 1rem 0 0.75rem 0;
`;

const NivoBarTitle = styled.h4`
    margin: 0;
    padding: 0.4rem 0 0 0;
    font-size: 12pt;
    color: slategray;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
`;

const StyledDepletionLookbackSlider = styled.div`
    width: 100%;
    grid-column: 1/3;

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
    const nivoLineRef = useRef();
    const { loading, error, data } = useQuery(TERMINAL_BALANCES_QUERY,{
        variables: { uid, statsStartDate: debouncedTransactionalLookback }
    });
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [vaultingDate, setVaultingDate] = useState(addWeeks(new Date(), 4));
    const [bandGranularity, setBandGranularity] = useState(2000);
    const [cashLoadRange, setCashLoadRange] = useState([100,10000]);
    const [vaultMaxSum, setVaultMaxSum] = useState('20000');
    const [vaultAdded, setVaultAdded] = useState(false);
    const [fillup, setFillup] = useState({});
    const [simulationButtonPressed, setSimulationButtonPressed] = useState(false);
    const [highPri, setHighPri] = useState([]);
    const [vaultPlan, setVaultPlan] = useState([]);
    const [stepperStep, setStepperStep] = props.stepperStep;
    const [openSaveVaultPlan, setOpenSaveVaultPlan] = useState(false);

    if (loading || error) {
        return <p>Loading...{JSON.stringify(error)}</p>;
    };

    if (selectedOptions.length > 0 || stepperStep > 2) {
        setStepperStep(stepperStep > 2 ? stepperStep : 2);
    };
    // prefer to use pastel2 discrete D3 colorscale, but if more
    // items than the color scale can handle, then we will use a continuous one
    const colorKey = selectedOptions.length < 8 ? 
        Object.fromEntries(selectedOptions.map((k, i) => {
            return [k, schemePastel2[i]]
        })) : Object.fromEntries(selectedOptions.map((k, i) => {
            return [k,  interpolateWarm[i/selectedOptions.length]]
        }));

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
        const deathTown = {};
        Object.entries(rates).forEach( ([k, v]) => {
            var daTime = new Date();
            var curB = terminalInfo.filter((t) => t.locationName == k)[0].lastBalance;
            deathTown[k] = [curB];
            while ((curB >= 0 && daTime.setHours(0,0,0,0) < date.setHours(0,0,0,0)) || (
                fillup?.date ? (daTime.setHours(0,0,0,0) <  addDays(fillup.date, 2).setHours(0,0,0,0)) : false
            )) {
                if (fillup?.date) {
                    if (daTime.setHours(0,0,0,0) == fillup.date.setHours(0,0,0,0)) {
                        curB = curB + fillup.amounts[k]
                    };
                };
                daTime = addDays(daTime, 1);
                const dayName = format(daTime, 'EEEE').toLowerCase();
                const balanceDifferential = (v[dayName].wdTxAmnt) * (-1.2); // add in a buffer for success
                curB = curB + balanceDifferential;
                if (curB < 0) {
                    deathTown[k].push(0);
                    curB = -1;
                } else {
                    deathTown[k].push(curB);
                }
            };
            return
        });
        //console.log(`deathTown: ${JSON.stringify(deathTown, null, 3)}`)
        return deathTown;
    };

    const NivoDeathProjection = (deathTown, dateFilter=undefined) => {
        return Object.entries(deathTown).map( ([k, v] ) => {
            const daTime = new Date().setHours(0,0,0,0);
            const dateCutoff = dateFilter ? 
                differenceInCalendarDays(dateFilter, new Date()) :
                differenceInCalendarDays(addDays(new Date(vaultingDate), 30), new Date())
            return {
                id: k,
                data: v.slice(0, dateCutoff).map((bal, i) => {
                    return { x: format(addDays(daTime, i), 'M/dd'), y: bal}
                })
            }
        })
    };

    /**
     * 
     * @param {dict} rates the ATM withdrawal rates for each day of the week for each ATM 
     * @param {dict} deathTown the dailyTerminalProjection return value, projecting ATM balances into future
     * @param {Int} cashAvailable total cash available to vault with 
     * @param {Date} fillupDate the date at which the user specifies to vault the machines
     * @param {Int} granularity the minimum cash differential, typically defaults to $2,000
     * @param {[Int]} loadRange the allowed range of cash the ATM can have
     * @returns 
     */
    const vaultSqueeze = (rates, deathTown, cashAvailable, fillupDate, granularity, loadRange) => {
        if (Object.keys(deathTown).length === 0) return undefined;
        console.log(`DEATHTOWN KEYS=${Object.keys(deathTown)}`)
        // amount of cash available for each ATM start is the total cash divided by the number of ATMs
        var startingAmounts = Object.keys(deathTown).map((k) => [k, 0]);
        var total = startingAmounts.length * loadRange[1] < cashAvailable ? 
            startingAmounts.length * loadRange[1] : 
            cashAvailable;
        while(total > 0){
            startingAmounts.sort((a, b) => a[1] > b[1] ? 1 : -1);
            if (startingAmounts[0][1] + granularity < loadRange[1]) {
                startingAmounts[0][1] = startingAmounts[0][1] + granularity
            };
            total = total - granularity;
        };
        startingAmounts = Object.fromEntries(startingAmounts)
        console.log(`starting amounts ${JSON.stringify(startingAmounts, null, 2)}`)
        var fillup = {
            date: fillupDate,
            amounts: startingAmounts
        };
        console.log(`FILLUP=${JSON.stringify(fillup, null, 3)}`)
        // given this new amount of cash that we allocate for each ATM, re-run the projection function
        //  but with the added cash value
        var newTown = dailyTerminalProjection(rates, fillup)
        console.log('TERMINAL PROJECTION INITIAL FINISHED:', JSON.stringify(newTown, null, 2))
        // set up a simple array of information that we can sort and then iterate over
        // the important pieces of information are each ATMs id, the current amount we are allocating to them
        // (which initially is the startingShare value), when the current projection says that machine 
        // run out, and how many times this machine has had vault 
        var vaultingSet = Object.entries(newTown).map(([k,v]) => {
            return {
                id: k,
                amnt: startingAmounts[k],
                expiration: addDays(new Date(), v.indexOf(0) || 500),
                stepbacks: 0,
            }
        });
        if (Object.keys(deathTown).length === 1) {
            return vaultingSet;
        }
        console.log('ABOUT TO ENTIRE WHILE LOOP')
        // keep swapping longest expiration until each ATM has been 
        // put closer to expiration twice.  Adjusting this could potentially lead to
        // different results, but I don't know how to do the proof stuff to figure it out..
        // two passes for each machine seemed reasonable enough
        while (!vaultingSet.map(v => v.stepbacks > 2).reduce((a, b) => a && b)) {
            console.log(`-------`)
            vaultingSet.sort( (x, y) => {
                return x.expiration.setHours(0,0,0,0) < y.expiration.setHours(0,0,0,0) ? -1 : 1;
            });
            
            const lastElem = vaultingSet.length - 1;
            // no stepback limit for terminalToTakeFrom since some far out expiry terminals
            // might need to be stepped back a multitude of times
            var terminalToTakeFrom = [...vaultingSet].reverse().findIndex(v => {
                return v.amnt - granularity >= loadRange[0]
            });
            console.log('INITIAL TERMINAL TO TAKE FROM =', terminalToTakeFrom)
            if (terminalToTakeFrom < 0) {
                console.log(`cannot take any money from terminals due to lower bound of loadRange=${loadRange[0]}`)
                break;
            };
            
            // this variable dictates the next ATM that will receive the next incremental
            // value from the current furtherst-out expiration.  We need to make sure the index
            // of the next ATM that will receive the value is not always the one with the closest 
            // expiration, or we might then have oscillations in the algorithm where
            // not all ATMs will ever get a stepback increase
            const nextLuckySonOfaB = vaultingSet.findIndex(val => {
                return (( 
                    val.stepbacks <= vaultingSet.reduce((acc, cur) => {
                        return acc + cur.stepbacks
                            }, 0) / vaultingSet.length
                    ) && (
                        val.amnt + granularity <= loadRange[1]
                    )) 

            });
            if (nextLuckySonOfaB < 0) {
                console.log(`cannot find any suitable ATMs to give another $${granularity} to due to upper bound of loadRange=${loadRange[1]}`)
                break;
            };
            terminalToTakeFrom = vaultingSet.length - terminalToTakeFrom - 1;
            vaultingSet[terminalToTakeFrom].amnt = vaultingSet[terminalToTakeFrom].amnt - granularity;
            console.log(`lastElem: ${lastElem}, terminalToTakeFrom=${terminalToTakeFrom}, vaultingSet=${JSON.stringify(vaultingSet, null, 3)}`)

            vaultingSet[terminalToTakeFrom].stepbacks = vaultingSet[terminalToTakeFrom].stepbacks + 1;
            console.log(`took $${granularity} from ${vaultingSet[terminalToTakeFrom].id}`);
            vaultingSet[nextLuckySonOfaB].amnt = vaultingSet[nextLuckySonOfaB].amnt + granularity;
            console.log(`added $${granularity} to ${vaultingSet[nextLuckySonOfaB].id}\n..and the current vaultingSet=${JSON.stringify(vaultingSet, null, 3)})}`)
            fillup = {
                date: fillupDate,
                amounts: Object.fromEntries(vaultingSet.map(v => [v.id, v.amnt]))
            };
            newTown = dailyTerminalProjection(rates, fillup);
            vaultingSet = Object.entries(newTown).map(([k,v]) => {
                const terminalFromVSet = vaultingSet.filter(e => e.id === k)[0];
                return {
                    id: k,
                    amnt: terminalFromVSet.amnt,
                    expiration: addDays(new Date(), (v.length - v.reverse().findIndex(val=>val>0)) || 500),
                    stepbacks: terminalFromVSet.stepbacks,
                }
            });
            console.log(`the vualtingSet now =${JSON.stringify(vaultingSet, null, 3)}`)
        };

        // re-organized squeezed dates to prioritize highPri terminals
        var earliestHighPri = [...vaultingSet]
            .filter(s => {
                return (
                    (highPri.indexOf(s.id) > -1) &&
                    (s.amnt + granularity <= loadRange[1])
                )
            })
            .sort((a, b) => a.expiration.setHours(0,0,0,0) > b.expiration.setHours(0,0,0,0))
            [0];
        var latestLowPri = [...vaultingSet]
            .filter(s => {
                return (
                    (highPri.indexOf(s.id) < 0) &&
                    (s.amnt - granularity >= 0)
                )
            })
            .sort((a, b) => a.expiration.setHours(0,0,0,0) > b.expiration.setHours(0,0,0,0))
            .pop();

        console.log(`current priorities = ${JSON.stringify(highPri)}`)
        console.log(`earliestHighPri = ${JSON.stringify(earliestHighPri, null, 2)}`)
        console.log(`latestLowPri = ${JSON.stringify(latestLowPri, null, 2)}`)
        if (earliestHighPri == undefined || latestLowPri == undefined) {
            console.log(`priority re-organization complete, nothing to do`)
            return vaultingSet;
        };
        // while there is a highPri Terminal expiring before the latest lowPri Terminal, continue re-shuffling
        while( earliestHighPri.expiration.setHours(0,0,0,0) < latestLowPri.expiration.setHours(0,0,0,0) ) {
            if (earliestHighPri == undefined || latestLowPri == undefined) {
                console.log(`priority re-organization complete, \nearliest HighPri=${JSON.stringify(earliestHighPri, null, 2)}\nearliest LowPri=${JSON.stringify(earliestLowPri, null, 2)}`)
            };
            const indexHighPri = vaultingSet.findIndex(v => v.id === earliestHighPri.id);
            const indexLowPri = vaultingSet.findIndex(v => v.id === latestLowPri.id);
            vaultingSet[indexHighPri].amnt = vaultingSet[indexHighPri].amnt + granularity;
            vaultingSet[indexLowPri].amnt = vaultingSet[indexLowPri].amnt - granularity;
            fillup = {
                date: fillupDate,
                amounts: Object.fromEntries(vaultingSet.map(v => [v.id, v.amnt]))
            };
            newTown = dailyTerminalProjection(rates, fillup);
            vaultingSet = Object.entries(newTown).map(([k,v]) => {
                const terminalFromVSet = vaultingSet.filter(e => e.id === k)[0];
                return {
                    id: k,
                    amnt: terminalFromVSet.amnt,
                    expiration: addDays(new Date(), (v.length - v.reverse().findIndex(val=>val>0)) || 500),
                    stepbacks: terminalFromVSet.stepbacks,
                }
            });
            earliestHighPri = [...vaultingSet]
                .filter(s => {
                    return (
                        (highPri.indexOf(s.id) > -1) &&
                        (s.amnt + granularity <= loadRange[1])
                    )
                })
                .sort((a, b) => a.expiration.setHours(0,0,0,0) > b.expiration.setHours(0,0,0,0) ? 1 : -1)
                [0];
            latestLowPri = [...vaultingSet]
                .filter(s => {
                    return (
                        (highPri.indexOf(s.id) < 0) &&
                        (s.amnt - granularity >= 0)
                    )
                })
                .sort((a, b) => a.expiration.setHours(0,0,0,0) > b.expiration.setHours(0,0,0,0) ? 1 : -1)
                .pop();
            if (earliestHighPri == undefined || latestLowPri == undefined) {
                console.log(`priority re-organization complete`)
                break;
            };
        };

        return vaultingSet;
    };


    //console.log(`withdrawal rates: ${JSON.stringify(atmWithdrawalRates, null, 2)}`)
    const projection = dailyTerminalProjection(
        atmWithdrawalRates, 
        fillup, 
        !simulationButtonPressed ? addDays(vaultingDate, 12) : undefined,
    );
    var maxYofProjection = Math.max.apply(null, Object.entries(projection).map( ([k,v]) => {
        return  Math.max.apply(null, v)
    }));
    maxYofProjection = maxYofProjection > 9000 ? maxYofProjection * (1.2) : maxYofProjection * (1.4)
    console.log('maxYofProjection', maxYofProjection)
    const firstTimeNivoData = NivoDeathProjection(projection);


    const buttonHandle = () => {
        console.log('BUTTON HANDLE')
        setStepperStep(stepperStep > 4 ? stepperStep : 4);
        const ret = vaultSqueeze(
            atmWithdrawalRates,
            projection,
            vaultMaxSum,
            vaultingDate,
            bandGranularity,
            cashLoadRange
        );
        const fillup = {
            date: vaultingDate,
            amounts: Object.fromEntries(ret.map((v) => [v.id, v.amnt]))
        };
        console.log(`fillup for this sim run = \n${JSON.stringify(fillup, null, 3)}`)
        setSimulationButtonPressed(true);
        setVaultPlan(ret);
        setFillup(fillup);
    }

    return (
        <StyledCalculator>
            <StyledDepletionLookbackSlider 
                onMouseOver={() => setStepperStep(stepperStep > 1 ? stepperStep : 1)}
            >
                <DepletionLookbackSlider 
                    transactionalLookback={[transactionalLookback, setTransactionalLookback]}
                    marks={marks}
                />
            </StyledDepletionLookbackSlider>
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
                        stepperStep={[stepperStep, setStepperStep]}
                    />
                </DualFlexContainer>
            </SelectorSliderFlex>
            <SelectCrumbs
                selectState={[selectedOptions, setSelectedOptions]}
                terminalData={terminalInfo}
                colorscale={colorKey}
                highPri={[highPri, setHighPri]}
            />

            <BandGranularitySlider 
                bandGranularity={[bandGranularity, setBandGranularity]}
            />

            <CashLoadRange 
                cashLoadRange={[cashLoadRange, setCashLoadRange]}
            />


            <TwoThirdsFull>
                <NivoBarTitleStack direction="row" spacing={2}>
                    <Box>
                        <NivoBarTitle>
                            Terminal Cash Load Decay - Pattern History: 
                            {marks.filter( 
                                m => m.date.getTime() == (transactionalLookback).getTime() 
                                )[0].label
                            }
                        </NivoBarTitle>
                    </Box>
                    <Box>
                        <Button 
                            onClick={(e) => buttonHandle()}
                            variant={'outlined'}
                            >run simulation
                        </Button>
                    </Box>
                </NivoBarTitleStack>

                <ResponsiveLine
                    ref={nivoLineRef}
                    className={'nivoline'}
                    curve={'catmullRom'}
                    useMesh={true}
                    data={firstTimeNivoData}
                    margin={{ top: 20, right: 110, bottom: 50, left: 70 }}
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
                        legendOffset: -65,
                        legendPosition: 'middle',
                        format: (value) =>
                            `$${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                    }}
                    lineWidth={3}
                    pointSize={0}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    colors={(data) => {
                        return colorKey[data.id]
                    }}
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
            </TwoThirdsFull>

            <VaultPlanGrid>
                <VaultPlanDataGrid 
                colorKey={colorKey} 
                vaultPlan={[vaultPlan, setVaultPlan]} 
                stepperStep={[stepperStep, setStepperStep]}
                fillup={[fillup, setFillup]}
                highPri={[highPri, setHighPri]}
                simulationButtonPressed={[simulationButtonPressed, setSimulationButtonPressed]}
                saveVaultPlan={[openSaveVaultPlan, setOpenSaveVaultPlan]}
            />
            </VaultPlanGrid>
            <Modal
                open={openSaveVaultPlan}
                onClose={e => setOpenSaveVaultPlan(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                style: {opacity: '70%'},
                timeout: 500,
                }}
            >
                <Fade in={openSaveVaultPlan}>
                <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        border: '1px solid #000',
                        borderRadius: '5px',
                        boxShadow: 14,
                        p: 4,
                    }}
                >
                    <Typography id="transition-modal-title" variant="h6" component="h2">
                    Text in a modal
                    </Typography>
                    <Typography id="transition-modal-description" sx={{ mt: 2 }}>
                    Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                    </Typography>
                </Box>
                </Fade>
            </Modal>
                

        </StyledCalculator>
    )
}


export default Calculator
