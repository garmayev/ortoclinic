import styled from "styled-components";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps {
    $disabled?: boolean;
    $variant?: ButtonVariant;
    onClick?: (event: Event) => void;
}

const Button = styled.button<ButtonProps>`
    background-color: ${props => props.$variant === "primary" ? "var(--primary-color)" : "var(--secondary-color)"};
    color: white;
    padding: 10px;
    border-radius: var(--border-radius);
    margin-bottom: 10px;
    width: 100%;
    outline: none;
    border: none;
    &:disabled {
        background-color: var(--disabled-color);
        color: gray;
    }
`;

export default Button;