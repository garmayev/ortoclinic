import mainImage from "../../assets/main_1.png"
import {styled} from "styled-components";
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
    font-family: "Tilda Sans",sans-serif
`

const Image = styled.img`
    margin: 0 auto 0;
    width: 100%;
    height:100%;
`

export function Index() {
    const [policy, setPolicy] = useState(false)
    const [privacy, setPrivacy] = useState(false)
    const [_, setCheckingAuth] = useState(true)
    const [needRegistration, setNeedRegistration] = useState(false)
    const {setTheme, loader} = useAppContext()
    const {webApp, user, ready, checkUserExists, register} = useMessenger()
    const navigate = useNavigate();

    // Первичная настройка страницы
    useEffect(() => {
        loader.setLoaderPosition('center', 'center')
        loader.setShowLoader(true)
        loader.showFullscreenLoader("Загрузка");
        loader.setLoaderConfig({blur: false});
        setTheme('gradient')
    }, []);

    // Загрузка сохраненных согласий
    useEffect(() => {
        const savedPrivacy = localStorage.getItem("privacy") ?? "false"
        const savedPolicy = localStorage.getItem("policy") ?? "false"
        setPrivacy(savedPrivacy === "true")
        setPolicy(savedPolicy === "true")
    }, []);

    // Проверка авторизации и существования пользователя
    useEffect(() => {
        loader.setShowLoader(true)
        const checkAuth = async () => {
            console.log("[welcome checkAuth]");
            // 1. Проверяем токен в localStorage
            const token = localStorage.getItem("token")
            if (token) {
                console.log("[welcome checkAuth]", "token isset");
                loader.setShowLoader(false)
                navigate("/home")
            }

            // 2. Если есть данные мессенджера, проверяем существование пользователя
            if (ready && user?.id) {
                const exists = await checkUserExists()

                if (exists) {
                    console.log("[welcome checkAuth]", "user exist");
                    // Пользователь найден, токен сохранен в checkUserExists
                    navigate("/home")
                } else {
                    console.log("[welcome checkAuth]", "user missing");
                    // Пользователь не найден - нужна регистрация
                    setCheckingAuth(false)
                }
            } else {
                console.log("[welcome checkAuth]", "user not ready");
                setNeedRegistration(true)
                loader.setShowLoader(false)
            }

            setCheckingAuth(false)
            loader.setShowLoader(false)
        }
        setTimeout(() => {
            loader.setLoaderConfig({blur: false})
            checkAuth()
                .finally(() => {
                    console.log("[welcome checkAuth]", "finally");
                    loader.setShowLoader(false)
                })
        }, 3000)
    }, [ready, user]);

    // Проверка валидности согласий
    const isAgreementsValid = policy && privacy

    // Запрос номера телефона (только если нужно и доступно)
    const requestPhoneNumber = () => {
        webApp.requestContact().then((result) => {
            register(result?.phone)
                .then(response => {
                    if (response.success) {
                        navigate("/home")
                    }
                })
        })
    }

    return (
        <Content $justifyContent={"flex-start"} style={{overflow: "hidden"}}>
            <Image src={mainImage} alt={"Medix"}/>

            {needRegistration &&
                <Popup title={"Запуская приложение вы даете согласие на обработку персональных данных"}>
                    <Checkbox
                        checked={policy}
                        onChange={(event) => setPolicy(event.target.checked)}
                        label={<p style={{color: "black", textAlign: "left"}}>Ознакомлен с политикой <a href="/policy.pdf">персональных данных</a></p>}
                    />
                    <Checkbox
                        checked={privacy}
                        onChange={(event) => setPrivacy(event.target.checked)}
                        label={<p style={{color: "black", textAlign: "left"}}>Согласен на обработку <a href="/privacy.pdf">персональных данных</a></p>}
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