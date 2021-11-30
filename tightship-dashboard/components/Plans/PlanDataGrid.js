
import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import styled from 'styled-components';

import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Button from '@mui/material/Button';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import CheckIcon from '@mui/icons-material/Check';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const StyledPlanDataGrid = styled(Box)`
    width: 100%;
    height: 100%;
`;


const AddTableRow = styled(Box)`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
`;


const PlanDataGrid = (props) => {

    const [vaultPlan, setVaultPlan] = props.vaultPlan;
    const [isEditMode, setIsEditMode] = props.isEditMode;
    const [onEdit, setOnEdit] = useState(null);
    const allTerminals = props.allTerminals;
    const [amountError, setAmountError] = useState(null);
    const [addNewRow, setAddNewRow] = useState(false);
    const [newName, setNewName] = useState(null);
    const [newAmount, setNewAmount] = useState(2000);
 
    const nameEdit = (value, terminalName) => {
        const val = {...vaultPlan};
        const extra = val.terminals.indexOf(value);
        const index = val.terminals.indexOf(terminalName);
        if (extra > -1) {
            console.log(`found duplicate at index=${extra}\ntaking old amount =${val.amounts[index]} and adding to ${val.amounts[extra]}`)
            const oldAmnt = [...val.amounts][index];
            val.amounts[extra] = val.amounts[extra] + oldAmnt;
            val.terminals.splice(index, 1);
            console.log(`took out a terminal, now is ${val.terminals.length} terminals: ${val.terminals}`)
            val.amounts.splice(index, 1);
            val.expirations.splice(index, 1);
            console.log(`load for ${val.terminals[extra-1]} should now = $${val.amounts[extra-1]}`)
        } else {
            val.terminals[index] = value;
        }
        //console.log(`about to set vault plan to ${JSON.stringify(vaultPlan, null, 3)}`);
        setVaultPlan(val)
    };

    useEffect(() => {
        if (!isEditMode) {
            setAddNewRow(false);
        }
    })


    const handleConfirmNewRow = () => {
        const val = {...vaultPlan}; 
        if (newName && newName != '' && newAmount && newAmount > 0) {
            val.terminals.push(newName);
            val.amounts.push(newAmount);
            val.expirations.push({});
            setVaultPlan(val);
            setNewName(null);
            setNewAmount(2000);
            setAddNewRow(false);
        };

    };

    const deleteRow = async (name) => {
        if (vaultPlan.terminals.length < 2) {
            setOnEdit(false);
            setIsEditMode(false);
            await props.deletePlan();
            return;
        }
        const index = vaultPlan.terminals.indexOf(name);
        const val = {...vaultPlan};
        val.terminals.splice(index, 1);
        val.expirations.splice(index, 1);
        val.amounts.splice(index, 1);
        setVaultPlan(val);
    };

    const valueEdit = (e, terminalName) => {
        let amount;
        if (e.target.value === '') {
            setAmountError('intput a value');
            amount = 0;
        } else {
            setAmountError(null);
            amount = parseInt(e.target.value);
        }
        const val = {...vaultPlan};
        val.amounts[val.terminals.indexOf(terminalName)] = amount;
        setVaultPlan(val);
    };

    const handleAddNewRow = () => {
        setOnEdit(null);
        setAddNewRow(!addNewRow);
    }

    return (
        <StyledPlanDataGrid>
            <TableContainer component={StyledPlanDataGrid} sx={{mb: 1}}>
                <Table size="small" sx={{ width: '100%' }} aria-label="vaulting results table">
                <TableHead
                    onClick={() => setOnEdit(null)}
                >
                    <TableRow>
                        {isEditMode ? (
                            <TableCell>
                                <Typography 
                                    align="left" 
                                    variant='caption'
                                >
                                    remove
                                </Typography>
                            </TableCell> ): ( undefined )
                        }
                        <TableCell align="left">ATM Name</TableCell>
                        <TableCell align="right">Amount</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody >
                    {vaultPlan.terminals.map((terminalName, i) => (
                        <TableRow
                        key={terminalName}
                        onClick={() => {
                            if (isEditMode) {
                                setAddNewRow(false);
                                setOnEdit(terminalName);
                            }
                        }}
                        sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            '&:hover': {
                                backgroundColor: isEditMode ? '#e8f1ff' : '#f0f0f0',
                                boxShadow: '0px 1px 2px #9c9c9c',
                            },
                        }}
                        >
                        { isEditMode ? (
                            <TableCell 
                                component="th" 
                                scope="row" 
                                key={`delete-${i}`}
                                sx={{ }}
                            >
                                <CancelOutlinedIcon
                                    onClick={() => deleteRow(terminalName)}
                                    sx={{
                                        color: 'slategrey',
                                        '&:hover': {
                                            color: '#dc143c'
                                        }
                                    }}
                                />
                            </TableCell>
                            ) : (
                                undefined
                            )

                        }
                        <TableCell 
                            component="th" 
                            scope="row" 
                            key={`name-${i}`}
                            sx={{
                            }}
                        >
                            {(isEditMode && onEdit===terminalName) ? (
                                <Autocomplete 
                                    size="small"        
                                    freeSolo
                                    options={allTerminals.map(t => t.locationName)}
                                    name={terminalName}
                                    variant="standard"
                                    onChange={(e, value) => nameEdit(value, terminalName)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            label={terminalName}
                                            placeholder={terminalName}
                                        />
                                    )}
                                />
                                ) : (
                                terminalName
                            )}
                        </TableCell>
                        <TableCell 
                            sx={{
                            }}
                            align="right"
                            key={`amount-${i}`}
                        >
                        {(isEditMode && onEdit===terminalName) ? (    
                                <TextField
                                    helperText={amountError != '' ? amountError : undefined}
                                    sx={{maxWidth: '5rem'}}
                                    type="number"
                                    name={`${terminalName}-amount`}
                                    variant="standard"
                                    defaultValue={vaultPlan.amounts[i]}
                                    onChange={(e) => valueEdit(e, terminalName)}
                                />
                                ) : (
                                `$${numberWithCommas(vaultPlan.amounts[i])}`
                            )}
                            
                        </TableCell>
                        </TableRow>
                    ))}
                    {(addNewRow && isEditMode) ? (<TableRow
                        key={'addnew'}
                        sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            '&:hover': {
                                backgroundColor: isEditMode ? '#e8f1ff' : '#f0f0f0',
                                boxShadow: '0px 1px 2px #9c9c9c',
                            },
                        }}
                        >
                        <TableCell 
                            component="th" 
                            scope="row" 
                            key={`newname`}
                            sx={{
                            }}
                        >
                            <Autocomplete 
                                size="small"
                                freeSolo
                                options={allTerminals.map(t => t.locationName).filter(t => !vaultPlan.terminals.includes(t))}
                                variant="standard"
                                onChange={(e, value) => setNewName(value)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        label={'Select a location'}
                                        placeholder={'Pirate Cove'}
                                    />
                                )}
                            />
                        </TableCell>
                        <TableCell 
                            sx={{
                            }}
                            align="right"
                            key={`newamount`}
                        >
                            <TextField
                                helperText={amountError != '' ? amountError : undefined}
                                sx={{maxWidth: '5rem'}}
                                type="number"
                                variant="standard"
                                defaultValue={'2000'}
                                onChange={(e) => setNewAmount(e.target.value == '' ? 0 : parseInt(e.target.value))}
                            />
                            
                        </TableCell>
                    </TableRow>) : undefined}
                </TableBody>
                </Table>
            </TableContainer>
            <AddTableRow>
                {isEditMode ? (
                        (addNewRow ? (
                            <div>
                                <Button 
                                    variant="outlined"
                                    sx={{
                                        width: '30%',
                                        mt: 1,
                                        p: 0.1
                                    }}
                                    onClick={(e) => handleAddNewRow()}
                                >
                                    <KeyboardArrowUpIcon fontSize='small' />
                                </Button>
                                <Button 
                                    variant="outlined"
                                    sx={{
                                        width: '30%',
                                        ml: 2,
                                        mt: 1,
                                        p: 0.1
                                    }}
                                    onClick={(e) => handleConfirmNewRow()}
                                >
                                    <CheckIcon fontSize='small' />
                                </Button>
                            </div>
                            ) : (
                            <Button 
                                variant="outlined"
                                sx={{
                                    width: '50%',
                                    mt: 1,
                                    p: 0.1
                                }}
                                onClick={(e) => handleAddNewRow()}
                            >
                                <AddIcon fontSize='small'/>
                            </Button>
                            )
                        )
                    ) : ( undefined )
                }
            </AddTableRow>
        </StyledPlanDataGrid>
    )
}

export default PlanDataGrid
