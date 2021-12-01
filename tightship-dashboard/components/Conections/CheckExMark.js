
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SensorsOffIcon from '@mui/icons-material/SensorsOff';
import SyncIcon from '@mui/icons-material/Sync';

const CheckExMark = (props) => {
    if (props.value === 'connected') {
        return <CheckCircleIcon color="primary"/>
    } else if (props.value === 'disconnected') {
        return <CancelIcon color="red"/>
    } else if (props.value === 'processing') {
        return <SyncIcon color="blue"/>
    } else {
        return <SensorsOffIcon color="disabled"/>
    }
}




export default CheckExMark
