import { useState } from 'react'
import Input from '@mui/material/Input';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

//import { numberWithCommas } from '../StatCard/MoneyStatement';


export function numberWithCommas(x) {
    return x;
}

const VaultingMaxInput = (props) => {

    var [vaultMaxSum, setVaultMaxSum] = props.setMax;
    const [stepperStep, setStepperStep] = props.stepperStep;
    const handleChange = (event) => {
        setVaultMaxSum(event.target.value);
    }

    return (
        <div>
            <FormControl >
                <InputLabel htmlFor="outlined-adornment-amount">Cash Available</InputLabel>
                <OutlinedInput
                    type="n"
                    value={(vaultMaxSum)}
                    label="Cash Available"
                    onChange={handleChange}
                    onClick={() => setStepperStep(stepperStep > 3 ? stepperStep : 3)}
                    startAdornment={<InputAdornment position="start">$</InputAdornment>}
                />
            </FormControl>
        </div>
    )
}




export default VaultingMaxInput
