import styled from "styled-components";

const PopupContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
`

const PopupContent = styled.div`
    z-index: 99;
    min-height: 200px;
    max-width: 70vw;
    background: white;
    padding: 20px;
    margin: 20px;
    text-align: center;
    border-radius: var(--border-radius);
`

const Popup = ({title, children, onClick}: {title: string, children?: React.ReactNode, onClick?: () => void}) => {
    return (
        <PopupContainer>
            <PopupContent>
                <div>{title}</div>
                <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%"}}>{children}</div>
            </PopupContent>
        </PopupContainer>
    )
}

export default Popup