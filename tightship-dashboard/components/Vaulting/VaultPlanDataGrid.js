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
    console.log(`colorKey in component=${JSON.stringify(props.colorKey, null, 3)}`)


    const buttonSavePlan = async (plan) => {
      setStepperStep(stepperStep > 5 ? stepperStep : 5);
      setOpenSaveVaultPlan(true);
    };

    const buttonQuickSMS = async (plan) => {
      setStepperStep(stepperStep > 5 ? stepperStep : 5);
      alert('will send quick sms!')
    };

    const buttonClearPlan = () => {
      setStepperStep(3)
      setFillup({});
      setHighPri([]);
      setVaultPlan([]);
      setSimulationButtonPressed(false);
    }


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
          onClick={() => buttonSavePlan(vaultPlan)}>Save Plan</Button>,
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
          onClick={() => buttonQuickSMS()}>Quick SMS</Button>,
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
    </CardFooter>
    </Card>
    )
}


export default VaultPlanDataGrid
