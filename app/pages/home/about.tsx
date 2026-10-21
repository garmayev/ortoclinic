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
            <div style={{textAlign: "center", fontFamily: "Open Sans", marginBottom: 70}}>
                <img src="/images/orto_photo.png" style={{borderRadius: "var(--border-radius)", width: "calc(100vw - 20px)"}} />
                
                <p style={{paddingBottom: 20}}>Специализированный центр в Улан-Удэ, который фокусируется на лечении заболеваний опорно-двигательного аппарата и реабилитации.</p>
                <p style={{paddingBottom: 20}}><b>Основные направления деятельности</b> - безоперационное лечение последствий травм и заболеваний опорно-двигательного аппарата, реабилитация и неврология.</p>
                <p style={{paddingBottom: 20}}>Мы используем известные методы лечения:  ударно-волновая терапия, высокоинтенсивный лазер, электромиостимуляция и форезы с лекарственными препаратами, иглорефлексотерапия и мануальная терапия, лечение озоном и инновационные методы лечения, не имеющие аналогов во многих регионах России.</p>
            </div>
            <Button onClick={() => {
                navigate("/home", { viewTransition: true })
            }} style={{height: 55, borderRadius: 30, position: 'fixed', bottom: 20, margin: '0 5%', width: '86%'}}>Назад</Button>
        </>
    )
}