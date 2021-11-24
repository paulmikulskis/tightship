import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '../Authentication/FirebaseAuthProvider';
import styled from 'styled-components';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ShareIcon from '@mui/icons-material/Share';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { useQuery, gql } from "@apollo/client";
import Stack from '@mui/material/Stack';
import FlagIcon from '@mui/icons-material/Flag';


import theme from '../../pages/themes';


const StyledCrumbyBoy = styled(Card)`
    width: 100%;
    height: 12rem;
    grid-column: 2/-1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const StyledCardContent = styled(CardContent)`

`;

const CardFooter = styled(CardActions)`
    margin:0;
    padding: 0;
    
`;

const ChipGrid = styled(Grid)`

`;

const SelectCrumbs = (props) => {


    const [selectedOptions, setSelectedOptions] = props.selectState;
    const [highPri, setHighPri] = props.highPri;
    const data = props.terminalData;
    const colorScale = props.colorscale;

    const handleDelete = (option) => {
        console.log(`value: ${option}`);
        setSelectedOptions(selectedOptions.filter(o => {
            return o != option;
            })
        )
    };

    const handleClick = (atmName) => {
        highPri.indexOf(atmName) > -1 ? 
            setHighPri(highPri.filter(o => o!=atmName)) :
            setHighPri([...highPri, atmName])
      };
    var atmCrumbs = selectedOptions.map((option) => {
        const isHighPri = highPri.indexOf(option) > -1;
        return (
            // eslint-disable-next-line react/jsx-key
            <Grid item>
                <Chip 
                    sx={{
                        backgroundColor: colorScale[option] + '95',
                        outline: isHighPri ? '1px solid #ff6347' : 'none'
                    }}
                    icon={
                        isHighPri ? 
                        <FlagIcon sx={{fill: '#f7022a'}}/> :
                        <div></div>
                    }
                    onClick={() => handleClick(option)}
                    label={option}
                    onDelete={(event) => handleDelete(option)} 
                />
            </Grid>
      
        )
    });
    if (atmCrumbs.length == 0) {
        atmCrumbs = (
            <Grid item>
                <h4 style={{color: 'grey'}}>selected terminals will appear here</h4>
            </Grid>
        )
    }

    const buttonAddAll = () => {
        setSelectedOptions(data.map(i => i.locationName));
    };

    const buttonClearAll = () => {
        setSelectedOptions([]);
    };

    const buttonClearAllPriorities = () => {
        setHighPri([])
    };

    const buttonFilterHighPri = () => {
        setSelectedOptions(selectedOptions.filter(o => highPri.indexOf(o) >= 0))
    };

    const buttons = [
        <Button sx={{
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
            onClick={() => buttonAddAll()}>Add All Terminals</Button>,
        <Button sx={{
            width: '100%',
            borderColor: theme.palette.grey.dark,
            color: theme.palette.grey.dark,
            borderBottom: 'none',
            '&:hover': {
                borderBottom: 'none',
            }}} 
            key="two"
            onClick={() => buttonClearAll()}>Clear All Terminals</Button>,
        <Button sx={{
            width: '100%',
            borderColor: theme.palette.grey.dark,
            color: theme.palette.grey.dark,
            borderBottom: 'none',
            '&:hover': {
                borderBottom: 'none',
            }}} 
            key="two"
            onClick={() => buttonClearAllPriorities()}>Clear Priority</Button>,
        <Button sx={{
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
            onClick={() => buttonFilterHighPri()}>Only High Priority</Button>,
      ];

    return (
            <StyledCrumbyBoy 
                elevation={0} 
                sx={{
                    backgroundColor: theme.palette.background.default,
                    border: '1px solid',
                    borderColor: theme.palette.grey.dark,
                    borderRadius: '10px'
                }}
                >
                <StyledCardContent>
                    <ChipGrid container spacing={2}>
                        {atmCrumbs}
                    </ChipGrid>
                </StyledCardContent>
                <CardFooter>
                    <ButtonGroup
                        sx={{width: '100%'}}
                    >
                        {buttons}
                    </ButtonGroup>
                </CardFooter>
            </StyledCrumbyBoy>            
    )
}



export default SelectCrumbs
