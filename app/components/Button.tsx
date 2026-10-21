import {styled} from "styled-components";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps {
    $disabled?: boolean;
    $variant?: ButtonVariant;
    onClick?: (event: Event) => void;
    $size?: string;
}

const Button = styled.button<ButtonProps>`
    background-color: ${props => props.$variant === "primary" ? "var(--primary-color)" : "var(--secondary-color)"};
    color: white;
    padding: ${props => props.$size === "large" ? "20px" : "10px"};
    border-radius: ${props => props.$size === "large" ? "calc(var(--border-radius) * 2)" : "var(--border-radius)"};
    margin-bottom: 10px;
    width: 100%;
    outline: none;
    border: none;
    font-family: 'Tenor Sans';
    font-size: 18px;
    &:disabled {
        background-color: var(--disabled-color);
        color: gray;
    }
`;

export default Button;