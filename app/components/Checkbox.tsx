import styled from "styled-components";

const CheckboxContainer = styled.label`
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
    color: #fff;
    user-select: none;
    margin-bottom: 20px;
    justify-content: flex-start;
    width: 100%;
`;

const HiddenCheckbox = styled.input.attrs({type: 'checkbox'})`
    position: absolute;
    opacity: 0;
    cursor: pointer;
`;

const CustomCheckbox = styled.div`
    min-width: 30px;
    min-height: 30px;
    border: none;
    background-color: var(--disabled-color);
    border-radius: calc(var(--border-radius) / 2);
    margin-right: 8px;
    position: relative;
    transition: all 0.2s;

    ${HiddenCheckbox}:checked + & {
        background-color: var(--secondary-color);
        border-color: var(--secondary-color);
    }

    ${HiddenCheckbox}:checked + &::after {
        content: ' ';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--background-color);
        font-size: 14px;
        font-weight: bold;
    }
`;

export const Checkbox = ({className, label, checked, onChange, ...props}: {className?: string, checked:boolean, onChange: (event: any) => void, label: React.ReactNode}) => (
    <CheckboxContainer className={className}>
        <HiddenCheckbox checked={checked} onChange={onChange} {...props} />
        <CustomCheckbox {...props} />
        <span>{label}</span>
    </CheckboxContainer>
)