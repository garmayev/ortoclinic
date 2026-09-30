import mainImage from "../../assets/main.png"
import styled from "styled-components";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {useAppContext} from "~/hooks/AppContext";
import Popup from "~/components/Popup";
import {Checkbox} from "~/components/Checkbox";
import Button from "~/components/Button";
import {useMessenger} from "~/hooks/MessengerContext";

const Content = styled.div<{ $justifyContent: string }>`
    display: flex;
    flex-direction: column;
    justify-content: ${props => props.$justifyContent};
`

const Image = styled.img`
    min-width: 250px;
    max-width: 40vw;
    margin: 0 auto 0;
`

const Title = styled.h3`
    text-align: center;
    color: white;
    font-size: 50px;
    font-weight: 400;
`

export function Index() {
    const [policy, setPolicy] = useState(false)
    const [privacy, setPrivacy] = useState(false)
    const [_, setCheckingAuth] = useState(true)
    const [needRegistration, setNeedRegistration] = useState(false)
    const {setTheme, loader} = useAppContext()
    const {webApp, user, ready, isRegistered, checkUserExists, register} = useMessenger()
    const navigate = useNavigate();

    // Первичная настройка страницы
    useEffect(() => {
        loader.setLoaderPosition('center', 'bottom')
        loader.setShowLoader(true)
        loader.showFullscreenLoader("Загрузка");
        setTheme('gradient')
    }, []);

    // Загрузка сохраненных согласий
    useEffect(() => {
        const savedPrivacy = localStorage.getItem("privacy")
        const savedPolicy = localStorage.getItem("policy")
        setPrivacy(savedPrivacy === "true")
        setPolicy(savedPolicy === "true")
    }, []);

    // Проверка авторизации и существования пользователя
    useEffect(() => {
        const checkAuth = async () => {
            // 1. Проверяем токен в localStorage
            const token = localStorage.getItem("token")
            if (token) {
                console.log("token isset")
                loader.setShowLoader(false)
                navigate("/home")
                return
            }

            console.log(ready, user)
            // 2. Если есть данные мессенджера, проверяем существование пользователя
            if (ready && user?.id) {
                const exists = await checkUserExists()

                if (exists) {
                    // Пользователь найден, токен сохранен в checkUserExists
                    loader.setShowLoader(false)
                    navigate("/home")
                    return
                } else {
                    // Пользователь не найден - нужна регистрация
                    setNeedRegistration(true)
                }
            } else {
                setNeedRegistration(true)
            }

            setCheckingAuth(false)
            loader.setShowLoader(false)
        }

        checkAuth()
    }, [ready, user]);

    // Проверка валидности согласий
    const isAgreementsValid = policy && privacy

    // Запрос номера телефона (только если нужно и доступно)
    const requestPhoneNumber = () => {
        console.log(webApp)
        register(user?.phone)
            .then(response => {
                console.log(response)
            })
    }

    // Если уже зарегистрирован (на всякий случай)
    if (isRegistered) {
        navigate("/home")
        return null
    }

    return (
        <Content $justifyContent={"flex-start"} style={{overflow: "hidden"}}>
            <Title>Добро<br/>пожаловать</Title>
            <Image src={mainImage} alt={"Medix"}/>

            {needRegistration &&
                <Popup title={"Соглашения"}>
                    <Checkbox
                        checked={policy}
                        onChange={(event) => setPolicy(event.target.checked)}
                        label={<p style={{color: "black", textAlign: "left"}}>Пользовательское соглашение</p>}
                    />
                    <Checkbox
                        checked={privacy}
                        onChange={(event) => setPrivacy(event.target.checked)}
                        label={<p style={{color: "black", textAlign: "left"}}>Согласие на обработку персональных данных</p>}
                    />
                    <Button
                        style={{width: "100%"}}
                        $disabled={!isAgreementsValid}
                        onClick={requestPhoneNumber}
                    >
                        Продолжить
                    </Button>
                </Popup>
            }
        </Content>
    );
}

export default Index