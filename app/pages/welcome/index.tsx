import {createLegalConsent} from "../../legalConsentStorage.js";
import mainImage from "../../assets/generated/main_1.webp"
import mainAvif from "../../assets/generated/main_1.avif"
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
    const [registrationError, setRegistrationError] = useState("")
    const [registering, setRegistering] = useState(false)
    const {setTheme, loader} = useAppContext()
    const {webApp, user, ready, checkUserExists, register} = useMessenger()
    const navigate = useNavigate();
    const consent = createLegalConsent(1, user?.id);
    const [legalAccepted, setLegalAccepted] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);

    // Первичная настройка страницы
    useEffect(() => {
        loader.setLoaderPosition('center', 'center')
        loader.setShowLoader(true)
        loader.showFullscreenLoader("Загрузка");
        loader.setLoaderConfig({blur: false});
        setTheme('gradient')
    }, []);

    useEffect(() => {
        const accepted = consent.accepted();
        setPolicy(accepted);
        setPrivacy(accepted);
        setLegalAccepted(accepted);
    }, [user?.id]);

    // Проверка авторизации и существования пользователя
    useEffect(() => {
        if (!ready) return;
        let active = true;
        loader.setShowLoader(true)
        const checkAuth = async () => {
            console.log("[welcome checkAuth]");
            // 1. Проверяем токен в localStorage
            // Проверяем принадлежность клиента клинике даже при сохранённом токене.
            // Старые регистрации могли создать аккаунт без user_company.

            // 2. Если есть данные мессенджера, проверяем существование пользователя
            if (ready && user?.id) {
                const exists = await checkUserExists()
                if (!active) return;

                setAuthenticated(exists);
                if (exists && consent.accepted()) {
                    console.log("[welcome checkAuth]", "user exist");
                    // Пользователь найден, токен сохранен в checkUserExists
                    navigate("/home")
                } else {
                    setNeedRegistration(true)
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
        loader.setLoaderConfig({blur: false})
        checkAuth()
                .catch(() => {
                    if (active) setCheckingAuth(false);
                })
                .finally(() => {
                    if (active) loader.setShowLoader(false)
                })
        return () => { active = false; };
    }, [ready, user]);

    // Проверка валидности согласий
    const isAgreementsValid = policy && privacy

    // Запрос номера телефона (только если нужно и доступно)
    const requestPhoneNumber = async () => {
        if (registering || !isAgreementsValid) return;
        setRegistrationError("");
        setRegistering(true);
        try {
            if (!consent.save(policy, privacy)) throw new Error("Не удалось сохранить согласия. Проверьте доступ к хранилищу приложения.");
            setLegalAccepted(true);
            if (authenticated) { navigate("/home"); return; }
            if (!webApp?.requestContact) throw new Error("Откройте приложение внутри MAX и повторите попытку.");
            const result = await webApp.requestContact();
            const phone = result?.phone ?? result?.phone_number ?? result?.responseUnsafe?.contact?.phone_number;
            if (!phone) throw new Error("Чтобы продолжить, разрешите MAX передать номер телефона.");
            const response = await register(phone);
            if (response.success) navigate("/home");
            else setRegistrationError("Не удалось войти. Попробуйте ещё раз.");
        } catch (error) {
            setRegistrationError(error instanceof Error ? error.message : "Не удалось получить номер телефона. Попробуйте ещё раз.");
        } finally {
            setRegistering(false);
        }
    }

    return (
        <Content $justifyContent={"flex-start"} style={{overflow: "hidden"}}>
            <picture><source srcSet={mainAvif} type="image/avif"/><Image src={mainImage} alt={"Medix"} fetchPriority="high"/></picture>

            {needRegistration &&
                <Popup title={legalAccepted ? "Поделитесь номером телефона, чтобы войти" : "Запуская приложение вы даете согласие на обработку персональных данных"}>
                    {!legalAccepted && <>
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
                    </>}
                    <Button
                        style={{width: "100%"}}
                        disabled={!isAgreementsValid || registering}
                        $disabled={!isAgreementsValid || registering}
                        onClick={requestPhoneNumber}
                    >
                        {registering ? "Проверяем…" : "Отправить"}
                    </Button>
                    {registrationError && <p role="alert">{registrationError}</p>}
                </Popup>
            }
        </Content>
    );
}

export default Index
