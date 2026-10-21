import React from 'react';
import {keyframes, styled} from 'styled-components';

// Анимация вращения
const rotate = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`;

interface LoaderWrapperProps {
    $size?: number;
    $horizontalPosition?: number | 'left' | 'center' | 'right';
    $verticalPosition?: number | 'top' | 'center' | 'bottom';
    $isVisible?: boolean;
    $positionMode?: 'fixed' | 'relative';
}

const LoaderWrapper = styled.div<LoaderWrapperProps>`
    /* Базовые стили */
    width: ${props => props.$size || 150}px;
    height: ${props => props.$size || 150}px;
    display: flex;
    justify-content: center;
    align-items: center;

    /* Плавное появление/исчезновение */
    opacity: ${props => props.$isVisible ? 1 : 0};
    visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
    transition: opacity 0.3s ease, visibility 0.3s ease;

    /* Режимы позиционирования */
    ${props => props.$positionMode === 'fixed' ? `
        position: fixed;
        z-index: 9999;
        margin: 0;
    ` : `
        position: relative;
    `}

        /* Горизонтальное позиционирование для fixed режима */
    ${props => {
        if (props.$positionMode !== 'fixed') return '';

        if (typeof props.$horizontalPosition === 'number') {
            return `left: ${props.$horizontalPosition}px;`;
        }
        switch (props.$horizontalPosition) {
            case 'left': return 'left: 0;';
            case 'right': return 'right: 0;';
            case 'center':
            default: return 'left: 50%; transform: translateX(-50%);';
        }
    }}
    ${props => {
        if (props.$isVisible) {
            return 'display: block;';
        } else {
            return 'display: none;';
        }
    }}
        /* Вертикальное позиционирование для fixed режима */
    ${props => {
        if (props.$positionMode !== 'fixed') return '';

        if (typeof props.$verticalPosition === 'number') {
            return `top: ${props.$verticalPosition}px;`;
        }
        switch (props.$verticalPosition) {
            case 'top': return 'top: 0;';
            case 'bottom': return 'bottom: 0;';
            case 'center':
            default: return 'top: 50%; transform: translateY(-50%);';
        }
    }}

        /* Корректировка transform для center + center в fixed режиме */
    ${props => {
        if (props.$positionMode !== 'fixed') return '';
        if (props.$horizontalPosition === 'center' && props.$verticalPosition === 'center') {
            return 'transform: translate(-50%, -50%);';
        }
        if (props.$horizontalPosition === 'center' && props.$verticalPosition !== 'center') {
            return 'transform: translateX(-50%);';
        }
        if (props.$horizontalPosition !== 'center' && props.$verticalPosition === 'center') {
            return 'transform: translateY(-50%);';
        }
        return '';
    }}

        /* Горизонтальное позиционирование для relative режима */
    ${props => {
        if (props.$positionMode !== 'relative') return '';

        if (typeof props.$horizontalPosition === 'number') {
            return `margin-left: ${props.$horizontalPosition}px;`;
        }
        switch (props.$horizontalPosition) {
            case 'left': return 'margin-left: 0; margin-right: auto;';
            case 'right': return 'margin-left: auto; margin-right: 0;';
            case 'center':
            default: return 'margin-left: auto; margin-right: auto;';
        }
    }}

        /* Вертикальное позиционирование для relative режима */
    ${props => {
        if (props.$positionMode !== 'relative') return '';

        if (typeof props.$verticalPosition === 'number') {
            return `margin-top: ${props.$verticalPosition}px;`;
        }
        switch (props.$verticalPosition) {
            case 'top': return 'margin-top: 0; margin-bottom: auto;';
            case 'bottom': return 'margin-top: auto; margin-bottom: 0;';
            case 'center':
            default: return 'margin-top: auto; margin-bottom: auto;';
        }
    }}
