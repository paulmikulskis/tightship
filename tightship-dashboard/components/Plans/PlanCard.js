/* eslint-disable react/jsx-key */
import { useState, useEffect } from 'react'
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { collection, doc, getDocs, deleteDoc, setDoc, getFirestore } from "firebase/firestore"; 
import styled from 'styled-components';
import Popover from '@mui/material/Popover';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import CardContent from '@mui/material/CardContent';
import theme from '../../pages/themes';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import EditIcon from '@mui/icons-material/Edit';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlanDataGrid from './PlanDataGrid';
import MoneyStatement from '../StatCard/MoneyStatement';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import SyncAltIcon from '@mui/icons-material/SyncAlt';

import QuickSMS from '../Vaulting/QuickSMS';
import VaultingDateSelector from '../Vaulting/VaultingDateSelector';


const StyledGrid = styled(Grid)`
    padding: 1rem;
`;

const StyledVaultPlanCard = styled(Card)`
    min-height: 300px;
`;

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const PlanCard = (props) => {

    const allTerminals = props.allTerminals;
    const db = getFirestore();
    const user = useFirebaseAuth();
    const [deleteAnchorEl, setDeleteAnchorEl] = useState(null);
    const [quickSMSAnchorEl, setQuickSMSAnchorEl] = useState(null);
    const [name, setName]= useState(props.name);
    const [newName, setNewName] = useState(name);
    const [vaultPlan, setVaultPlan] = useState(props.vaultPlan);
    const [isEditMode, setIsEditMode] = useState(false);
    const [invisible, setInvisible] = props.invisible;
    const [isCalEdit, setIsCalEdit] = useState(false);
    const [date, setDate] = useState(vaultPlan.date);
    const [newDateAnchorEl, setNewDateAnchorEl] = useState(null);
    //console.log(`vault plan: \n${JSON.stringify(vaultPlan, null, 3)}`)
    const openDelete = Boolean(deleteAnchorEl);
    const openQuickSMS = Boolean(quickSMSAnchorEl);
    const openNewDate = Boolean(newDateAnchorEl);


    const smsData = vaultPlan.terminals.map((name, index) => {
        return {
            id: name,
            amnt: vaultPlan.amounts[index]
        };
    });

    const handleDeletePlan = async () => {
        console.log(`adding ${name} to list of invisible cards`)
        await deleteDoc(doc(db, 'vaulting', user.uid, 'plans', name));
        setInvisible([...invisible, name]);
    };

    const handlePlanDeleteClose = () => {
        setDeleteAnchorEl(null);
    };

    const handleEdit = async () => {
        const editedPlan = {...vaultPlan};
        if (isEditMode) { 
            if (date != vaultPlan.date) {
                editedPlan.date = date;
            };
            if (newName != name) {
                await deleteDoc(doc(db, 'vaulting', user.uid, 'plans', name))
            };
            await setDoc(doc(db, 'vaulting', user.uid, 'plans', newName), editedPlan)
        };
        setName(newName);
        setVaultPlan(editedPlan);
        setIsEditMode(!isEditMode);
    };

    const handleQuickSMSClose = () => {
        setQuickSMSAnchorEl(null);
    };

    const handleSetNewDate = () => {
        const val = {...vaultPlan};
        val.date = new Date(date);
        setVaultPlan(val);
        setNewDateAnchorEl(null);
    };


    const isFuture = vaultPlan.date > new Date();
    return (
        <StyledVaultPlanCard elevation={isEditMode ? 8 : 1}>
            <CardContent>
                {(isEditMode) ? (
                    <TextField 
                        onKeyPress={(ev) => {
                            if (ev.key === 'Enter') {
                                setNewName(ev.target.value);
                                handleEdit();
                            };
                        }}
                        id="newname" 
                        label="Adjust Name"
                        defaultValue={name}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        variant="standard"
                        sx={{
                            pt: 0,
                            mt: 0,
                            mb: 2
                        }}
                    />
                  ) : (
                    <Typography variant='h6' sx={{pb: 1}}>{name}</Typography>
                    )
                }
                <Stack direction='row' spacing={1} justifyContent='space-between'>
                    <Stack direction='row' spacing={1} sx={{p: 0.2, borderRadius: '5px', boxShadow: (isCalEdit && isEditMode) ? '0px 0px 4px #a1b0c7' : 'none'}}>
                        <div
                            onMouseOut={() => setIsCalEdit(false)}
                            onMouseOver={() => setIsCalEdit(true)}
                            onMouseDown={(e) => setNewDateAnchorEl(e.currentTarget)}
                        >
                        { (isFuture) ? (
                            ((isEditMode && isCalEdit) || openNewDate) ? 
                                <SyncAltIcon 
                                    sx={{color: '#14428c'}}
                                /> : 
                                <CalendarTodayIcon 
                                />
                            ) : (
                            <EventAvailableIcon />
                            )
                        }
                        </div>
                        <Popover
                            id={`${name}-newdate`}
                            open={openNewDate}
                            anchorEl={newDateAnchorEl}
                            onClose={() => handleSetNewDate()}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                        >
                            <Box sx={{pt: 2, pr: 1, pb: 2, pl: 2}}>
                                <VaultingDateSelector 
                                    dateState={[date, setDate]}
                                />
                            </Box>
                    </Popover>
                        <Stack direction='column' spacing={0}>
                            <Typography sx={{mb: -1, mt: -0.3, pr: 0.3}} variant='caption'>{format(vaultPlan.date, 'EEEE, MMM d')}</Typography>
                            { (isCalEdit && isEditMode) ? (
                                    <Typography sx={{color: '#14428c'}} variant='caption'>change date</Typography>
                                ) : (
                                    <Typography sx={{color: isFuture? 'orange' : 'green'}} variant='caption'>{isFuture ? 'upcoming' : 'completed'}</Typography>
                                )
                            }
                        </Stack>
                    </Stack>
                    <Stack direction='column' spacing={0}>
                        <Typography variant='caption' sx={{fontSize: '8px', pl: 0.3}}>total</Typography>
                        <Typography sx={{pt: 0.0}} variant='subtitle'>{`$${numberWithCommas(vaultPlan.amounts.reduce((a,b) => a + b))}`}</Typography>
                    </Stack>
                    <ButtonGroup disableRipple variant="text" size='small' aria-label="outlined button group" sx={{maxHeight: '1rem', pt: 2}}>
                        <IconButton 
                            size='small' 
                            onClick={() => handleEdit()}
                        >
                            {isEditMode ? (
                                <SaveIcon 
                                    fontSize='8px' 
                                    color='grey'
                                    sx={{
                                        '&:hover': {
                                            color: '#d9bc00',
                                            backgroundColor: '#d9bc0020',
                                            borderRadius: '100%'
                                        }
                                    }}    
                                />
                            ):(
                                <EditIcon 
                                    fontSize='8px' 
                                    color='grey'
                                    sx={{
                                        '&:hover': {
                                            color: 'slategrey'
                                        }
                                    }}    
                                />
                            )}
                        </IconButton>
                        <IconButton 
                            onClick={(e) => setQuickSMSAnchorEl(quickSMSAnchorEl ? null : e.currentTarget)}
                        >
                            <PhoneIphoneIcon 
                                fontSize='8px' 
                                color='grey'
                                sx={{
                                    '&:hover': {
                                        color: 'slategrey'
                                    }
                                }}    
                            />
                        </IconButton>
                        <IconButton 
                            onClick={(e) => setDeleteAnchorEl(deleteAnchorEl ? null : e.currentTarget)}
                        >
                            <DeleteIcon 
                                fontSize='8px' 
                                color='grey'
                                sx={{
                                    '&:hover': {
                                        color: 'slategrey'
                                    }
                                }}
                            />
                            <Popover
                                id={name}
                                open={openDelete}
                                anchorEl={deleteAnchorEl}
                                onClose={() => handlePlanDeleteClose()}
                                anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                                }}
                            >
                                <Stack direction='horizontal' justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" sx={{ p: 1.3, pr: 0.8 }}>delete plan <b>{name}</b>?</Typography>
                                <IconButton 
                                    size='small'
                                    onClick={handleDeletePlan}
                                    sx={{
                                        maxWidth: '38px', 
                                        maxHeight: '38px', 
                                        '&:hover': {
                                            color: 'green'
                                        }
                                    }}
                                >
                                    <CheckCircleOutlineIcon />
                                </IconButton>
                                <IconButton 
                                    size='small'
                                    onClick={(e) => handlePlanDeleteClose()}
                                    sx={{
                                        maxWidth: '38px', 
                                        maxHeight: '38px', 
                                        pr: 1.3, 
                                        '&:hover': {
                                            color: '#dc143c'
                                        }
                                    }}
                                >
                                    <CancelOutlinedIcon />
                                </IconButton>
                                </Stack>
                            </Popover>
                        </IconButton>
                    </ButtonGroup>
                    <Popover
                        id={name}
                        open={openQuickSMS}
                        anchorEl={quickSMSAnchorEl}
                        onClose={handleQuickSMSClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                    >
                        <QuickSMS
                            date={vaultPlan.date} 
                            vaultPlan={smsData} 
                            close={handleQuickSMSClose}
                        />
                    </Popover>
                </Stack>
                <PlanDataGrid 
                    deletePlan={handleDeletePlan}
                    allTerminals={allTerminals}
                    vaultPlan={[vaultPlan, setVaultPlan]} 
                    isEditMode={[isEditMode, setIsEditMode]}
                />
            </CardContent>
        </StyledVaultPlanCard>
    )
}

export default PlanCard
