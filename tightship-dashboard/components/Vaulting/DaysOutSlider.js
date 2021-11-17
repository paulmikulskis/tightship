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

const DaysOutSlider = () => {

    const [daysOutHelpModal, setDaysOutHelpModal] = useState(false);
      
    const handleClose = () => {
        setDaysOutHelpModal(!daysOutHelpModal)
    }

    const marks = [
        {
            value: 1,
            label: '1 Day out'
        },
        {
            value: 10,
            label: '10 Days out'
        },
        {
            value: 20,
            label: '20 Days out'
        },
        {
            value: 30,
            label: '30 Days out'
        },
        {
            value: 40,
            label: '40 Days out'
        },
        
    ];

    return (

        <StyledDaysOutSlider>
            <SliderHeading direction="row" spacing={1} >
                <Box><h4>Days Out</h4></Box>
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
                    onClick={() =>  setDaysOutHelpModal(true)}
                    />
                </Box>
                <Dialog onClose={handleClose} open={daysOutHelpModal}>
                    <Box sx={{padding: '1rem', maxWidth: '500px'}}>
                        <p style={{'line-height': '1.5'}}><b>Days Out</b> Days out tells the Vaulting Tool how far out to optimize for.</p>
                    </Box>
                </Dialog>
            </SliderHeading>
            <Slider
                aria-label="Days Out"
                defaultValue={1}
                valueLabelFormat={v => <SliderLabel>{v} days</SliderLabel>}
                valueLabelDisplay="auto"
                marks={marks}
                step={1}
                min={1}
                max={41}
            />
        </StyledDaysOutSlider>

    )
}





export default DaysOutSlider
