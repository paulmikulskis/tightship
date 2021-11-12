import { useState, useEffect } from 'react'
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { useRouter } from 'next/router';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';


const Search = styled(Autocomplete)`
    width: 100%;
    height: 100%;

`;

const StyledTextField = styled(TextField)`
    fieldset {
        border-radius: 17px;
  }
`;

const AppSearch = () => {

    const searchOptions = [
        { label: 'Home', path: '/app'},
        { label: 'Connections', path: '/app/connections'},
        { label: 'Account', path: '/app/account'},
        { label: 'Dashboard', path: '/app/dashboard'},
    ];

    return (
        <div>
            <Search 
                renderInput={(params) => <StyledTextField {...params} label="looking for something?" />}
                options={searchOptions}
            />
        </div>
    )
}

export default AppSearch
