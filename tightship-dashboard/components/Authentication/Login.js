import { useState } from 'react'
import styled from 'styled-components';
import { collection, doc, getDoc, addDoc, setDoc, getFirestore } from "firebase/firestore"; 
import { GoogleAuthProvider, getAuth, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { useFirebaseAuth } from "./FirebaseAuthProvider";
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

const LoginForm = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;


const Login = () => {

    const [email, setUsername] = useState();
    const [password, setPassword] = useState();
    const [loginError, setLoginError] = useState();

    const db = getFirestore();
    const router = useRouter();

    const provider = new GoogleAuthProvider().setCustomParameters({
        'login_hint': 'user@example.com'
      });

    const auth = getAuth();
    const user = useFirebaseAuth();
    auth.languageCode = 'en';

    const signInWithGoogle = () => {
        signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;

            const docRef = doc(db, "accounts", user.uid);
            getDoc(docRef).then(docSnap => {
                if (docSnap.exists()) {
                    console.log(`successful Google sign-in, name=${user.displayName}, email=${user.email}, uid=${user.uid}`);
                    router.replace('/app')
                    console.log("Document data:", docSnap.data());
                  } else {
                    // doc.data() will be undefined in this case
                    console.log("No such user document, creating user in Firestore");
                    setDoc(doc(db, "accounts", user.uid), {
                        name: user.displayName, email: user.email, emailVerified: user.emailVerified,
                        photoURL: user.photoURL, phone: user.phoneNumber }).then(() => router.replace('/app'));
                  }
            })

            //check if user exists in firestore, 
                //if not, ask if they want to create an account, if yes, create user, if not, return to home
                //if yes, update signin status on user document and update signin time

        }).catch((error) => {
            console.log('error on function signInWithGoogle() for Google Auth', error);
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
            router.replace('/')
        });
    }

    const signInWithUsername = (email, password) => {
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log(`successful Email/Password sign-in, email=${email}, password=${password}`);
            const user = userCredential.user;
            const docRef = doc(db, "accounts", user.uid);
            getDoc(docRef).then(docSnap => {
                if (docSnap.exists()) {
                    console.log(`successful username/password sign-in, email=${user.email}, uid=${user.uid}`);
                    router.replace('/app')
                    console.log("Document data:", docSnap.data());
                  } else {
                    // doc.data() will be undefined in this case
                    console.log("No such user document for this email/password combo");
                    router.push('/login');
                  }
            })
            router.push('/app')
            
        })
        .catch((error) => {
            console.log('error on function signInWithUsername() for Email/Password login');
            const errorCode = error.code;
            const errorMessage = error.message;
            setLoginError(errorMessage);

        });
    }
    if (loginError) {
        return (        
            <LoginForm>
                <FormItem>
                    <button onClick={signInWithGoogle}>Sign in with boogle</button> 
                </FormItem>
                <FormItem>
                    <p>or</p>
                </FormItem>
                <FormItem>
                    <InputBox id='email' type="text" placeholder="Email" onChange={e => setUsername(e.target.value)} />
                </FormItem>
                <FormItem>
                    <InputBox id='password' type="text" placeholder="Password" onChange={e => setPassword(e.target.value)}/>
                </FormItem>
                <FormItem>
                    <button onClick={() => signInWithUsername(email, password)}>Sign in</button>
                </FormItem>
                <FormItem>
                <button type="button" onClick={() => router.push('/signup')}>
                    Sign Up
                    </button>
                </FormItem>
                <FormItem>
                    <p style={{color: 'red'}}>Error: {loginError}</p>
                </FormItem>
                <hr style={{height: '5px', color: 'black', width: '100%'}}/>
                <FormItem>
                <button type="button" onClick={() => router.push('/')}>
                    Goto HOME
                    </button>
                </FormItem>
            </LoginForm>);
    }

    if (!user) {
        return (        
        <LoginForm>
            <FormItem>
                <button onClick={signInWithGoogle}>Sign in with boogle</button> 
            </FormItem>
            <FormItem>
                <p>or</p>
            </FormItem>
            <FormItem>
                <InputBox id='email' type="text" placeholder="Email" onChange={e => setUsername(e.target.value)} />
            </FormItem>
            <FormItem>
                <InputBox id='password' type="text" placeholder="Password" onChange={e => setPassword(e.target.value)}/>
            </FormItem>
            <FormItem>
                <button onClick={() => signInWithUsername(email, password)}>Sign in</button>
            </FormItem>
            <FormItem>
            <button type="button" onClick={() => router.push('/signup')}>
                Sign Up
                </button>
            </FormItem>
            <hr style={{height: '5px', color: 'black', width: '100%'}}/>
            <FormItem>
            <button type="button" onClick={() => router.push('/')}>
                Goto HOME
                </button>
            </FormItem>
        </LoginForm>);
    } else {
        return <div></div>
    }

}

export default Login
