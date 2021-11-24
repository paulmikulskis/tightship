import { useState, useEffect } from 'react'
import { collection, doc, getDoc, addDoc, setDoc, getFirestore } from "firebase/firestore"; 
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ShareIcon from '@mui/icons-material/Share';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';

import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';

import RaiseableCard from '../AppHome/RaiseableCard';
import NewVaulterForm from './NewVaulterForm';
import { useFirebaseUserInfo } from '../Authentication/FirebaseUserInfoProvider';
import { useFirebaseAuth } from '../Authentication/FirebaseAuthProvider';

import EmailIcon from '@mui/icons-material/Email';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

const ColorSquareChoice = styled(Card)`
    background-color: ${props => props.color};
    width: 1rem;
    height: 1rem;
    margin: 0;
    padding: 0;
`;

const StyledVaulterCard = styled(RaiseableCard)`
    width: 100%;
    height: 100%;
    border-radius: 15px;
    padding: 0;
    margin: 0;
    align-items: top;
`;

const CenteredCardContent = styled(CardContent)`
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: left;
    &:last-child {
        padding-bottom: 0;
    }
`;

const ListIcon = styled(ListItemAvatar)`
    min-width: 40px;
`;

const InsetDivider = styled(Divider)`
    margin-left: 30px;
`;

export const formatPhoneNumber = (phoneNumberString) => {
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


const VaulterCard = (props) => {

    const listIconSpacer = '27px';
    const listIconSize = '17px';

    const [hoverVaulter, setHoverVaulter] = useState(false);
    const [anchorElement, setAnchorElement] = useState(null);
    const [colorRaised, setColorRaised] = useState(false);
    const user = useFirebaseAuth();
    const db = getFirestore();
    const userInfo = useFirebaseUserInfo();
    const userVaulters = userInfo.userVaulters;
    const setUserVaulters = userInfo.setUserVaulters;

    const vaulterName = props?.name ? props.name.split(' ')[0].slice(0,13) : 'vaulter-name';
    const vaulterInfo = props.info;
    var vaulterPhone = formatPhoneNumber(vaulterInfo.number || '');
    vaulterPhone = vaulterPhone === '' ? 'n/a' : vaulterPhone;
    const vaulterEmail = vaulterInfo.email || 'n/a';
    const color = vaulterInfo?.color || '#7134eb';

    const handleVaulterDelete = (event) => {
        setAnchorElement(event.currentTarget)
    };

    const handleVaulterDeleteClose = () => {
        setAnchorElement(null)
    };

    const handleDeleteVaulter = async (name) => {
        const vaulterRef = doc(db, 'vaulters', user.uid);
        var userVaulters = (await getDoc(vaulterRef)).data();
        delete userVaulters[name];
        await setDoc(
            vaulterRef, 
            userVaulters
        ).then(() => {
            handleVaulterDeleteClose()
            setUserVaulters(userVaulters);
            return userVaulters;
        })
    };

    const open = Boolean(anchorElement);
    const id = open ? 'vaulterdeletepopper' : undefined;

    return (
        <Grid item xs={4} sx={{height: '100%'}}>
            <StyledVaulterCard sx={{m: 0, pl: 1.5, pb: 1}}>
                <CardHeader sx={{maxHeight: '200px', m: 0, p: 0, pt: 1}}
                    title={<Typography variant="h6" sx={{m: 0, p: 0}}>{vaulterName}</Typography>}    
                    action={
                        <IconButton 
                            aria-label="remove vaulter card"
                            onClick={!anchorElement ? (e) => handleVaulterDelete(e) : undefined}
                        >
                            <DeleteIcon 
                                sx={{
                                    maxWidth: '38px', 
                                    maxHeight: '38px', 
                                    '&:hover': {
                                        color: '#454545'
                                    }
                                }}
                            />
                            <Popover
                                id={id}
                                open={open}
                                anchorEl={anchorElement}
                                onClose={() => handleVaulterDeleteClose()}
                                anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                                }}
                            >
                                <Stack direction='horizontal' justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" sx={{ p: 1.3, pr: 0.8 }}>delete <b>{props?.name ? props.name : 'vaulter-name'}</b>?</Typography>
                                <IconButton 
                                    size='small'
                                    onClick={(e) => handleDeleteVaulter(props?.name ? props.name : 'vaulter-name')}
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
                                    onClick={(e) => handleVaulterDeleteClose()}
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
                    }
                    avatar={                
                        <ColorSquareChoice 
                            color={color}
                            onClick={() => setVaulterColor(color)}
                            onMouseOver={()=>setColorRaised(true)} 
                            onMouseOut={()=>setColorRaised(false)} 
                            elevation={colorRaised ? 8 : 2}
                            sx={{
                                border: colorRaised ? '1px solid #88888870' : 'none',
                                border: colorRaised ? '2px solid #555' : 'none',
                            }}
                        >
    
                        </ColorSquareChoice>}
                >
                </CardHeader>
                <CenteredCardContent
                    onMouseOver={e => setHoverVaulter(true)}
                    onMouseOut={e => setHoverVaulter(false)}
                    sx={{m: 0, p: 0}}
                >
                    <List
                        sx={{
                            width: '100%',
                            maxWidth: 360,
                            bgcolor: 'background.paper',
                        }}
                        >
                        <ListItem sx={{m: 0, p: 0}}>
                            <ListIcon style={{minWidth: listIconSpacer}}>
                                <PhoneIphoneIcon sx={{fill: '#4e5a65', width: listIconSize, height: listIconSize}}/>
                            </ListIcon>
                            <Typography variant="caption" >{vaulterPhone}</Typography>
                        </ListItem>
                        <InsetDivider variant="inset" component="li" />
                        <ListItem sx={{m: 0, p: 0, pt: 1}}>
                            <ListIcon style={{minWidth: listIconSpacer}}>
                                <EmailIcon sx={{fill: '#4e5a65', width: listIconSize, height: listIconSize}}/>
                            </ListIcon>
                            <Typography variant="caption" >{vaulterEmail}</Typography>
                        </ListItem>
                        <InsetDivider variant="inset" component="li" />
                        <ListItem sx={{m: 0, p: 0, pt: 1}}>
                            <ListIcon style={{minWidth: listIconSpacer}}>
                                <AccountBoxIcon sx={{fill: '#4e5a65', width: listIconSize, height: listIconSize}}/>
                            </ListIcon>
                            <Typography variant="caption" >{props.name}</Typography>
                        </ListItem>
                    </List>

                </CenteredCardContent>
            </StyledVaulterCard>
        </Grid>
    )
}




export default VaulterCard
