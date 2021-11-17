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


import Selector from './Selector';
import SelectCrumbs from './SelectCrumbs';
import BandGranularitySlider from './BandGranularitySlider';
import DaysOutSlider from './DaysOutSlider';
import DepletionLookbackSlider from './DepletionLookbackSlider';

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
    grid-column: 1/-1;
`;

const SelectorSliderFlex = styled(Box)`
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const Calculator = (props) => {

    const [selectedOptions, setSelectedOptions] = useState([]);
    const data = props.terminalData;
    const atm_names = data.map(info => info.locationName)
    const selectionPlaceholder = selectedOptions.length > 0 ? `${selectedOptions.length} terminals selected` : 'MyCashMachine';

    console.log(selectedOptions);

    const handleInputChange = (event, value) => {
        setSelectedOptions(value);
    };

    return (
        <StyledCalculator>
            <SelectorSliderFlex>
                <Selector 
                    selectState={[selectedOptions, setSelectedOptions]}
                    terminalData={data}
                />
                <BandGranularitySlider />
            </SelectorSliderFlex>
            <SelectCrumbs
                selectState={[selectedOptions, setSelectedOptions]}
                terminalData={data}
            />
            <DualFlexContainer >
                <DaysOutSlider />
                <div style={{width: '20%'}}></div>
                <DepletionLookbackSlider />
            </DualFlexContainer>

        </StyledCalculator>
    )
}





export default Calculator
