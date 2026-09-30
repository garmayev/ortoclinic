import Button from "~/components/Button";
import {useNavigate} from "react-router";
import {useAppContext} from "~/hooks/AppContext";
import {useEffect} from "react";


export default () => {
    const navigate = useNavigate()
    const {setTheme, setTitle, setUseOpacity, setBarVisible} = useAppContext()
    useEffect(() => {
        setTitle("Акции")
        setTheme('static');
        setUseOpacity(true)
        setBarVisible(false)
    }, []);
    return (
        <>
            <Button onClick={() => {navigate("/home", { viewTransition: true })}}>Назад</Button>
        </>
    )
}