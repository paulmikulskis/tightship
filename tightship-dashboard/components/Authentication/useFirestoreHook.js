
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

export const useFirestoreHook = () => {

    const db = getFirestore();
    connectFirestoreEmulator(db, 'localhost', 8080);
    
    return (
        <div>
            
        </div>
    )
}
