import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useFirebaseAuth } from "../Authentication/FirebaseAuthProvider";
import styled from 'styled-components';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useFirebaseUserInfo } from '../Authentication/FirebaseUserInfoProvider';
import { collection, doc, getDoc, addDoc, setDoc, getFirestore } from "firebase/firestore"; 
import CheckExMark from './CheckExMark';


const StyledPaiConnect = styled.div`
    padding: 1rem;
    width: 100%;
    height: 100%;
    z-index: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const Form = styled.div`
    display: flex;
    flex-direction: column;
    align-items: right;
    width: 70%;

    #toggle {
        margin: 1.1rem;
    }

`;

const StyledTextField = styled(TextField)`
    margin: 1rem;
`;

const StyledButton = styled(Button)`
    width: 50%;
    margin: 1rem;
`;

const ConnectionInfo = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    #logo {
        opacity: ${props => props.logopacity};
        -webkit-transition: opacity 0.3s;
        padding: 0;
        margin: 0;
    }
`;

const ConnectionStatus = styled.div`
    display: flex;
    flex-direction: row;
    width: 60%;
    justify-content: space-around;
    align-items: center;
`;


const PaiConnect = () => {

    const userInfoContext = useFirebaseUserInfo();
    const userConnectionInfo = userInfoContext.userInfo;
    
    const [paiUsername, setPaiUsername] = useState(userConnectionInfo?.pai_username ? userConnectionInfo.pai_username : '');
    const [paiPassword, setPaiPassword] = useState(userConnectionInfo?.pai_password ? userConnectionInfo.pai_username : '');
    const [toggleStatus, setToggleStatus] = useState(userConnectionInfo?.pai_active ? userConnectionInfo.pai_active : false);
    
    const [usernameFieldError, setUsernameFieldError] = useState('');
    const [passwordFieldError, setPasswordFieldError] = useState('');
    
    const db = getFirestore();
    const user = useFirebaseAuth();

    const [originalPaiUsername, setOriginalPaiUsername] = useState(paiUsername);
    const [originalPaiPassword, setOriginalPaiPassword] = useState(paiPassword);
    const [originalToggleStatus, setOriginalToggleStatus] = useState(toggleStatus);

    const somethingChanged = (
        (originalPaiUsername != paiUsername) ||
        (originalPaiPassword != paiPassword) ||
        (originalToggleStatus != toggleStatus)
    );

    useEffect(() => {
        console.log('loaded user info from context:', userConnectionInfo);
        console.log('context value= ', userInfoContext);
        setPaiUsername(userConnectionInfo?.pai_username ? userConnectionInfo.pai_username : '');
        setPaiPassword(userConnectionInfo?.pai_password ? userConnectionInfo.pai_username : '');
        setToggleStatus(userConnectionInfo?.pai_active ? userConnectionInfo.pai_active : false);
        return true;
    }, [])

    function buttonStatus() { 
        if (userInfoContext.pai_connected) {
            return true;
        }
        if (!(userInfoContext.pai_connected) && toggleStatus) {
            return false;
        } else {
            return undefined;
        }
    }

    function toggleConnection() {
        if (toggleStatus) {
            setUsernameFieldError('');
            setPasswordFieldError('');
        }
        setToggleStatus(!toggleStatus);
    }

    function savePaiChanges() {
        if ((paiUsername.length < 5) || (paiPassword.length < 5)) {
            if (paiUsername.length < 5) {
                setUsernameFieldError('please use a valid PAI username');
            } else {
                setUsernameFieldError('');
            }
            if (paiPassword.length < 5){
                setPasswordFieldError('please use a valid PAI password');
            } else {
                setPasswordFieldError('');
            }
            return false;
        }

        setUsernameFieldError('');
        setPasswordFieldError('');
        setOriginalPaiUsername(paiUsername);
        setOriginalPaiPassword(paiPassword);
        setOriginalToggleStatus(toggleStatus);
        
        const username = paiUsername;
        const password = paiPassword;
        //TODO: update connections document
        console.log('saving user PAI info: ', username, password);

        const connectionsRef = doc(db, 'connections', user.uid)

        setDoc(
            connectionsRef, 
            { pai_username: paiUsername, 
                pai_password: paiPassword, 
                pai_active: toggleStatus,
                user: user.email },
                { merge: true }
            ).then(() => {
                getDoc(connectionsRef).then((savedDoc) => {
                    userInfoContext.setUserInfo(savedDoc.data());
                    console.log('set user context to', savedDoc.data());
                })
            }
            );
        return true;
        
    }

    return (
        <StyledPaiConnect>
            <Form>
                <FormControlLabel 
                    id='toggle' 
                    onChange={() => toggleConnection()} 
                    control={
                        <Switch checked={toggleStatus} />
                    } 
                    label={toggleStatus ? 'Enabled' : 'Not Enabled'} />
                <StyledTextField 
                    disabled={!toggleStatus}
                    error={usernameFieldError !== ''} 
                    helperText={usernameFieldError} 
                    value={toggleStatus ? paiUsername : ''} 
                    onChange={e => setPaiUsername(e.target.value)} 
                    variant="outlined" 
                    color="primary" 
                    id="outlined-basic" 
                    label="PAI username" />
                <StyledTextField 
                    disabled={!toggleStatus}
                    value={toggleStatus ? paiPassword : ''} 
                    onChange={e => setPaiPassword(e.target.value)} 
                    error={passwordFieldError !== ''} 
                    helperText={passwordFieldError} 
                    variant="outlined" 
                    color="primary" 
                    id="outlined-basic" 
                    type='password' 
                    label="PAI password" />
                <StyledButton 
                    disabled={!somethingChanged}
                    color='blue' 
                    variant="outlined" 
                    onClick={() => savePaiChanges()}>
                        Save Changes
                </StyledButton>
            </Form>
            <ConnectionInfo logopacity={toggleStatus ? 1 : 0.5}>
                <Image 
                    src="/pai_logo.jpg" 
                    alt="PAI Logo" 
                    width={1024/4} 
                    height={512/4} 
                    id='logo'/>
                <ConnectionStatus>    
                    <h4 style={{opacity: toggleStatus ? 1 : 0.5}}>Connection Status</h4>
                    <CheckExMark value={buttonStatus()} />
                </ConnectionStatus>
            </ConnectionInfo>
        </StyledPaiConnect>
    )
}

export default PaiConnect
