import { useState } from 'react'
import styled from 'styled-components';
import { doc, getDoc, setDoc, collection, addDoc, getFirestore } from "firebase/firestore"; 
import { GoogleAuthProvider, getAuth, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { useRouter } from 'next/router'


const InputBox = styled.input`
`;

const FormItem = styled.div`
    padding: 0.75rem 0.1rem;
    width: 100%;
    button {
        width: 100%;
        height: 2.75rem;
    }

    input {
        width: 100%;
        height: 2.75rem;
    }

    p {
        width: 100%;
        text-align: center;
    }
`;

const SignUpForm = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 10%;
`;

const SignUpContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;


const SignUp = () => {

    const auth = getAuth();
    auth.languageCode = 'en';
    const router = useRouter();
    const db = getFirestore();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();

    const createAccount = (email, password) => {
        console.log(`attempting to create account with email: ${email}, password: ${password}`);
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log(`successful Email/Password account creation email=${email}, password=${password}`);
                setDoc(doc(db, "accounts", user.uid), {
                    name: user.displayName, email: user.email, emailVerified: user.emailVerified,
                    photoURL: user.photoURL, phone: user.phoneNumber }).then(() => router.replace('/app'));
            })
            .catch((error) => {
                console.log('error on function createAccount() for Email/Password login', error);
                const errorCode = error.code;
                const errorMessage = error.message;

                router.replace('/signup')
                // ..
            });
    }

    return (
        <div>
            <SignUpContainer>
                <SignUpForm>
                    <FormItem><p>Create Account</p></FormItem>
                    <FormItem><InputBox id='create_email' type="text" placeholder="Email" onChange={e => setEmail(e.target.value)}/></FormItem>
                    <FormItem><InputBox id='create_password' type="text" placeholder="Password" onChange={e => setPassword(e.target.value)}/></FormItem>
                    <FormItem><button onClick={() => createAccount(email, password)}>Create Account</button></FormItem>
                    <FormItem><button type="button" onClick={() => router.push('/')}>
                        Back to home</button>
                        </FormItem>
                </SignUpForm>
            </SignUpContainer>
        </div>
    )
}

export default SignUp
