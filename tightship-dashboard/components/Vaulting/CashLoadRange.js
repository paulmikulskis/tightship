import Slider from '@mui/material/Slider';
import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '../Authentication/FirebaseAuthProvider';
import styled from 'styled-components';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import HelpIcon from '@mui/icons-material/Help';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';


const StyledCashLoadRangeSlider = styled(Box)`
    width: 100%;
    padding: 0rem 2rem 0 0;
    grid-column: 1/3;
`;

const SliderLabel = styled.p`
    margin: 0;
    padding: 0;
`;

const SliderHeading = styled(Stack)`
    h4{
        padding: 0;
        margin: 0 0 1rem 0;
    }

    p{
        padding: 0;
        margin: 0;
    }
`;

const CashLoadRange = (props) => {

    const [cashLoadHelpModal, setCashLoadHelpModal] = useState(false);
    const [value, setValue] = useState([500,9000]);
    const [cashLoadRange, setCashLoadRange] = props.cashLoadRange;

    const marks = [
        {
          value: 0,
          label: '$0',
        },
        {
          value: 500,
          label: '$100',
        },
        {
          value: 1300,
          label: '$500',
        },
        {
          value: 2500,
          label: '$1,000',
        },
        {
            value: 4000,
            label: '$3,000',
        },
        {
            value: 5500,
            label: '$5,000',
        },
        {
            value: 7000,
            label: '$7,000',
        },
        {
            value: 9000,
            label: '$10,000',
        },
        {
            value: 12000,
            label: '$15,000',
        },
          
    ];
      
    const handleClose = () => {
        setCashLoadHelpModal(!cashLoadHelpModal)
    };

    const handleSliderChange = (event, newValue) => {
        var lowerBound = marks.filter(m => m.value == value[0])[0].label;
        lowerBound = parseFloat(lowerBound.replaceAll(',','').replaceAll('$', ''));
        var upperBound = marks.filter(m => m.value == value[1])[0].label;
        upperBound = parseFloat(upperBound.replaceAll(',','').replaceAll('$', ''));
        setCashLoadRange([lowerBound, upperBound]);
        setValue(newValue);
    };


    return (

        <StyledCashLoadRangeSlider>
            <SliderHeading direction="row" spacing={1} >
                <Box><h4>Allowable Terminal Load Range</h4></Box>
                <Box><HelpIcon 
                    sx={{
                        marginTop: '0.05rem',
                        fontSize: "medium" ,
                        fill: 'lightgrey',
                        '&:hover': {
                            fill: 'grey',
                            fontSize: 'large'
                        }
                    }}
                    onClick={() =>  setCashLoadHelpModal(true)}
                    />
                </Box>
                <Dialog onClose={handleClose} open={cashLoadHelpModal}>
                    <Box sx={{padding: '1rem', maxWidth: '500px'}}>
                        <p style={{'line-height': '1.5'}}><b>Allowable Terminal Load Range</b> informs the Vaulting Tool The acceptable range of cash to allow into your terminals at any given point.</p>
                    </Box>
                </Dialog>
            </SliderHeading>
            <Slider
                valueLabelFormat={v => <SliderLabel>{marks.filter(i => i.value == v)[0].label}</SliderLabel>}
                valueLabelDisplay="auto"
                marks={marks}
                step={null}
                min={0}
                max={12000}
                value={value}
                onChange={handleSliderChange}
                disableSwap
            />
        </StyledCashLoadRangeSlider>

    )
}





export default CashLoadRange
