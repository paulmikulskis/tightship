import { useState } from 'react';
import Card from '@mui/material/Card';


const RaiseableCard = (props) => {

    const [raised, setRaised] = useState(false);
    const sxOverrides = props.sx ? props.sx : {}
    return (
        <Card
            sx={{
                width: '100%',
                height: '100%',
                margin: props.margin ? props.margin : '1rem',
                padding: '0rem 1rem',
                display: 'flex',
                borderRadius: '15px',
                flexDirection: 'column',
                justifyContent: 'center',
                ...sxOverrides
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