`;

const Ring = styled.div<{ $ringWidth?: number; $size?: number; $glowIntensity?: number }>`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    min-width: ${props => props.$size || 150}px;
    min-height: ${props => props.$size || 150}px;
    border-radius: 50%;

    /* Линейный градиент слева направо */
    background: linear-gradient(
            to right,
            #BF9CDC 0%,
            #D2A5D9 25%,
            #E0ADD6 50%,
            #EAB5D3 75%,
            #ECB1D1 100%
    );

    /* Маска для создания кольца */
    mask: radial-gradient(circle,
    transparent calc(50% - ${props => (props.$ringWidth || 3)}px),
    black calc(50% - ${props => (props.$ringWidth || 3)}px),
    black calc(50% + ${props => (props.$ringWidth || 3)}px),
    transparent calc(50% + ${props => (props.$ringWidth || 3)}px + 1px)
    );
    -webkit-mask: radial-gradient(circle,
    transparent calc(50% - ${props => (props.$ringWidth || 3)}px),
    black calc(50% - ${props => (props.$ringWidth || 3)}px),
    black calc(50% + ${props => (props.$ringWidth || 3)}px),
    transparent calc(50% + ${props => (props.$ringWidth || 3)}px + 1px)
    );

    /* Свечение */
    filter: drop-shadow(0 0 ${props => 8 * (props.$glowIntensity || 1)}px #BF9CDC)
    drop-shadow(0 0 ${props => 15 * (props.$glowIntensity || 1)}px #E0ADD6)
    drop-shadow(0 0 ${props => 25 * (props.$glowIntensity || 1)}px #ECB1D1);

    transform: scale(1);
    transform-origin: center center;
`;

// Отдельный слой для дополнительного свечения
const ExtraGlow = styled.div<{ $size?: number; $intensity?: number }>`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(
            circle at center,
            rgba(236, 177, 209, ${props => 0.2 * (props.$intensity || 1)}) 0%,
            rgba(191, 156, 220, ${props => 0.1 * (props.$intensity || 1)}) 50%,
            transparent 70%
    );
    filter: blur(10px);
    z-index: 1;
    pointer-events: none;
`;

const DotContainer = styled.div<{ $size?: number; $ringWidth?: number }>`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    animation: ${rotate} 2s linear infinite;
    z-index: 3;
`;

const Dot = styled.div<{ $ringWidth?: number; $dotSize?: number; $size?: number }>`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${props => props.$dotSize || 14}px;
    height: ${props => props.$dotSize || 14}px;

    /* Расчет радиуса до середины кольца */
    margin-left: ${props => {
        const radius = (props.$size || 150) / 2;
        return radius - (props.$ringWidth || 3) / 2 - 20;
    }}px;

    margin-top: -${props => (props.$dotSize || 14) / 2}px;

    &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(
                135deg,
                #ECB1D1,
                #BF9CDC
        );
        border-radius: 50%;
        box-shadow: 0 0 10px 5px rgba(255, 255, 255, 0.5);
        z-index: 2;
    }

    &::after {
        content: '';
        position: absolute;
        top: 1px;
        left: 1px;
        right: 1px;
        bottom: 1px;
        background: white;
        border-radius: 50%;
        opacity: 0.8;
        z-index: 1;
    }
`;

const LoaderText = styled.span`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 14px;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-family: sans-serif;
    z-index: 4;
    text-shadow:
            0 0 10px #BF9CDC,
            0 0 20px #E0ADD6,
            0 0 30px #ECB1D1;
    font-weight: 300;
    background: rgba(0, 0, 0, 0.3);
    padding: 4px 8px;
    border-radius: 12px;
    backdrop-filter: blur(2px);
    white-space: nowrap;
`;

// Затемняющий фон для fixed режима
const Overlay = styled.div<{ $isVisible?: boolean; $blur?: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9998;
    opacity: ${props => props.$isVisible ? 1 : 0};
    visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
    transition: opacity 0.3s ease, visibility 0.3s ease;
    backdrop-filter: ${props => props.$blur ? 'blur(3px)' : ''};
`;

interface LoaderProps {
    text?: string;
    style?: React.CSSProperties;
    ringWidth?: number;
    size?: number;
    dotSize?: number;
    className?: string;
    glowIntensity?: number;
    useExtraGlow?: boolean;
    horizontalPosition?: number | 'left' | 'center' | 'right';
    verticalPosition?: number | 'top' | 'center' | 'bottom';
    isVisible?: boolean;
    blur?: boolean;
    positionMode?: 'fixed' | 'relative';  // Новый проп
    showOverlay?: boolean;  // Показывать ли затемнение в fixed режиме
    overlayClassName?: string;
}

const Loader = ({
                    text = "Loading",
                    style,
                    ringWidth = 3,
                    size = 150,
                    dotSize = 14,
                    className,
                    glowIntensity = 1,
                    useExtraGlow = false,
                    horizontalPosition = 'center',
                    verticalPosition = 'center',
                    isVisible = true,
                    blur = true,
                    positionMode = 'relative',
                    showOverlay = false,
                    overlayClassName
                }: LoaderProps) => {
    return (
        <>
            {positionMode === 'fixed' && showOverlay && (
                <Overlay $isVisible={isVisible} $blur={blur} className={overlayClassName} />
            )}
            <LoaderWrapper
                style={style}
                $size={size}
                $horizontalPosition={horizontalPosition}
                $verticalPosition={verticalPosition}
                $isVisible={isVisible}
                $positionMode={positionMode}
                className={className}
            >
                <Ring
                    $ringWidth={ringWidth}
                    $size={size}
                    $glowIntensity={glowIntensity}
                />
                {useExtraGlow && (
                    <ExtraGlow $size={size} $intensity={glowIntensity} />
                )}
                <DotContainer $size={size} $ringWidth={ringWidth}>
                    <Dot
                        $ringWidth={ringWidth}
                        $dotSize={dotSize}
                        $size={size}
                    />
                </DotContainer>
                <LoaderText>{text}</LoaderText>
            </LoaderWrapper>
        </>
    );
};

export default Loader;