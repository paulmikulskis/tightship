import { useState } from 'react';
import Card from '@mui/material/Card';


const RaiseableCard = (props) => {

    const [raised, setRaised] = useState(false);

    return (
        <Card
            style={{
                width: '100%',
                height: '100%',
                margin: '1rem',
                padding: '0rem 1rem',
                display: 'flex',
                'border-radius': '15px',
                'flex-direction': 'column',
                'align-items': 'center',
                'justify-content': 'center',
            }}
            onMouseOver={()=>setRaised(true)} 
            onMouseOut={()=>setRaised(false)} 
            raised={raised}
        >
            {props.children}
        </Card>
    )
}




export default RaiseableCard
