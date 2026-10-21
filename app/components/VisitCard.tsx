import Appointment from "~/classes/Appointment";
import Client from "~/classes/Client";
import {useEffect, useState} from "react";
import Service from "~/classes/Service";
import {styled} from "styled-components";
import taskList from "~/assets/task-list.png";
import calendar from "~/assets/calendar.png";
import clock from "~/assets/clock.png";
import arrow from "~/assets/arrow.png";
import {Helper} from "~/constant/Helper";
import type Category from "~/classes/Category";
import {useMessenger} from "~/hooks/MessengerContext";
import Button from "~/components/Button";

type AvatarSizeType = "small" | "large";

interface VisitProps {
    $visit: Appointment|undefined;
    $useClientInfo: boolean;
    $useReply: boolean;
    $replyClick?: () => void;
    children: React.ReactNode;
}

interface ClientProps {
    $client?: Client;
    $avatarSize?: AvatarSizeType;
}

interface DetailsProps {
    $services: Service[]|Category[]|undefined;
    $date?: Date;
    $time?: string;
}

const VisitCard = ({$visit, $useClientInfo, $useReply = false, $replyClick, children}: VisitProps) => {
    const [isEmpty, setIsEmpty] = useState<boolean>()
    const [date, setDate] = useState<Date>(new Date())
    const {user} = useMessenger()
    const [client, setClient] = useState<Client>()
    useEffect(() => {
        if ($visit) {
            console.log('[VisitCard]', $visit);
            setIsEmpty(false)
            setClient($visit.client)
        } else {
            setIsEmpty(true)
            setClient(user)
        }
        if (!!$visit?.date) {
            setDate($visit.date)
        }
    }, [$visit, user]);

    return (
        <div style={isEmpty ? {zIndex: 2, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around"} : {zIndex: 2, width: "100%"}}>
            {isEmpty ?
                <>
                    <VisitCard.ClientInfo $client={client} $avatarSize={isEmpty ? "large" : "small"}/>
                    <p style={{marginBottom: 20}}>{client?.lastName} {client?.firstName}</p>
                </> :
                <>
                    {$visit && $useClientInfo && <VisitCard.ClientInfo $client={$visit.client} $avatarSize={"small"}/>}
                    <p style={{marginBottom: 20}}>{client?.lastName} {client?.firstName}</p>
                    {$visit && <VisitCard.Details $services={$visit.services.length ? $visit.services : $visit.categories} $date={date}/>}
                </>}
            {children}
            {$useReply && <Button onClick={$replyClick}>Повторить</Button>}
        </div> 
    );
}

const ClientInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 10px;
    width: 100%;

    & > p {
        padding: 0;
        margin: 0;
    }
`

const ClientInfoAvatarWrapper = styled.div`
    margin-bottom: 10px;
    position: relative;
    &:has(.large) {
        width: 95px;
        min-height: 95px;
        &::after {
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            content: "?";
            justify-content: center;
            align-items: center;
            font-size: 50px;
            font-family: "Open Sans", sans-serif;
            color: white;
            width: 95px;
            min-height: 95px;
            background-color: var(--secondary-color);
            border-radius: 50%;
            z-index: 2;
        }
    }
    &:has(.small) {
        width: 50px;
        min-height: 50px;
        &::after {
            position: absolute;
            top: 0;
            left: 0;
            display: block;
            content: " ";
            width: 50px;
            min-height: 50px;
            background-color: var(--secondary-color);
            border-radius: 50%;
            z-index: 2;
        }
    }
`

const ClientInfoAvatar = styled.img`
    position: relative;
    border-radius: 50%;
    z-index: 3;
    &.large {
        width: 95px;
        height: 95px;
        object-fit: cover;
    }
    &.small {
        width: 50px;
        height: 50px;
        object-fit: cover;
    }
`

VisitCard.ClientInfo = ({$client, $avatarSize}: ClientProps) => {
    console.log($client);
    return (
        <ClientInfo className={"visit-card__client-info"}>
            <ClientInfoAvatarWrapper>
                <ClientInfoAvatar className={`visit-card__client-info-avatar ${$avatarSize}`}
                                   src={$client?.avatar ?? arrow} alt={""} loading={"lazy"}/>
            </ClientInfoAvatarWrapper>
            <p>{$client?.name}</p>
        </ClientInfo>
    )
}

interface DetailsRowProps {
    $icon: string;
    $width: string | number;
}

const DetailsRow = styled.div<DetailsRowProps>`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: ${props => `calc(${props.$width} - 20px)`};
    background: white;
    min-height: 1rem;
    padding: 10px;
    border-radius: 1rem;
    margin-bottom: 10px;

    &::before {
        content: " ";
        background-image: url(${props => props.$icon});
        background-size: contain;
        width: 20px;
        height: 20px;
        filter: brightness(0) saturate(100%) invert(17%) sepia(61%) saturate(4054%) hue-rotate(290deg) brightness(85%) contrast(97%);
        margin: 0 10px;
    }
`

VisitCard.Details = ({$services = [], $date, $time}: DetailsProps) => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            flexWrap: "wrap",
            justifyContent: "space-between"
        }}>
            <DetailsRow $icon={taskList} $width={"100%"}>
                <p style={{textAlign: "center", width: "calc(100% - 25px)"}}>{$services[0]?.title}</p>
            </DetailsRow>
            <DetailsRow $icon={calendar} $width={"58%"}>
                <p>{Helper.dateFormat($date ?? new Date(), 'DD.MM.YYYY')}</p>
            </DetailsRow>
            <DetailsRow $icon={clock} $width={"38%"}>
                <p>{$time ?? Helper.dateFormat($date ?? new Date(), "HH:mm")}</p>
            </DetailsRow>
        </div>
    )
}

export default VisitCard;