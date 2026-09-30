import styled from "styled-components";
import {NavLink} from "react-router";
import Appointment from "~/classes/Appointment";

interface CardProps {
    $col?: number;
}

const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 10px;
    grid-row-gap: 10px;
    width: 100%;

    & > .single {

    }

    & > .row {
        grid-column: 1 / -1;
    }
`

const Card = styled(NavLink)<CardProps>`
    --position: 10px;
    font-size: .8rem;
    font-weight: 100;
    text-decoration: none;
    min-height: 6rem;
    color: #841F82;
    background: white;
    position: relative;
    padding: var(--position);
    border-radius: var(--border-radius);
    justify-content: flex-start;
    align-items: baseline;
    justify-items: center;
    box-shadow: 0 0 5px rgba(0, 0, 0, .3);
    transition: all .5s;
    
    &:hover {
        box-shadow: 0 0 10px rgba(0, 0, 0, .5);
    }

    & > p {
        font-size: 18px;
        padding: 10px 0;
        text-align: center;
        color: black;
        max-width: 100%;
        width: 100%;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    & .icon {
        display: block;
        font-family: "Font Awesome 5 Free",serif;
        content: "\\f08e";
        position: absolute;
        right: var(--position);
        top: var(--position);
        width: calc(var(--position) * 3);
        height: calc(var(--position) * 3);
    }
`;

export {Card, GridContainer};