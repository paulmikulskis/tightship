/**
 * Component to select a list of vaulters and then send the preformatted vault plan SMS * 
 */

 import { useFirebaseUserInfo } from '../Authentication/FirebaseUserInfoProvider';
 import { useFirebaseAuth } from '../Authentication/FirebaseAuthProvider';

 import { gql, useMutation } from '@apollo/client';
 import { useState } from 'react';

 import { useTheme, styled } from '@mui/material/styles';
 import { format } from 'date-fns';
 import ButtonGroup from '@mui/material/ButtonGroup';
 import Button from '@mui/material/Button';
 import ButtonBase from '@mui/material/ButtonBase';
 import InputBase from '@mui/material/InputBase';
 import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
 import Box from '@mui/material/Box';
 import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import SendIcon from '@mui/icons-material/Send';

import { formatPhoneNumber } from '../Conections/VaulterCard';

const ButtonB = styled(ButtonBase)(({ theme }) => ({
    fontSize: 13,
    width: '100%',
    textAlign: 'left',
    padding: 8,
    color: theme.palette.mode === 'light' ? '#586069' : '#8b949e',
    fontWeight: 600,
    '&:hover,&:focus': {
      color: theme.palette.mode === 'light' ? '#0366d6' : '#58a6ff',
    },
    '& span': {
      width: '100%',
    },
    '& svg': {
      width: 16,
      height: 16,
    },
}));

const StyledInput = styled(InputBase)(({ theme }) => ({
padding: 10,
width: '100%',
borderBottom: `1px solid ${
    theme.palette.mode === 'light' ? '#eaecef' : '#30363d'
}`,
'& input': {
    borderRadius: 4,
    backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#0d1117',
    padding: 8,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    border: `1px solid ${theme.palette.mode === 'light' ? '#eaecef' : '#30363d'}`,
    fontSize: 14,
    '&:focus': {
    boxShadow: `0px 0px 0px 3px ${
        theme.palette.mode === 'light'
        ? 'rgba(3, 102, 214, 0.3)'
        : 'rgb(12, 45, 107)'
    }`,
    borderColor: theme.palette.mode === 'light' ? '#0366d6' : '#388bfd',
    },
},
}));

const StyledAutocompletePopper = styled('div')(({ theme }) => ({
    [`& .${autocompleteClasses.paper}`]: {
      boxShadow: 'none',
      margin: 0,
      color: 'inherit',
      fontSize: 13,
    },
    [`& .${autocompleteClasses.listbox}`]: {
      backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#1c2128',
      padding: 1,
      [`& .${autocompleteClasses.option}`]: {
        minHeight: 'auto',
        alignItems: 'flex-start',
        padding: 5,
        paddingLeft: 9,
        borderBottom: `1px solid  ${
          theme.palette.mode === 'light' ? ' #eaecef' : '#30363d'
        }`,
        '&[aria-selected="true"]': {
          backgroundColor: 'transparent',
        },
        '&[data-focus="true"], &[data-focus="true"][aria-selected="true"]': {
          backgroundColor: theme.palette.action.hover,
        },
      },
    },
    [`&.${autocompleteClasses.popperDisablePortal}`]: {
      position: 'relative',
    },
}));


const VAULT_PLAN_SMS = gql`
    mutation VaultPlanSMS($uid: String!, $vaulterNames: [String], $numbers: [String]!, $terminals: [String]!, $amounts: [Int]!, $date: Date, $message: String, $sendTime: String) {
        app(uid: $uid) {
            sendSMSVaultPlan(
                uid: $uid,
                numbers: $numbers,
                terminals: $terminals,
                amounts: $amounts,
                date: $date,
                message: $message,
                sendTime: $sendTime,
                vaulterNames: $vaulterNames
            )
        }
    }
`;


function PopperComponent(props) {
    const { disablePortal, anchorEl, open, ...other } = props;
    return <StyledAutocompletePopper {...other} />;
};

const QuickSMS = (props) => {

    const user = useFirebaseAuth();
    const info = useFirebaseUserInfo();
    const userVaulters = info.userVaulters;
    const vaulters = Object.entries(userVaulters).map(([k, v]) => v)
    const [selectedVaulters, setSelectedVaulters] = useState([]);
    const theme = useTheme();
    const vaultPlan = props.vaultPlan;
    const fillup = props.fillup;
    const vaultDate = fillup.date;

    const [sendSMSFunction, { data, loading, error }] = useMutation(VAULT_PLAN_SMS, {
        variables: {
            uid: user.uid,
            vaulterNames: selectedVaulters.map(v => v.name),
            numbers: selectedVaulters.map(v => v.number),
            terminals: vaultPlan.map(row => row.id),
            amounts: vaultPlan.map(row => row.amnt),
            date: vaultDate,
            message: '',
            sendTime: new Date(),
        }
    });

    const sendVaultPlan = async () => {
        if (!vaultPlan) { 
            alert('vault plan is undefined');
            return false;
        };
        if (vaultPlan.length === 0) {
            alert('no vault plan!  start by creating a new one');
            return false;
        };
        sendSMSFunction();

    }

    return (
        <div>
            <Autocomplete
              open
              multiple
              onClose={(event, reason) => {
                if (reason === 'escape') {
                  handleClose();
                }
              }}
              value={selectedVaulters}
              onChange={(event, newValue, reason) => {
                if (
                  event.type === 'keydown' &&
                  event.key === 'Backspace' &&
                  reason === 'removeOption'
                ) {
                  return;
                }
                setSelectedVaulters(newValue);
              }}
              disableCloseOnSelect
              PopperComponent={PopperComponent}
              renderTags={() => null}
              noOptionsText="no configured Vaulters"
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Box
                    component="span"
                    sx={{
                      width: 14,
                      height: 14,
                      flexShrink: 0,
                      borderRadius: '3px',
                      mr: 1,
                      mt: '2px',
                    }}
                    style={{ backgroundColor: option.color }}
                  />
                  <Box
                    sx={{
                      flexGrow: 1,
                      '& span': {
                        color:
                          theme.palette.mode === 'light' ? '#586069' : '#8b949e',
                      },
                    }}
                  >
                    {option.name}
                    <br />
                    <span>{formatPhoneNumber(option.number)}</span>
                  </Box>
                  <Box
                    component={DoneIcon}
                    sx={{ width: 17, height: 17, mr: '5px', ml: '-2px' }}
                    style={{
                      visibility: selected ? 'visible' : 'hidden',
                    }}
                  />
                </li>
              )}
              options={vaulters}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <StyledInput
                  ref={params.InputProps.ref}
                  inputProps={params.inputProps}
                  autoFocus
                  placeholder="My Vaulters"
                />
              )}
            />
            <ButtonB 
                onClick={() => sendVaultPlan()}
            >
                Send
                <SendIcon sx={{ml: 1}}/>
            </ButtonB>
        </div>
    )
}





export default QuickSMS
