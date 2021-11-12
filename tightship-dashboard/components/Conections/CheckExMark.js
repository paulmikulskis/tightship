
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SensorsOffIcon from '@mui/icons-material/SensorsOff';

const CheckExMark = (props) => {
    if (props.value === true) {
        return <CheckCircleIcon color="primary"/>
    } else if (props.value === false) {
        return <CancelIcon color="red"/>
    } else {
        return <SensorsOffIcon color="disabled"/>
    }
}




export default CheckExMark
