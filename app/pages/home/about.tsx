import Button from "~/components/Button";
import {useNavigate} from "react-router";
import {useAppContext} from "~/hooks/AppContext";
import {useEffect} from "react";


export default () => {
    const navigate = useNavigate()
    const {setTheme, setUseOpacity, setTitle, setBarVisible} = useAppContext()

    useEffect(() => {
        setUseOpacity(true);
        setTitle("О компании");
        setTheme('static');
        setBarVisible(false);
    }, []);

    return (
        <>
            <Button onClick={() => {
                navigate("/home", { viewTransition: true })
            }}>Button</Button>
        </>
    )
}