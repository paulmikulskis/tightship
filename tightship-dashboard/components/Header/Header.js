import { useState, useEffect } from 'react'
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Logout from '../Authentication/Logout';


const StyledHeader = styled.div`

    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;


    button {
        width: 150px;
        height: 30px;
    }
`;

const HeaderRight = styled.div`
    height: 100%;
    align-self: flex-end;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: right;
    width: 50%;
    padding: 0 0 0.5rem 1rem;
`;

const HeaderLeft = styled.div`
    height: 100%;
    align-self: flex-end;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: left;
    width: 50%;
    padding: 0 0 0.5rem 1rem;
`;

const Header = (props) => {

    const user = useFirebaseAuth();
    const router = useRouter()

    const headerHeight = props.height ? props.height : '7rem';

    return (
        <StyledHeader height={headerHeight}>
            <HeaderLeft>
                <h3>TightShip</h3>
            </HeaderLeft>
            <HeaderRight>
                <button type="button" onClick={() => router.push('/')}>Go to TightShip home</button>
                <div style={{padding: '0 0.5rem 0 0.5rem'}}><Logout width="150px" height="30px"/></div>
                <h3 style={{visibility: 'hidden'}}>p</h3>
            </HeaderRight>
        </StyledHeader>
    )
}

export default Header
