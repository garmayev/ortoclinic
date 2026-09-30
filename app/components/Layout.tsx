import styled from "styled-components";
import {Outlet} from "react-router-dom";
import "../app.css";
import {useAppContext} from "~/hooks/AppContext";
import {Helper} from "~/constant/Helper";
import Loader from "~/components/Loader";
import AppBar from "~/components/AppBar";
import {useMessenger} from "~/hooks/MessengerContext.tsx";
import {useEffect} from "react";

interface BackgroundProps {
    $gradient: string;
    $animate?: boolean;
    $useOpacity?: boolean;
}

const Background = styled.div<BackgroundProps>`
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    position: relative;
    overflow-x: hidden;

    &::before {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        content: " ";
        width: 100vw;
        height: 100%;
        background-image: ${props => props.$gradient};
        background-size: cover;
        opacity: ${props => props.$useOpacity ? ".4" : "1"};
        pointer-events: none;
    }
`;

interface ContainerProps {
    $barVisible: boolean;
}

const Title = styled.h2`
    color: var(--secondary-color);
    text-align: left;
    width: 100%;
    font-weight: 100;
    margin-bottom: 20px;
`;

// Анимированный контейнер для контента
const AnimatedContent = styled.div`
    width: 100%;
    position: relative;

    // View Transition анимация для контента
    view-transition-name: content;

    &::view-transition-old(content) {
        animation: 0.2s cubic-bezier(0.4, 0, 0.2, 1) both fade-out-slide-up;
    }

    &::view-transition-new(content) {
        animation: 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.05s both fade-in-slide-down;
    }
`;

const Container = styled.div<ContainerProps>`
    position: relative;
    width: calc(100% - 20px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 10px;
    margin-bottom: ${props => props.$barVisible ? "90px" : "0px"};

    @media (min-width: ${Helper.sizes.tablet}) {
        width: 500px;
        margin: 0 auto;
    }
`;

const Layout = () => {
    const {gradient, loader, barVisible, useOpacity, title} = useAppContext();

    return (
        <Background
            className={"layout"}
            $gradient={gradient}
            $animate={true}
            $useOpacity={useOpacity}
        >
            <Container className={"layout-container"} $barVisible={barVisible}>
                {title && <Title>{title}</Title>}
                <AnimatedContent className={"animate"}>
                    <Outlet />
                </AnimatedContent>
            </Container>

            {loader.config.positionMode === 'fixed' && (
                <Loader
                    text={loader.config.text}
                    dotSize={loader.config.dotSize}
                    glowIntensity={loader.config.glowIntensity}
                    ringWidth={loader.config.ringWidth}
                    size={loader.config.size}
                    useExtraGlow={loader.config.useExtraGlow}
                    horizontalPosition={loader.position.x}
                    verticalPosition={loader.position.y}
                    isVisible={loader.showLoader}
                    positionMode="fixed"
                    showOverlay={loader.config.showOverlay}
                />
            )}
            <AppBar />
        </Background>
    )
}

export default Layout;