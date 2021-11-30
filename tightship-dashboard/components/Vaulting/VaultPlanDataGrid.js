import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import theme from '../../pages/themes';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

import QuickSMS from './QuickSMS';
import SavePlan from './SavePlan';

import Popper from '@mui/material/Popper';

export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const TableCardContent = styled(CardContent)`
  padding: 0;
  margin: 0;
`;

const CardFooter = styled(CardActions)`
    margin:0;
    padding: 0;
    
`;

const VaultPlanDataGrid = (props) => {

    const [vaultPlan, setVaultPlan] = props.vaultPlan;
    const [stepperStep, setStepperStep] = props.stepperStep;
    const [fillup, setFillup] = props.fillup;
    const [highPri, setHighPri] = props.highPri;
    const [simulationButtonPressed, setSimulationButtonPressed] = props.simulationButtonPressed;
    const [openSaveVaultPlan, setOpenSaveVaultPlan] = props.saveVaultPlan;
    const [finished, setFinished] = useState(false);

    // sms popover state variables
    const [smsAnchorElement, setSmsAnchorElement] = useState(null);
    const [savePlanAnchorElement, setSavePlanAnchorElement] = useState(null);

    const openQuickSMS = Boolean(smsAnchorElement);
    const openSavePlan = Boolean(savePlanAnchorElement);

    console.log(`colorKey in component=${JSON.stringify(props.colorKey, null, 3)}`)


    const buttonSavePlan = async (event) => {
      setStepperStep(stepperStep > 5 ? stepperStep : 5);
      setSavePlanAnchorElement(event.currentTarget);
    };

    const closeSavePlan = (plan) => {
      setSavePlanAnchorElement(null);
    };

    const buttonQuickSMS = async (event) => {
      setStepperStep(stepperStep > 5 ? stepperStep : 5);
      setSmsAnchorElement(event.currentTarget);
    };

    const closeQuickSMS = () => {
      setSmsAnchorElement(null);
    };

    const buttonClearPlan = () => {
      setStepperStep(3)
      setFillup({});
      setHighPri([]);
      setVaultPlan([]);
      //setSimulationButtonPressed(false);
    };


    const buttons = [
      <Button 
        endIcon={<SaveAltIcon style={{ fontSize: 19 }} />}
        sx={{
          borderColor: theme.palette.grey.dark,
          color: theme.palette.grey.dark,
          width: '100%', 
          borderBottom: 'none', 
          borderLeft: 'none',
          '&:hover': {
              borderBottom: 'none',
              borderLeft: 'none',
          }}} 
          key="one"
          onClick={(e) => buttonSavePlan(e)}>
            Save Plan
      </Button>,
      <Button 
        endIcon={<PhoneIphoneIcon style={{ fontSize: 17 }} />}
        sx={{
          width: '100%',
          borderColor: theme.palette.grey.dark,
          color: theme.palette.grey.dark,
          borderBottom: 'none',
          '&:hover': {
              borderBottom: 'none',
          }}} 
          key="two"
          onClick={(e) => buttonQuickSMS(e)}>Quick SMS</Button>,
      <Button 
        endIcon={<DeleteOutlineIcon style={{ fontSize: 19 }} />}
        sx={{
          width: '100%', 
          borderColor: theme.palette.grey.dark,
          color: theme.palette.grey.dark,
          borderBottom: 'none', 
          borderRight: 'none',
          '&:hover': {
              borderBottom: 'none',
              borderRight: 'none',
          }}} 
          key="three"
          onClick={() => buttonClearPlan()}>Clear Plan</Button>,
    ];


    return (
    <Card>
    <TableContainer component={TableCardContent}>
      <Table sx={{ width: '100%' }} aria-label="vaulting results table">
        <TableHead>
          <TableRow>
            <TableCell>ATM Name</TableCell>
            <TableCell align="right">Vault Amnt</TableCell>
            <TableCell align="right">Expiration</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vaultPlan.map((row) => (
            <TableRow
              key={row.id}
              sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  backgroundColor: props.colorKey[row.id] + '60',
                  '&:hover': {
                    backgroundColor: props.colorKey[row.id],
                  }
                }}
            >
              <TableCell component="th" scope="row">
                {row.id}
              </TableCell>
              <TableCell align="right">{`$${numberWithCommas(row.amnt)}`}</TableCell>
              <TableCell align="right">{format(row.expiration, 'EEEE, d MMM, yyyy')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <CardFooter>
        <ButtonGroup
            sx={{width: '100%'}}
        >
            {buttons}
        </ButtonGroup>
        <Popover
          id={'quickSMS'}
          open={openQuickSMS}
          anchorEl={smsAnchorElement}
          onClose={closeQuickSMS}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
          }}
        >
          <QuickSMS fillup={fillup} vaultPlan={vaultPlan}/>
        </Popover>
        <Popover
          id={'savePlan'}
          open={openSavePlan}
          anchorEl={savePlanAnchorElement}
          onClose={closeSavePlan}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <SavePlan closePopup={closeSavePlan} date={fillup.date} vaultPlan={vaultPlan}/>
        </Popover>
    </CardFooter>
    </Card>
    )
}


export default VaultPlanDataGrid
