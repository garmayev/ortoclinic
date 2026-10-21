import Appointment from "~/classes/Appointment";
import { useEffect, useState } from "react";
import { useAppContext } from "~/hooks/AppContext";
import { useNavigate } from "react-router";
import VisitCard from "~/components/VisitCard";
import {styled} from "styled-components";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 90%;
    position: relative;
    margin-bottom: 3vw;
    padding: 1rem;
    background: rgba(255, 255, 255, .7);
    border-radius: var(--border-radius);
`

const VisitContainer = ({visit, children}: { visit: Appointment | undefined, children: React.ReactNode }) => {
    const navigate = useNavigate();
    const handleClick = (appointment: Appointment) => {
        localStorage.setItem("selected_category", visit.services[0].category_id);
        localStorage.setItem("selected_service", visit.services[0].id);
        navigate("/create");
    }
    return (
        <Container className={'visit-container'}>
            <VisitCard $visit={visit} $useClientInfo={false} $useReply={true} $replyClick={(event) => { handleClick(visit); }}>
                {children}
            </VisitCard>
        </Container>
    )
}

const History = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const {setTheme, setTitle, setBarVisible, setUseOpacity} = useAppContext()

    useEffect(() => {
        setTheme('static')
        setTitle("История записей");
        setBarVisible(true)
        setUseOpacity(true)
        clientLoader().then(result => {
            setAppointments(result.appointments)
        })
    }, []);

    return (
        <div>
            {appointments.map((appointment: Appointment) => (
                <VisitContainer key={`appointment-${appointment.id}`} visit={appointment}><></></VisitContainer>
            ))}
        </div>
    );
};

export async function clientLoader() {
    return {appointments: await Appointment.getAll()};
}

export default History;