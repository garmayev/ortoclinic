import {type HTMLProps, useState} from "react";
import styled from "styled-components";
import type {DivNode} from "postcss-value-parser";

const Container = styled.div`
    padding: var(--horizontal-padding);
    border-radius: var(--border-radius);
    background: white;
    color: var(--link-color);
`
const Month = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-column-gap: 1px;
    grid-row-gap: 1px;
`
const Cell = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: 40px;
    font-size: 12px;
    cursor: pointer;
    user-select: none;
    border-radius: calc(var(--border-radius) / 2);
    transition: all .3s;
    &.selected {
        background-color: var(--primary-color);
        color: var(--text-color);
    }
    &.inactive {
        background: rgba(0, 0, 0, .3);
        color: #7D7E94;
        cursor: not-allowed;
    }
    &.blocked {
        background-color: #f5f5f5;
        color: #ccc;
        cursor: not-allowed;
        text-decoration: line-through;
    }
`
const Weekday = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
`
const Header = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 4rem;
    border-bottom: 1px solid #ccc;
    margin-bottom: var(--horizontal-padding);
`
const Button = styled.button`
    background-color: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--link-color);

    &:disabled {
        cursor: not-allowed;
        color: #ccc;
    }
`
const Title = styled.span`
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 21px;
`

interface CalendarProps {
    selectedDate: Date;
    onChange: (date: Date) => void;
    closestDate?: Date | null;
    blockedDates?: Date[];
}

function getEndOfNextWeek() {
    const now = new Date();
    // getDay() возвращает 0 (воскресенье) - 6 (суббота)
    const currentDay = now.getDay();
    // Дней до конца текущей недели (до воскресенья)
    const daysToSunday = (currentDay === 0) ? 0 : (7 - currentDay);
    // Дней до конца СЛЕДУЮЩЕЙ недели (7 дней + остаток до конца этой)
    const daysToNextSunday = daysToSunday + 7;

    const endOfNextWeek = new Date(now);
    endOfNextWeek.setDate(now.getDate() + daysToNextSunday);
    endOfNextWeek.setHours(23, 59, 59, 999); // Установить конец дня

    return endOfNextWeek;
}

export const Calendar = ({selectedDate, onChange, closestDate = null, blockedDates = [], ...props}: CalendarProps) => {
    const [date, setDate] = useState(new Date())
    const [currentDate, setCurrentDate] = useState(selectedDate);

    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    const daysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getDaysInCurrentMonth = () => {
        return daysInMonth(
            currentDate.getFullYear(),
            currentDate.getMonth()
        );
    };

    const getFirstDayOfMonth = () => {
        const firstDay = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        ).getDay();
        if (firstDay === 0) {
            return 6;
        } else {
            return firstDay - 1
        }
    };

    const handlePreviousMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    const handleDateSelected = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setDate(newDate);
        onChange(newDate);
    };

    // Проверка, является ли дата заблокированной
    const isDateBlocked = (year: number, month: number, day: number): boolean => {
        const dateToCheck = new Date(year, month, day);
        dateToCheck.setHours(0, 0, 0, 0);

        // Сегодняшняя дата для сравнения
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        // Проверка на даты раньше сегодня (вчера и ранее)
        if (dateToCheck < todayDate) {
            return true;
        }

        // Проверка на даты позже конца следующей недели
        if (dateToCheck > getEndOfNextWeek()) {
            return true;
        }

        // Проверка по closestDate
        if (closestDate) {
            try {
                const closestAvailableDate = new Date(closestDate);
                closestAvailableDate.setHours(0, 0, 0, 0);

                if (dateToCheck <= closestAvailableDate) {
                    return true;
                }
            } catch (error) {
                console.error('Error parsing closest date:', error);
            }
        }

        // Проверка по blockedDates (массив конкретных дат для блокировки)
        if (blockedDates && blockedDates.length > 0) {
            return blockedDates.some(blockedDate => {
                try {
                    const blocked = new Date(blockedDate);
                    blocked.setHours(0, 0, 0, 0);
                    return dateToCheck.getTime() === blocked.getTime();
                } catch (error) {
                    console.error('Error parsing blocked date:', error);
                    return false;
                }
            });
        }

        return false;
    };

    // Получение CSS класса для ячейки даты
    const getDateCellClass = (day: number): string => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        let className = "day";
        const isBlocked = isDateBlocked(year, month, day);

        if (isBlocked) {
            className += " blocked";
        } else if (
            date?.getFullYear() === year &&
            date?.getMonth() === month &&
            day === date?.getDate()
        ) {
            className += " selected";
        } else {
            className += " active";
        }

        return className;
    };

    // Проверка, можно ли выбрать дату
    const canSelectDate = (day: number): boolean => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        return !isDateBlocked(year, month, day);
    };

    // Получаем дату для отображения в заголовке кнопки (следующий месяц)
    const getNextMonthName = () => {
        const nextMonthIndex = (currentDate.getMonth() + 1) % 12;
        return months[nextMonthIndex];
    };

    return (
        <Container>
            <Header className="header">
                <Button onClick={handlePreviousMonth}>
                    {months[(currentDate.getMonth() - 1 + 12) % 12]}
                </Button>
                <Title>
                    {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Title>
                <Button onClick={handleNextMonth}>
                    {getNextMonthName()}
                </Button>
            </Header>
            <Weekday className="weekdays">
                <div>Пн</div>
                <div>Вт</div>
                <div>Ср</div>
                <div>Чт</div>
                <div>Пт</div>
                <div>Сб</div>
                <div>Вс</div>
            </Weekday>
            <Month className="days">
                {[...Array(getFirstDayOfMonth())].map((_, index) => (
                    <Cell key={`empty-${index}`} className="empty-day"></Cell>
                ))}
                {[...Array(getDaysInCurrentMonth())].map((_, index) => {
                    const day = index + 1;
                    const className = getDateCellClass(day);
                    const isSelectable = canSelectDate(day);

                    return (
                        <Cell
                            key={`day-${day}`}
                            onClick={() => {
                                if (isSelectable) {
                                    handleDateSelected(day);
                                }
                            }}
                            className={className}
                        >
                            {day}
                        </Cell>
                    );
                })}
            </Month>
        </Container>
    );
};