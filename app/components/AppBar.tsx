import styled from "styled-components";
import {useAppContext} from "~/hooks/AppContext";
import {NavLink} from "react-router";
import homeIcon from "~/assets/home.png";
import plusIcon from "~/assets/plus.png";
import historyIcon from "~/assets/history.png";

const Container = styled.div`
    background-color: #fff;
    padding: 15px 20px;
    position: fixed;
    bottom: 10px;
    height: 40px;
    margin: 0 auto;
    width: 80vw;
    border-radius: 3rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 0 20px rgba(0, 0, 0, .3);
    z-index: 1001;
    & > a {
        background: var(--secondary-color);
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        & > img {
            filter: brightness(0) invert(1);
        }
        &.active {
            opacity: 0.7;
            background: color-mix(in srgb, var(--secondary-color) 50%, transparent);
        }
    }
`;

const Icon = styled.img`
    width: 1.5rem;
    height: 1.5rem;
`;

const AppBar = () => {
    const {barVisible} = useAppContext()
    return (
        <Container style={{visibility: barVisible ? 'visible' : 'hidden'}}>
            <NavLink to={"home"} viewTransition>
                <Icon src={homeIcon} alt={"Home"} />
            </NavLink>
            <NavLink to={"create"} viewTransition>
                <Icon src={plusIcon} alt={"Create"} />
            </NavLink>
            <NavLink to={"history"} viewTransition>
                <Icon src={historyIcon} alt={"History"} />
            </NavLink>
        </Container>
    )
}

export default AppBar;