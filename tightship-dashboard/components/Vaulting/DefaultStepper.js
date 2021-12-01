/*****
 * This component is aimed at giving any arbritrary user some sort of anchor visual
 * to guide their attention as they use the Vaulting Calculator.  
 * There are many different steps and sliders to choose from on the Calculator, 
 * and having a general anchor helps with the general mission statement of this tool 
 * which is to make the vaulting process less stressful.
 * 
 * This is named the DeafultStepper since it is for any arbritrary or "default" user.  
 * Eventually we should plan to indeed build out a more handheld stepper guide with screen
 * area highlighting to guide a first time user through the calculator vaulting process.
 * 
 */
import { useState } from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';


const steps = ['Choose Transaction History', 'Pick Terminals', 'Tune Parameters', 'Run Simulation', 'Export Your Vault Plan']

const DefaultStepper = (props) => {

    const [stepperStep, setStepperStep] = props.stepperStep;

    return (
        <div>
           <Stepper 
                activeStep={stepperStep}
                sx={{
                    width: '95%',
                }}
            >
                {steps.map((label, index) => {
                    const stepProps = {completed: index < stepperStep};
                    const labelProps = {};
                    return (
                        <Step key={label} {...stepProps}>
                        <StepLabel {...labelProps}>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
        </div>
    )
}





export default DefaultStepper
