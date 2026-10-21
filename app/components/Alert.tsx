import {styled} from "styled-components";
import {useAppContext} from "~/hooks/AppContext";
import {useEffect} from "react";

const Container = styled.div`
    position: fixed;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, .4);
    z-index: 1002;
    display: flex;
    justify-content: center;
    align-items: center;
`

const Message = styled.div`
    background: white;
    border-radius: var(--border-radius);
    padding: 20px;
    width: 60vw;
    text-align: center;
    box-shadow: 0 0 15px rgba(0, 0, 0, .3);
`

interface AlertProps {
    $message: string
    $delay?: number
}

const Alert = ({$message, $delay}: AlertProps) => {
    const {setBarVisible} = useAppContext()
    useEffect(() => {
        setBarVisible(false)
    }, []);
    setTimeout(() => {
        return (<></>)
    }, $delay ?? 3000)
    return (
        <Container>
            <Message>{$message}</Message>
        </Container>
    )
}

export default Alert;