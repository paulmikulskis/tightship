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


const StyledGranularitySlider = styled(Box)`
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

const BandGranularitySlider = (props) => {

    const [granularityHelpModal, setGranularityHelpModal] = useState(false);
    const [bandGranularity, setBandGranularity] = props.bandGranularity;

    const marks = [
        {
          value: 0,
          label: '$2,000',
        },
        {
          value: 50,
          label: '$1,500',
        },
        {
          value: 100,
          label: '$1,000',
        },
        {
          value: 150,
          label: '$500',
        },
        {
            value: 180,
            label: '$20',
        },
        {
            value: 200,
            label: '$1',
        },
          
      ];
      
    const handleClose = () => {
        setGranularityHelpModal(!granularityHelpModal)
    };

    const handleSliderChange = (event, newValue) => {
        var labelf = marks.filter(m => m.value == newValue)[0].label;
        labelf = parseFloat(labelf.replaceAll(',','').replaceAll('$', ''));
        setBandGranularity(labelf);
    };


    return (

        <StyledGranularitySlider>
            <SliderHeading direction="row" spacing={1} >
                <Box><h4>Cash Band Granularity</h4></Box>
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
                    onClick={() =>  setGranularityHelpModal(true)}
                    />
                </Box>
                <Dialog onClose={handleClose} open={granularityHelpModal}>
                    <Box sx={{padding: '1rem', maxWidth: '500px'}}>
                        <p style={{'line-height': '1.5'}}><b>Cash Band Granularity</b> informs the Vaulting Tool of the minimum differential between ATM vaulting amounts.</p><br /><p>  Typically, restricting this value to $2,000 is favorable due to cash bundle size, but other values can potentially lead to further optimizations in vault planning.</p>
                    </Box>
                </Dialog>
            </SliderHeading>
            <Slider
                color='secondary'
                aria-label="Band Granularity"
                defaultValue={0}
                valueLabelFormat={v => <SliderLabel>{marks.filter(i => i.value == v)[0].label}</SliderLabel>}
                valueLabelDisplay="auto"
                onChangeCommitted={handleSliderChange}
                marks={marks}
                step={null}
                min={0}
                max={201}
            />
        </StyledGranularitySlider>

    )
}





export default BandGranularitySlider
