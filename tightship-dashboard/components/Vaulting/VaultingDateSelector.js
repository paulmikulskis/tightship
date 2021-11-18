import { useState } from 'react';
import { useFirebaseAuth } from '../Authentication/FirebaseAuthProvider';
import styled from 'styled-components';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import HelpIcon from '@mui/icons-material/Help';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';

import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import TextField from '@mui/material/TextField';


const StyledDatePicker = styled(DesktopDatePicker)`
    margin-top: 0;
    padding-top: 0;
`;

const VaultingDateSelector = (props) => {

    const [value, setValue] = props.dateState;
    const handleChange = (newValue) => {
        if(newValue) {
            setValue(newValue);
        }
      };

    return (
        <div style={{'padding-right': '1rem' }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <StyledDatePicker
                    label="Desired Vaulting Date"
                    inputFormat="MM/dd/yyyy"
                    value={value}
                    onChange={handleChange}
                    renderInput={(params) => <TextField {...params} />}
                />  
            </LocalizationProvider> 
        </div>
    )
}




export default VaultingDateSelector
