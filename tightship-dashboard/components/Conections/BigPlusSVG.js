


const BigPlusSVG = (props) => {
    return (
        <div style={{
            width: props.SVGWidth,
        }}>
            <svg fill={props.fill ? props.fill : "#777777"} version="1.1" x="0px" y="0px" viewBox="0 0 455 455">
                <polygon points="455,212.5 242.5,212.5 242.5,0 212.5,0 212.5,212.5 0,212.5 0,242.5 212.5,242.5 212.5,455 242.5,455 242.5,242.5 455,242.5 "/>
            </svg>
        </div>
    )
}




export default BigPlusSVG
