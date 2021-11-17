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
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { useQuery, gql } from "@apollo/client";





const StyledAutoComplete = styled(Autocomplete)`
    grid-column: 1/2;
`;

const Selector = (props) => {

    const [selectedOptions, setSelectedOptions] = props.selectState;
    const data = props.terminalData;
    const atm_names = data.map(info => info.locationName)
    const selectionPlaceholder = selectedOptions.length > 0 ? `${selectedOptions.length} terminals selected` : 'MyCashMachine';
    const handleInputChange = (event, value) => {
        setSelectedOptions(value);
    };

    return (
            <StyledAutoComplete
                multiple
                options={atm_names}
                freeSolo
                onChange={handleInputChange}
                renderTags={(value, getTagProps) =>
                    <div><p>{JSON.stringify(getTagProps)}</p></div>
                }
                renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label="select terminals"
                    placeholder={selectionPlaceholder}
                />
                )}
            />
    )
}





export default Selector
