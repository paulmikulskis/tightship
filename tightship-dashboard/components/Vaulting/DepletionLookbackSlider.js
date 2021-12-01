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


const StyledDaysOutSlider = styled(Box)`
    padding: 0;
    width: 100%;
`;

const SliderLabel = styled.p`
    margin: 0;
    padding: 0;
`;

const SliderHeading = styled(Stack)`
    h4 {
        padding: 0;
        margin: 0 0 1rem 0;
    };

    p {
        padding: 0;
        margin: 0;
    };
`;

const DepletionLookbackSlider = (props) => {

    const marks = props.marks;
    const [depletionLookbackHelpModal, setDepletionLookbackHelpModal] = useState(false);
    const [sliderPosition, setSliderPostion] = useState(5);
    const [transactionalLookback, setTransactionalLookback] = props.transactionalLookback
    const handleClose = () => {
        setDepletionLookbackHelpModal(!depletionLookbackHelpModal)
    };



    const handleSliderChange = (event, newValue) => {
        
        const labelf = marks.filter(m => m.value == newValue)[0].date;
        console.log(`depletion component lookback date = ${labelf}`)
        setTransactionalLookback(labelf);
    };

    return (

        <StyledDaysOutSlider>
            <SliderHeading direction="row" spacing={1} >
                <Box><h4>Choose Transaction History</h4></Box>
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
                    onClick={() =>  setDepletionLookbackHelpModal(true)}
                    />
                </Box>
                <Dialog onClose={handleClose} open={depletionLookbackHelpModal}>
                    <Box sx={{padding: '1rem', maxWidth: '500px'}}>
                        <p style={{'line-height': '1.5'}}><b>Transactional Lookback</b> informs the Vaulting Tool of how far back into your ATM transactional history to look in order to gauge future activity.</p>
                    </Box>
                </Dialog>
            </SliderHeading>
            <Slider
                color='secondary'
                aria-label="Depletion Lookback"
                defaultValue={marks.filter(m => m.date.getTime() == transactionalLookback.getTime())[0].value}
                valueLabelFormat={v => <SliderLabel>{marks.filter(i => i.value == v)[0].label}</SliderLabel>}
                valueLabelDisplay="auto"
                marks={marks}
                onChangeCommitted={handleSliderChange}
                step={null}
                min={1}
                max={7}
            />
        </StyledDaysOutSlider>

    )
}





export default DepletionLookbackSlider
