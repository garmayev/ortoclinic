import {useNavigate} from "react-router";
import {useAppContext} from "~/hooks/AppContext";
import {useEffect, useState} from "react";
import styled from "styled-components";
import Appointment from "~/classes/Appointment";
import Button from "~/components/Button";
import VisitCard from "~/components/VisitCard";
import Company from "~/classes/Company";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";
import {Card, GridContainer} from "~/components/Card";
import {useMessenger} from "~/hooks/MessengerContext";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 90%;
    position: relative;
    margin-bottom: 10vw;
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
    left: -34vw;
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

    const {user, ready} = useMessenger()
    const {setTheme, setBarVisible, setTitle, setUseOpacity, loader} = useAppContext()
    const [appointment, setAppointment] = useState<Appointment>()
    const [company, setCompany] = useState<Company>()
    const navigate = useNavigate()

    useEffect(() => {
        setTheme('static')
        setUseOpacity(false)
        setBarVisible(true)
        clientLoader().then(result => {
            console.log(result)
            if (result.company) {
                setCompany(result.company);
            }
            if (result.appointment) {
                setAppointment(result.appointment)
            }
        })
    }, [user]);
    useEffect(() => {
        setTitle("")
        loader.showFullscreenLoader()
        loader.setShowLoader(true);
        console.log(company)
        console.log(ready)
        if (company && ready) {
            loader.setShowLoader(false)
        }
    }, [ready, company]);

    return (
        <>
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
                            }}>Записаться</Button>
                        </>
                    }
                </div>
            </VisitContainer>
            <GridContainer style={{marginTop: "20px"}}>
                <Card to={"/home/promo"} className={"single"} viewTransition>
                    <h2 style={{textAlign: "center"}}>Акции</h2>
                    <span className={'icon'}>
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare}/>
                    </span>
                    <p>Акции, проводимые в компании</p>
                </Card>
                <Card to={"/home/about"} className={"single"} viewTransition>
                    <h2 style={{textAlign: "center"}}>О нас</h2>
                    <span className={'icon'}>
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare}/>
                    </span>
                    <p>Информация о клинике</p>
                </Card>
                <Card to={"/home/services"} className={"row"} viewTransition>
                    <h2 style={{textAlign: "center"}}>Услуги</h2>
                    <span className={'icon'}>
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare}/>
                    </span>
                    <p>Выберите интересующую услугу из списка или запишитесь на консультацию</p>
                </Card>
            </GridContainer>
        </>
    )
}

export default HomeComponent
