
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import styled from 'styled-components';


export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const MainBody = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;

`;

const BBox = styled(Box)`
    height: 100%;
    display: flex;
    flex-direction: row;
    position: relative;

`;

const MoneyIcon = styled(AttachMoneyIcon)`
    font-size: ${props => props.fontSize ? props.fontSize : '2rem'};
    position: absolute;
    bottom: 3px;
    padding: 0;
    margin: 0;
`;

const HiddenMoneyIcon = styled(AttachMoneyIcon)`
    font-size: ${props => props.fontSize ? props.fontSize : '2rem'};
    visibility: hidden;
    position: relative;
    bottom: 3px;
    padding: 0;
    margin: 0;
`;

const TheNumberItself = styled.p`
    font-size: ${props => props.fontSize ? props.fontSize : '2rem'};
    position: absolute;
    bottom: 0;
    padding: 0;
    margin: 0;
`;

/**
 * 
 * Component that can take in any float and print a nice MUI money component
 */
const MoneyStatement = (props) => {

    var moneySize = props.fontSize ? parseFloat(props.fontSize.split('r')[0])/2+'rem' : '1rem';

    return (
        <MainBody>
            <BBox>
                <HiddenMoneyIcon fontSize={ moneySize } />
                <MoneyIcon fontSize={ moneySize } />
            </BBox>
            <BBox>
                <TheNumberItself fontSize={ props.fontSize }>
                    {numberWithCommas(Math.round(props.amount * 100) / 100)}
                </TheNumberItself>
            </BBox>
        </MainBody>
    )
}

export default MoneyStatement
