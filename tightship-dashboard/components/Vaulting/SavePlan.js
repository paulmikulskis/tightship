import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useFirebaseUserInfo } from '../Authentication/FirebaseUserInfoProvider';
import { useFirebaseAuth } from '../Authentication/FirebaseAuthProvider';
import { collection, doc, getDoc, addDoc, setDoc, getFirestore } from "firebase/firestore"; 
import { useTheme, styled } from '@mui/material/styles';
import { format } from 'date-fns';
import Typography from '@mui/material/Typography';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';


import TextField from '@mui/material/TextField';

const SavePlanPopup = styled(Box)`
    padding: 1rem;
    padding-right: 0.5rem;
`;

const SavePlan = (props) => {

    const inputPlaceholder = "Blackbeard's Run";
    const [planName, setPlanName] = useState(inputPlaceholder);
    const closePopup = props.closePopup;
    const db = getFirestore();
    const user = useFirebaseAuth();

    const savePlan = async (plan, fillup) => {
        // return true;
        if (plan === undefined || plan === null) {
            alert('no vault plan to save!');
            return false;
        };
        const firestoreVaultPlanObj = {
            date: fillup.date,
            terminals: plan.map(row => row.id),
            amounts: plan.map(row => row.amnt),
            expirations: plan.map(row => row.expiration)
        };

        const planRef = doc(db, 'vaulting', user.uid, 'plans', planName);
        const saveResult = await setDoc(
            planRef, 
            firestoreVaultPlanObj,
            { merge: true }
        ).then(() => {
            closePopup();
            return firestoreVaultPlanObj;
        });

        return saveResult;
    };


    return (
            <SavePlanPopup>
                <Stack direction='row' spacing={1}>
                    <TextField
                        onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                                savePlan(props.vaultPlan, props.fillup);
                            };
                        }}
                        onChange={(event) => setPlanName(event.currentTarget.value)}
                        onClick={() => {
                            if (planName === inputPlaceholder) {
                                setPlanName('')
                            };
                        }}
                        label="Plan Nickname"
                        id="plan-nickname-input"
                        value={planName}
                        size="small"
                    />
                    <IconButton
                        onClick={(e) => savePlan(props.vaultPlan, props.fillup)}
                    >
                        <SaveIcon />
                    </IconButton>
                </Stack>
            </SavePlanPopup>
    )
}

export default SavePlan
