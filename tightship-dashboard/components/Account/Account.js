import { useState, useEffect } from 'react'
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import { useRouter } from 'next/router';
import styled from 'styled-components';

const StyledHome = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 1fr 1fr;
    height: 100%;
`;

const Center = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

const Account = () => {
    return (
        <StyledHome>
            <Center><p>Account Component</p></Center>
            <Center><p>Account Component</p></Center>
            <Center><p>Account Component</p></Center>
            <Center><p>Account Component</p></Center>
            <Center><p>Account Component</p></Center>
            <Center><p>Account Component</p></Center>
            
        </StyledHome>
    )
}

export default Account
