import Appointment from "~/classes/Appointment";
import {useEffect, useState} from "react";
import {useAppContext} from "~/hooks/AppContext";
import VisitCard from "~/components/VisitCard";
import styled from "styled-components";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 90%;
    position: relative;
    margin-bottom: 10vw;
    padding: 1rem;
    background: rgba(255, 255, 255, .7);
    border-radius: var(--border-radius);
`

const VisitContainer = ({visit, children}: { visit: Appointment | undefined, children: React.ReactNode }) => {
    return (
        <Container className={'visit-container'}>
            <VisitCard $visit={visit} $useClientInfo={false}>
                {children}
            </VisitCard>
        </Container>
    )
}

const History = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const {setTheme, setTitle, setBarVisible, setUseOpacity} = useAppContext()

    useEffect(() => {
        console.log(appointments)
    }, [appointments]);
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