import {useNavigate} from "react-router";
import {useAppContext} from "~/hooks/AppContext";
import {useEffect, useState} from "react";
import {styled} from "styled-components";
import Appointment from "~/classes/Appointment";
import Button from "~/components/Button";
import VisitCard from "~/components/VisitCard";
import Company from "~/classes/Company";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";
import {Card, GridContainer} from "~/components/Card";
import {useMessenger} from "~/hooks/MessengerContext";
import {NavLink} from "react-router";
import arrow from "~/assets/arrow.svg";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 90%;
    position: relative;
    margin: 0 auto 10vw;
    font-family: "Open Sans";
`

const VisitContainer = ({visit, children}: { visit: Appointment | undefined, children: React.ReactNode }) => {
    return (
        <Container className={'visit-container'}>
            <VisitCard $visit={visit} $useClientInfo={!!visit?.client}>
                {children}
            </VisitCard>
            <VisitBackground className={'visit-background'}/>
        </Container>
    )
}

const VisitBackground = styled.div`
    position: absolute;
    left: -33vw;
    bottom: -10vw;
    border-radius: 50%;
    background: rgba(255, 255, 255, .7);
    min-height: 150vw;
    width: 150vw;
    content: " ";
`

const HomeComponent = () => {
    async function clientLoader() {
        const company_id = import.meta.env.VITE_COMPANY_ID;
        const company = await Company.get(company_id); // теперь это уже данные, а не Response
        localStorage.setItem('company_id', String(company.id))
        localStorage.setItem('defaultCategory', String(company.default_category_id))
        const appointment = await Appointment.last();
        return {
            appointment: appointment,
            company: company
        }
    }

    const {user, ready, isRegistered } = useMessenger()
    const {setTheme, setBarVisible, setTitle, setUseOpacity, loader} = useAppContext()
    const [appointment, setAppointment] = useState<Appointment>()
    const [company, setCompany] = useState<Company>()
    const [loadError, setLoadError] = useState("")
    const [attempt, setAttempt] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        if (!ready || !isRegistered) return;
        setTheme('static')
        setUseOpacity(false)
        setBarVisible(true)
        let active = true;
        setLoadError("");
        setTitle("");
        loader.showFullscreenLoader();
        clientLoader().then(result => {
            if (!active) return;
            if (result.company) {
                    setCompany(result.company);
            }
            if (result.appointment) {
                setAppointment(result.appointment)
            }
        }).catch(() => {
            if (active) setLoadError("Не удалось загрузить данные клиники. Проверьте соединение и повторите попытку.");
        }).finally(() => {
            if (active) loader.hideLoader();
        });
        return () => { active = false; loader.hideLoader(); };
    }, [ready, user, isRegistered, attempt]);

    return (
        <>
            {loadError && <div role="alert"><p>{loadError}</p><Button $variant="secondary" onClick={() => setAttempt(value => value + 1)}>Повторить</Button></div>}
            <VisitContainer visit={appointment}>
                <div style={{margin: "0 auto", width: "80%"}}>
                    {appointment ?
                        <>
                            <Button $variant={"secondary"} disabled={false} onClick={() => {
                                navigate("/create")
                            }}>Записаться</Button>
                            <Button $variant={"primary"} disabled={false} onClick={() => {
                                // @ts-ignore
                                Appointment.cancel(Number(appointment?.id))
                                    .then((result) => {
                                        if (result) {
                                            setAppointment(undefined);
                                        }
                                    })
//                                window.location.reload();
                            }}>Отменить</Button>
                        </>
                        : <>
                            <Button $variant={"secondary"} disabled={false} onClick={() => {
                                navigate("/create")
                            }} style={{height: 60, borderRadius: 30}}>Записаться на прием</Button>
                        </>
                    }
                </div>
            </VisitContainer>
            <GridContainer style={{marginTop: "20px"}}>
                <Card to={"/home/promo"} className={"single"} $line={3}>
                    <h2 style={{textAlign: "center"}}>Акции</h2>
                    <span className={'icon'}>
                        <img src={arrow} style={{transform: "rotate(290deg)"}} />
                    </span>
                    <p style={{fontFamily: 'Open Sans', fontWeight: 400}}>Акции, проводимые в компании</p>
                </Card>
                <Card to={"/home/about"} className={"single"} $line={3}>
                    <h2 style={{textAlign: "center"}}>О нас</h2>
                    <span className={'icon'}>
                        <img src={arrow} style={{transform: "rotate(290deg)"}} />
                    </span>
                    <p style={{fontFamily: 'Open Sans', fontWeight: 400}}>Информация о клинике</p>
                </Card>
                <Card to={"/home/services"} className={"row"} viewTransition $line={3}>
                    <h2 style={{textAlign: "center"}}>Услуги</h2>
                    <span className={'icon'}>
                        <img src={arrow} style={{transform: "rotate(290deg)"}} />
                    </span>
                    <p style={{fontFamily: 'Open Sans', fontWeight: 400}}>Выберите интересующую услугу из списка или запишитесь на консультацию</p>
                </Card>
                <p></p>
            </GridContainer>
            <NavLink target={"_blank"} style={{textAlign: "center", fontFamily: "TildaSansLight", fontSize: "27px", color: "white", textDecoration: "none", display: "block", margin: "15px auto"}} to={"https://medix.amgs.online/uploads/company_policy.pdf"}>Правовая информация</NavLink>
        </>
    )
}

export default HomeComponent
