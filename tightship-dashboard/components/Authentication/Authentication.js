import styled from 'styled-components';
import Login from './Login'
import LoginStatus from './LoginStatus';
import Logout from './Logout'


const StyledLoginContainer = styled.div`
    padding: 5rem 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 300px;
    border: 3px solid black;
`;


const Authentication = () => {
    return (
        <div>
        <StyledLoginContainer>
            <Login />
            <Logout />
        </StyledLoginContainer>
        </div>
    )
}

export default Authentication
