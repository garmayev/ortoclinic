import {styled} from "styled-components";
import type {ChangeEvent, CSSProperties} from "react";

interface SelectListProps {
    list: Array<any>,
    name: string,
    onChange: (event:ChangeEvent) => void,
    value?: any,
    type?: string,
    style?: CSSProperties,
}

const HiddenInput = styled.input`
    display: none;
`

const Item = styled.div`
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
`

const Label = styled.label<{ checked: boolean }>`
    margin: 5px 0;
    padding: 10px;
    background-color: white;
    width: calc(100vw - 60px);
    border-radius: 5px;
    user-select: none;
    cursor: pointer;
    transition: all .3s;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: #666;
    font-weight: 100;

    ${props => props.checked && `
        background: var(--primary-color);
        color: white;
        box-shadow: 0 0 10px rgba(255, 255, 255, .3);
    `}
`

export const SelectList = ({list, name, onChange, type = "radio", value, ...props}:SelectListProps) => {
    return (
        <div {...props}>
            {list.map((item, index) => {
                const checked = type === "checkbox"
                    ? value?.includes(item.id)
                    : Number(value) === Number(item.id)
                return (
                    <Item key={`${type}-${index}`}>
                        <HiddenInput
                            value={item.id}
                            id={`${name}-${type}-${item.id}`}
                            type={type}
                            name={name}
                            onChange={onChange}
                            checked={checked}
                        />
                        <Label
                            htmlFor={`${name}-${type}-${item.id}`}
                            checked={checked}
                        >
                            <span>{item.title}</span>
                            <span style={{
                                display: "flex",
                                alignItems: 'center',
                                whiteSpace: "nowrap"
                            }}>
                                {item.price}{item.price ? " ₽" : ""}
                            </span>
                        </Label>
                    </Item>
                )
            })}
        </div>
    )
}