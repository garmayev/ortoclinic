import React, {useEffect, useState} from "react";
import background from "~/assets/back.png";
import {styled} from "styled-components";
import Button from "~/components/Button";

const ModalWrapper = styled.div`
    position: absolute;

    &.modal-show > .modal-container {
        top: 1rem;
    }

    &.modal-show > .modal-background {
        opacity: 1;
    }

    &.modal-hidden > .modal-container {
        top: 100vh;
    }

    &.modal-hidden > .modal-background {
        opacity: 0;
    }
`;

const ModalContainer = styled.div`
    display: block;
    position: fixed;
    top: 2rem;
    left: 0;
    height: calc(100vh - 2rem);
    width: 100vw;
    z-index: 1000;
    padding: 1rem 0;
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    transition: all .5s;
    background-color: white;

    &::before {
        position: absolute;
        top: 0;
        left: 0;
        content: " ";
        display: block;
        width: 100%;
        height: 100%;
        background-image: url(${background});
        background-size: cover;
        background-position: center;
        opacity: .5;
        z-index: 1000;
    }
`;

const ModalBackground = styled.div<{ $isHidden: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    z-index: 999;
    background: rgba(0, 0, 0, .3);
    transition: all .3s;
    ${props => props.$isHidden && 'display: none;'}
`;

const Modal = ({
                   $title = "", $visible = false, children, $useClose = true, $onClose = () => {
    }}: {
    $title?: string,
    $visible: boolean,
    children?: React.ReactNode,
    $useClose: boolean,
    $onClose?: () => void,
}) => {
    const [isVisible, setIsVisible] = useState($visible);
    const [isBackgroundHidden, setIsBackgroundHidden] = useState(!$visible);

    useEffect(() => {
        if ($visible) {
            setIsVisible(true);
            setIsBackgroundHidden(false);
        } else {
            // Сначала запускаем анимацию скрытия
            setIsVisible(false);
            // После завершения анимации скрываем фон
            const timer = setTimeout(() => {
                setIsBackgroundHidden(true);
            }, 300); // Длительность transition для ModalBackground
            return () => clearTimeout(timer);
        }
    }, [$visible]);

    return (
        <ModalWrapper style={{width: "100%"}} className={`modal-wrapper ${isVisible ? "modal-show" : "modal-hidden"}`}>
            <ModalBackground
                className={'modal-background'}
                $isHidden={isBackgroundHidden}
            />
            <ModalContainer className={'modal-container'}>
                <Modal.Title $useClose={$useClose} $onClose={$onClose}>{$title}</Modal.Title>
                <Modal.Content>
                    {children}
                </Modal.Content>
            </ModalContainer>
        </ModalWrapper>
    );
};

const Title = styled.div`
    border-bottom: 1px solid #ccc;
    width: calc(100% - 3rem);
    font-weight: 400;
    font-size: 1.3rem;
    position: relative;
    padding: 0 1rem;
    z-index: 1001;
    color: var(--secondary-color);

    & .toolset {
        position: absolute;
        right: 0;
        top: -8px;

        & > .icon {
            display: flex;
            width: 30px;
            height: 30px;
            justify-content: center;
            align-items: center;
            border-radius: 4px;
            background: rgba(0, 0, 0, .2);
            cursor: pointer;
        }
    }
`;

Modal.Title = ({
                   children, $useClose = false, $onClose = () => {}
               }: { children: React.ReactNode, $useClose: boolean, $onClose?: () => void }) => {
    return (
        <Title className={'modal-title'}>
            {children}
            {$useClose && <div className={"toolset"}>
                <span className={"icon"} onClick={$onClose}>&times;</span>
            </div>}
        </Title>
    );
};

const Content = styled.div`
    margin-top: 1rem;
    padding: 0 1rem;
    position: relative;
    z-index: 1001;
    min-height: calc(100vh - 4rem);
`;

Modal.Content = ({children}: { children: React.ReactNode }) => {
    return (<Content className={'modal-content'}>{children}</Content>);
};

const ControlContainer = styled.div`
    position: absolute;
    bottom: 0;
    width: calc(100vw - 4rem);
    padding: 0 1rem;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 15px;
`

Modal.Control = ({children}: { children: React.ReactNode }) => {
    return (
        <ControlContainer>
            {children}
        </ControlContainer>
    )
}

export default Modal;