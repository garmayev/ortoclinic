import {useNavigate} from "react-router";
import {useAppContext} from "~/hooks/AppContext";
import {useEffect, useRef, useState} from "react";
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
        const [company, appointment] = await Promise.all([
            Company.get(company_id),
            Appointment.last(),
        ]);
        localStorage.setItem('company_id', String(company.id))
        localStorage.setItem('defaultCategory', String(company.default_category_id))
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
    const [cancelling, setCancelling] = useState(false)
    const cancellationPending = useRef(false)
    const pageGeneration = useRef(0)
    const navigate = useNavigate()

    const cancelAppointment = async () => {
        if (appointment?.id === undefined || cancellationPending.current) return;
        const generation = pageGeneration.current;
        cancellationPending.current = true;
        setCancelling(true);
        setLoadError("");
        let cancelled = false;
        try {
            const result = await Appointment.cancel(appointment.id);
            if (generation !== pageGeneration.current || !result) return;
            cancelled = true;
            setAppointment(undefined);
            const nextAppointment = await Appointment.last();
            if (generation === pageGeneration.current) setAppointment(nextAppointment);
        } catch {
            if (generation === pageGeneration.current) {
                setLoadError(cancelled
                    ? "Запись отменена, но не удалось обновить последнюю запись. Повторите загрузку."
                    : "Не удалось отменить запись. Проверьте соединение и повторите попытку.");
            }
        } finally {
            if (generation === pageGeneration.current) {
                cancellationPending.current = false;
                setCancelling(false);
            }
        }
    };

    useEffect(() => {
        if (!ready || !isRegistered) return;
        pageGeneration.current++;
        cancellationPending.current = false;
        setCancelling(false);
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
            setAppointment(result.appointment)
        }).catch(() => {
            if (active) setLoadError("Не удалось загрузить данные клиники. Проверьте соединение и повторите попытку.");
        }).finally(() => {
            if (active) loader.hideLoader();
        });
        return () => { active = false; pageGeneration.current++; loader.hideLoader(); };
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
                            <Button $variant={"primary"} disabled={cancelling} onClick={cancelAppointment}>Отменить</Button>
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
