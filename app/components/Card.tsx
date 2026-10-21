import {styled} from "styled-components";
import {NavLink} from "react-router";
import Appointment from "~/classes/Appointment";

interface CardProps {
    $col?: number;
    $line?: number;
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
    
    & > h2 {
        font-family: "Sylphaen";
        font-weight: 100;
        margin: 10px auto;
        font-size: 24px;
    }

    & > p {
        font-size: 16px;
        padding: 10px 0 5px;
        text-align: center;
        color: #666;
        max-width: 100%;
        width: 100%;
        display: -webkit-box;
        -webkit-line-clamp: ${props => props.$line ?? 1};
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: "Open Sans";
    }
    
    & .icon {
        display: flex;
        font-family: "Font Awesome 5 Free",serif;
        justify-content: center;
        align-items: center;
        content: "\\f08e";
        position: absolute;
        right: var(--position);
        top: var(--position);
        width: calc(var(--position) * 2);
        height: calc(var(--position) * 2);
        border-radius: 50%;
        background: #EEE;
        & img {
            filter: brightness(0) saturate(100%) invert(17%) sepia(68%) saturate(2635%) hue-rotate(283deg) brightness(93%) contrast(96%);
        }
    }
`;

export {Card, GridContainer};