/* eslint-disable react-hooks/rules-of-hooks */
import { useRouter } from 'next/router';
import styled from 'styled-components';


import SignUp from '../components/Authentication/SignUp';


const SignUpPage = styled.div`
    width: 100%;
    height: 100%;
`;

const signup = () => {

    const router = useRouter();

    return (
        <SignUpPage>
            <SignUp />
        </SignUpPage>
    )
}

export default signup
