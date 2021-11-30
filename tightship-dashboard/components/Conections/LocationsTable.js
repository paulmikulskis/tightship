import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import styled from 'styled-components';

import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';


const StyledTable = styled(Box)`
    width: 100%;
    height: 100%;
`;

const LocationsTable = (props) => {

    const [onEdit, setOnEdit] = useState(null);
    const [locations, setLocations] = props.locations;

    const tableRows = Object.entries(locations || {}).map(([name, values], index) => {
        return (
            <TableRow
                key={name}
            >
                <TableCell 
                    component="th" 
                    scope="row" 
                    key={`name-${index}`}
                    sx={{
                    }}
                >
                    <Typography>{name}</Typography>
                </TableCell>
                <TableCell 
                    component="th" 
                    scope="row" 
                    key={`name-${values.address}`}
                    sx={{
                    }}
                >
                    <Typography>{values.address}</Typography>
                </TableCell>
                <TableCell 
                    component="th" 
                    scope="row" 
                    key={`name-${values.category}`}
                    sx={{
                    }}
                >
                    <Typography>{values.category}</Typography>
                </TableCell>
                <TableCell 
                    component="th" 
                    scope="row" 
                    key={`name-${values.category}`}
                    sx={{
                    }}
                >
                    <IconButton> <EditIcon fontSize='small'/> </IconButton>
                </TableCell>
            </TableRow>
        )
    })

    return (
        <StyledTable>
            <TableContainer component={StyledTable} sx={{mb: 1}}>
                <Table size="small" sx={{ width: '100%' }} aria-label="places table">
                    <TableHead
                        onClick={() => setOnEdit(null)}
                    >
                        <TableRow>
                            <TableCell>
                                <Typography 
                                    align="left" 
                                    variant="h6"
                                >
                                    Name
                                </Typography>
                            </TableCell> 
                            <TableCell>
                                <Typography 
                                    align="left" 
                                    variant="h6"
                                >
                                    Address
                                </Typography>
                            </TableCell> 
                            <TableCell>
                                <Typography 
                                    align="left"
                                    variant="h6" 
                                >
                                    Category
                                </Typography>
                            </TableCell> 
                            <TableCell>
                                <Typography 
                                    variant="subtitle"
                                    align="left" 
                                >
                                    Edit
                                </Typography>
                            </TableCell> 
                        </TableRow>
                    </TableHead>
                    <TableBody >
                        {tableRows}
                    </TableBody>
                </Table>
            </TableContainer>
        </StyledTable>
    )
}

export default LocationsTable
