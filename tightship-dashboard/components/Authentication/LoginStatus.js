import { useFirebaseAuth } from "./FirebaseAuthProvider";


const LoginStatus = () => {
    const user = useFirebaseAuth()

    return (
        <div>
            <UserName />
            <UserEmail />
        </div>
    )
}

function UserName() {
    const user = useFirebaseAuth();
    return <div>{user ? 'logged in' : "unauthenticated"}</div>;
  }
  
function UserEmail() {
    const user = useFirebaseAuth();
    return <div>{user?.email || ""}</div>;
  }

export default LoginStatus
