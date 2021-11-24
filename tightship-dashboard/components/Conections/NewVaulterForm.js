
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';
import { schemeAccent } from 'd3-scale-chromatic';
import Card from '@mui/material/Card';
import validator from 'validator';

import UseDebounce from '../Vaulting/UseDebounce';
import { useFirebaseUserInfo } from '../Authentication/FirebaseUserInfoProvider';

import { collection, doc, getDoc, addDoc, setDoc, getFirestore } from "firebase/firestore"; 
import { useFirebaseAuth } from '../Authentication/FirebaseAuthProvider';

const ColorSquareChoice = styled(Card)`
    background-color: ${props => props.color};
    width: 2rem;
    height: 2rem;
    margin: 0;
    padding: 0;
`;

const NewVaulterForm = (props) => {

    const user = useFirebaseAuth();
    const db = getFirestore();
    const [addVaulterOpen, setAddVaulterOpen] = props.modalOpen;
    const userInfoContext = useFirebaseUserInfo();
    const userVaulters= userInfoContext.userVaulters;
    const setUserVaulters = userInfoContext.setUserVaulters;
    // form settings
    const [newVaulterActiveStep, setNewVaulterActiveStep] = useState(0);
    const NAME_MAX_LEN = 24;
    const MIN_DELAY_FINISHED = 600;
    // vaulter name form fields
    const [vaulterName, setVaulterName] = useState('');
    const [vaulterNameErrorText, setVaulterNameErrorText] = useState('');
    // vaulter contact form fields
    const [vaulterEmail, setVaulterEmail] = useState('');
    const [vaulterEmailErrorText, setVaulterEmailErrorText] = useState('');
    const [vaulterNumber, setVaulterNumber] = useState('');
    const [vaulterNumberErrorText, setVaulterNumberErrorText] = useState('');
    // vaulter color picker
    const [raised, setRaised] = useState('');
    const [vaulterColor, setVaulterColor] = useState('');
    const [vaulterColorErrorText, setVaulterColorErrorText] = useState('');

    const [finished, setFinished] = useState(false);
    const closeModal = UseDebounce(finished, MIN_DELAY_FINISHED)

    useEffect(() => {
        if (closeModal == true) {
            setAddVaulterOpen(false);
        }
    })

    const formatPhoneNumber = (phoneNumberString) => {
        const input = phoneNumberString.replace(/\D/g,'').substring(0,10); // First ten digits of input only
        const areaCode = input.substring(0,3);
        const middle = input.substring(3,6);
        const last = input.substring(6,10);
        if (phoneNumberString.length == 0) {
            return '';
        };
        if (middle.length == 0) {
            return `(${areaCode}`;
        };
        if (last.length == 0) {
            return `(${areaCode})-${middle}`;
        };
        return `(${areaCode})-${middle}-${last}`;
    };

    const unFormatPhoneNumber = (phoneNumberString) => {
        return phoneNumberString.replace(/(\(|\)|-)/g, '');
    };


    const handleNext = async () => {
        switch (newVaulterActiveStep) {
            case 0: 
                if (!(vaulterName.length < NAME_MAX_LEN)) {
                    setVaulterNameErrorText('please input a shorter name');
                    break;
                };
                if (!(vaulterName.length >= 2)) {
                    setVaulterNameErrorText('please input a longer name');
                    break;
                };
                setVaulterNameErrorText('');
                setNewVaulterActiveStep(newVaulterActiveStep+1);
                break;
            
            case 1:
                if (vaulterEmail.length > 0 && !validator.isEmail(vaulterEmail)) {
                    if (vaulterNumber.length > 0 && !validator.isMobilePhone(vaulterNumber)) {
                        setVaulterNumberErrorText('please input a valid mobile number');
                    };
                    setVaulterEmailErrorText('please input a valid email');
                    break;
                };
                if (vaulterNumber.length > 0 && !validator.isMobilePhone(vaulterNumber)) {
                    if (vaulterEmail.length > 0 && !validator.isEmail(vaulterEmail)) {
                        setVaulterEmailErrorText('please input a valid email');
                    };
                    setVaulterNumberErrorText('please input a valid mobile number');
                    break;
                };
                if (vaulterNumber.length == 0 && vaulterEmail.length == 0) {
                    setVaulterEmailErrorText('at least one contact field is required');
                    setVaulterNumberErrorText('at least one contact field is required');
                    break;
                };

                setVaulterEmailErrorText('');
                setVaulterNumberErrorText('');
                setNewVaulterActiveStep(newVaulterActiveStep+1);
                break;

            case 2:
                if(vaulterColor.length == 0) {
                    setVaulterColorErrorText('please select a color for the new vaulter profile');
                    break;
                };
                setVaulterColorErrorText('');
                setNewVaulterActiveStep(newVaulterActiveStep+1);
            case 3:
                // save new vaulter info to FireStore
                const vaulter = {[vaulterName]: {
                    name: vaulterName,
                    email: vaulterEmail || null,
                    number: unFormatPhoneNumber(vaulterNumber) || null,
                    color: vaulterColor,
                }};
                const vaulterRef = doc(db, 'vaulters', user.uid);
                const userVaulters = (await getDoc(vaulterRef)).data();
                const newVaulters = { ...userVaulters, ...vaulter };
                await setDoc(
                    vaulterRef, 
                    newVaulters,
                    { merge: true }
                ).then(() => {
                    setUserVaulters(newVaulters);
                    setNewVaulterActiveStep(newVaulterActiveStep+1);
                    setFinished(true);
                    return newVaulters;
                });
                break;

            default: alert('error in new vaulter form');
        }
    };

    const handleBack = () => {
        switch (newVaulterActiveStep) {
            case 0:
                break;
            default:
                setNewVaulterActiveStep(newVaulterActiveStep-1);
                break;
        }
    };

    const colorSquareChoices = schemeAccent.map(color => {
        return (
            // eslint-disable-next-line react/jsx-key
            <Grid item xs={1}>
                <ColorSquareChoice 
                    color={color}
                    onClick={() => setVaulterColor(color)}
                    onMouseOver={()=>setRaised(color)} 
                    onMouseOut={()=>setRaised('')} 
                    elevation={(raised == color || vaulterColor == color) ? 8 : 2}
                    sx={{
                        border: raised == color ? '1px solid #88888870' : 'none',
                        border: vaulterColor == color ? '2px solid #555' : 'none',
                    }}
                >

                </ColorSquareChoice>
            </Grid>
        )
    })

    return (
        <div>
            <Typography 
                id="transition-modal-title" 
                variant="h6" 
                component="h2"
                sx={{
                    mb: 5
                }}
            >
                    Register a new Vaulter
            </Typography>
            <Box sx={{ml: 3, zIndex: 1}}>
            <Stepper activeStep={newVaulterActiveStep} orientation="vertical" >
                <Step key='Vaulter Name'>
                    <StepLabel >
                        <Typography>Enter the name of your vaulter</Typography>
                    </StepLabel>
                    <StepContent>
                        <Box sx={{ mb: 2, mt: 2}}>
                        <TextField 
                            error={vaulterNameErrorText.length != 0}
                            helperText={vaulterNameErrorText.length != 0 ? vaulterNameErrorText : undefined}
                            label='R2-D2 The Vaulter'
                            value={vaulterName.length > 0 ? vaulterName : undefined}
                            onChange={(e) => setVaulterName(e.target.value)}
                            variant='standard'
                            sx={{
                                minWidth: '15rem',
                                mb: 2
                            }}
                        />
                            <div>
                                <Button
                                    variant={vaulterNameErrorText.length == 0 ? 'contained' : 'outlined'}
                                    onClick={handleNext}
                                    sx={{ mt: 1, mr: 1 }}
                                >
                                    {'Continue'}
                                </Button>
                                <Button
                                    disabled={false}
                                    onClick={handleBack}
                                    sx={{ mt: 1, mr: 1 }}
                                >
                                    Back
                                </Button>
                            </div>
                        </Box>
                    </StepContent>
                </Step>
                <Step key='Contact Info'>
                    <StepLabel>
                    <Typography>Add Contact Info</Typography>
                    </StepLabel>
                    <StepContent>
                        <Box sx={{ mb: 2, mt: 2}}>
                        <TextField 
                            value={vaulterEmail.length > 0 ? vaulterEmail : undefined}
                            onChange={(e) => setVaulterEmail(e.target.value)}
                            error={vaulterEmailErrorText.length != 0}
                            helperText={vaulterEmailErrorText.length != 0 ? vaulterEmailErrorText : undefined}
                            label='r2@tabooine.com'
                            variant='standard'
                            sx={{
                                minWidth: '15rem',
                                mb: 1,
                                mr: 2
                            }}
                        />
                        <Typography 
                            sx={{
                                position: 'relative', 
                                top: '1.2rem',
                                mr: 2
                            }} 
                            variant="caption">
                                and/or
                        </Typography>
                        <TextField 
                            value={vaulterNumber.length > 0 ? vaulterNumber : undefined}
                            onChange={(e) => setVaulterNumber(formatPhoneNumber(e.target.value))}
                            error={vaulterNumberErrorText.length != 0}
                            helperText={vaulterNumberErrorText.length != 0 ? vaulterNumberErrorText : undefined}
                            label='xxx-xxx-xxxx'
                            variant='standard'
                            sx={{
                                minWidth: '12rem',
                                mb: 2
                            }}
                        />
                            <div>
                                <Button
                                    variant={(
                                        vaulterEmailErrorText.length == 0 && 
                                        vaulterNumberErrorText.length == 0
                                        ) ? 'contained' : 'outlined'
                                    }
                                    onClick={handleNext}
                                    sx={{ mt: 1, mr: 1 }}
                                >
                                    {'Continue'}
                                </Button>
                                <Button
                                    disabled={false}
                                    onClick={handleBack}
                                    sx={{ mt: 1, mr: 1 }}
                                >
                                    Back
                                </Button>
                            </div>
                        </Box>
                    </StepContent>
                </Step>
                <Step key='Select Vaulter Color'>
                    <StepLabel>
                    <Typography>Select Vaulter Color</Typography>
                    </StepLabel>
                    <StepContent>
                        <Box sx={{ mb: 2, mt: 2}}>
                        <Grid container spacing={'0rem'} sx={{mb: 2}}>
                            {colorSquareChoices}                            
                        </Grid>
                        <div>
                            <Button
                                variant={vaulterColorErrorText.length == 0 ? 'contained' : 'outlined'}
                                color={vaulterColorErrorText.length > 0 ? 'error' : undefined}
                                onClick={handleNext}
                                sx={{ mt: 1, mr: 1 }}
                            >
                                {vaulterColorErrorText.length == 0 ? 'Finish' : 'Select a color'}
                            </Button>
                            <Button
                                disabled={false}
                                onClick={handleBack}
                                sx={{ mt: 1, mr: 1 }}
                            >
                                Back
                            </Button>
                        </div>
                        </Box>
                    </StepContent>
                </Step>
            </Stepper>
            </Box>
        </div>
    )
}




export default NewVaulterForm
