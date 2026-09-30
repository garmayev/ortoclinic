import {useState, useMemo, useCallback} from "react";
import styled from "styled-components";

// ============ Стили ============
const Container = styled.div`
    padding: var(--horizontal-padding);
    border-radius: var(--border-radius);
    background: rgba(255, 255, 255, .98);
    color: var(--link-color);
`;

const GroupsContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
`;

const GroupButton = styled.button<{
    $selected?: boolean;
    $active?: boolean;
    $hasAvailable?: boolean;
}>`
    flex: 1;
    min-width: 100px;
    padding: var(--horizontal-padding);
    background-color: ${props => {
    if (props.$selected) return 'var(--secondary-color)';
    if (props.$active) return 'var(--secondary-color)';
    if (!props.$hasAvailable) return '#e0e0e0';
    return 'black';
}};
    color: ${props => {
    if (!props.$hasAvailable && !props.$selected && !props.$active) return '#999';
    return 'white';
}};
    border: 1px solid ${props => {
    if (props.$selected) return 'var(--secondary-color)';
    if (props.$active) return 'var(--secondary-color)';
    return 'var(--secondary-color)';
}};
    border-radius: var(--border-radius);
    cursor: ${props => props.$hasAvailable ? 'pointer' : 'not-allowed'};
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s;
    text-align: center;
    opacity: ${props => props.$hasAvailable ? 1 : 0.6};
    position: relative;

    &:hover {
        background-color: ${props => {
    if (props.$hasAvailable) return 'var(--secondary-color)';
    return '#e0e0e0';
}};
        transform: ${props => props.$hasAvailable ? 'translateY(-1px)' : 'none'};
    }
`;

const GroupBadge = styled.span`
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ff6b6b;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
`;

const TimeSlotsContainer = styled.div`
    margin-top: 16px;
    animation: fadeIn 0.3s ease-in-out;

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const TimeSlotsGrid = styled.div<{ $layout?: 'grid' | 'list' }>`
    display: ${props => props.$layout === 'list' ? 'flex' : 'grid'};
    flex-direction: ${props => props.$layout === 'list' ? 'column' : 'row'};
    grid-template-columns: ${props => props.$layout === 'grid' ? 'repeat(auto-fill, minmax(80px, 1fr))' : 'none'};
    gap: 8px;
`;

const TimeSlot = styled.button<{
    $selected?: boolean;
    $disabled?: boolean;
    $groupOnlyMode?: boolean;
}>`
    padding: 8px 12px;
    background-color: ${props => {
    if (props.$groupOnlyMode) return '#f9f9f9';
    if (props.$selected) return 'var(--secondary-color)';
    if (props.$disabled) return '#f5f5f5';
    return 'white';
}};
    color: ${props => {
    if (props.$groupOnlyMode) return '#ccc';
    if (props.$selected) return 'white';
    if (props.$disabled) return '#ccc';
    return 'var(--link-color)';
}};
    border: 2px solid ${props => {
    if (props.$groupOnlyMode) return '#f0f0f0';
    if (props.$selected) return 'var(--secondary-color)';
    if (props.$disabled) return '#ddd';
    return '#ddd';
}};
    border-radius: var(--border-radius);
    cursor: ${props => props.$groupOnlyMode ? 'default' : (props.$disabled ? 'not-allowed' : 'pointer')};
    font-size: 14px;
    transition: all 0.3s;
    text-align: center;
    user-select: none;
    opacity: ${props => props.$groupOnlyMode ? 0.6 : 1};

    &:hover {
        background-color: ${props => {
    if (props.$groupOnlyMode) return '#f9f9f9';
    if (props.$disabled) return '#f5f5f5';
    if (props.$selected) return 'var(--secondary-color)';
    return '#f0f0f0';
}};
        transform: ${props => (props.$groupOnlyMode || props.$disabled) ? 'none' : 'translateY(-1px)'};
    }
`;

const SlotCheckbox = styled.input`
    margin-right: 8px;
    cursor: pointer;
`;

const GroupHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 8px 12px;
    background: #f5f5f5;
    border-radius: var(--border-radius);
    font-size: 13px;
    color: #666;
`;

const GroupTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const AvailableCount = styled.span`
    background: var(--secondary-color);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
`;

const GroupActions = styled.div`
    display: flex;
    gap: 8px;
`;

const ActionButton = styled.button`
    padding: 4px 8px;
    font-size: 12px;
    border: 1px solid #ddd;
    border-radius: var(--border-radius);
    background: white;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: var(--secondary-color);
        color: white;
        border-color: var(--secondary-color);
    }
`;

const NoSlotsMessage = styled.div`
    text-align: center;
    color: #7D7E94;
    font-style: italic;
    padding: 20px;
    font-size: 14px;
    background: #f9f9f9;
    border-radius: var(--border-radius);
`;

const SelectionToolbar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 8px 12px;
    background: #e3f2fd;
    border-radius: var(--border-radius);
    font-size: 13px;
`;

const SelectAllButton = styled.button`
    padding: 4px 12px;
    font-size: 12px;
    border: none;
    border-radius: var(--border-radius);
    background: var(--secondary-color);
    color: white;
    cursor: pointer;

    &:hover {
        opacity: 0.9;
    }
`;

const GroupOnlyMessage = styled.div`
    text-align: center;
    padding: 20px;
    background: #f9f9f9;
    border-radius: var(--border-radius);
    color: #666;
    font-size: 14px;
    
    strong {
        color: var(--secondary-color);
    }
`;

// ============ Типы ============
export type GroupId = string | number;

interface TimeSlotGroupProps {
    selectedTimeSlot: string | null;
    onChange: (slot: string | null) => void;
    availableTimeSlots?: string[];
    blockedTimeSlots?: string[];
    serviceDuration?: number;
    existingVisits?: Array<{ time: string; duration: number }>;
    timeGroups?: TimeGroup[];
    multipleSelect?: boolean;
    onMultipleSelect?: (slots: string[]) => void;
    enableDragDrop?: boolean;
    onSlotsReorder?: (slots: string[]) => void;
    layout?: 'grid' | 'list';
    showGroupStats?: boolean;
    groupActions?: GroupAction[];
    groupOnlyMode?: boolean;
    onGroupSelect?: (groupId: GroupId | null) => void;
    selectedGroupId?: GroupId | null;
}

export interface TimeGroup {
    id: GroupId;
    label: string;
    start: string;
    end: string;
    order?: number;
    color?: string;
}

interface BlockedInterval {
    start: number;
    end: number;
    reason: string;
    time?: string;
}

interface GroupAction {
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick: (groupId: GroupId, slots: string[]) => void;
}

// Группы по умолчанию
const DEFAULT_TIME_GROUPS: TimeGroup[] = [
    {id: 'morning', label: 'Утро', start: '09:00', end: '12:00', order: 1, color: '#4CAF50'},
    {id: 'midday', label: 'День', start: '12:00', end: '15:00', order: 2, color: '#2196F3'},
    {id: 'afternoon', label: 'После обеда', start: '15:00', end: '18:00', order: 3, color: '#FF9800'},
    {id: 'evening', label: 'Вечер', start: '18:00', end: '21:00', order: 4, color: '#9C27B0'}
];

export const TimeSlotGroup = ({
                                  selectedTimeSlot,
                                  onChange,
                                  availableTimeSlots = [],
                                  blockedTimeSlots = [],
                                  serviceDuration = 0,
                                  existingVisits = [],
                                  timeGroups = DEFAULT_TIME_GROUPS,
                                  multipleSelect = false,
                                  onMultipleSelect,
                                  enableDragDrop = false,
                                  onSlotsReorder,
                                  layout = 'grid',
                                  showGroupStats = true,
                                  groupActions = [],
                                  groupOnlyMode = false,
                                  onGroupSelect,
                                  selectedGroupId: externalSelectedGroupId
                              }: TimeSlotGroupProps) => {

    // ============ Состояния ============
    const [activeGroup, setActiveGroup] = useState<GroupId | null>(() => {
        // Инициализация при создании компонента
        if (groupOnlyMode && externalSelectedGroupId !== undefined) {
            return externalSelectedGroupId;
        }
        return null;
    });

    const [internalSelectedGroupId, setInternalSelectedGroupId] = useState<GroupId | null>(null);
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

    // Используем внешний или внутренний выбранный ID группы
    const selectedGroupId = groupOnlyMode
        ? (externalSelectedGroupId !== undefined ? externalSelectedGroupId : internalSelectedGroupId)
        : null;

    // ============ Вспомогательные функции ============
    const convertToMinutes = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // Сортируем группы
    const sortedGroups = useMemo(() => {
        return [...timeGroups].sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [timeGroups]);

    // Вычисляем заблокированные интервалы
    const blockedIntervals = useMemo(() => {
        const intervals: BlockedInterval[] = [];

        existingVisits.forEach(visit => {
            const start = convertToMinutes(visit.time);
            const end = start + (visit.duration || 30);
            intervals.push({start, end, reason: 'Запись занята', time: visit.time});
        });

        blockedTimeSlots.forEach(slot => {
            const start = convertToMinutes(slot);
            const end = start + 30;
            intervals.push({start, end, reason: 'Перерыв', time: slot});
        });

        return intervals;
    }, [existingVisits, blockedTimeSlots]);

    // Вычисляем динамически заблокированные слоты
    const dynamicallyBlockedSlots = useMemo(() => {
        if (serviceDuration === 0) return [];

        return availableTimeSlots.filter(slot => {
            const slotStart = convertToMinutes(slot);
            const slotEnd = slotStart + serviceDuration;

            return blockedIntervals.some(interval => {
                const overlaps = slotStart < interval.end && slotEnd > interval.start;
                const contains = slotStart <= interval.start && slotEnd >= interval.end;
                return overlaps || contains;
            });
        });
    }, [serviceDuration, availableTimeSlots, blockedIntervals]);

    // Получение слотов в группе
    const getSlotsInGroup = useCallback((start: string, end: string): string[] => {
        const startTime = convertToMinutes(start);
        const endTime = convertToMinutes(end);

        return availableTimeSlots
            .filter(slot => {
                const slotTime = convertToMinutes(slot);
                return slotTime >= startTime && slotTime < endTime;
            })
            .sort((a, b) => convertToMinutes(a) - convertToMinutes(b));
    }, [availableTimeSlots]);

    // Проверка блокировки слота
    const isSlotBlocked = useCallback((slot: string): boolean => {
        if (blockedTimeSlots.includes(slot)) return true;
        return !!dynamicallyBlockedSlots.includes(slot);
    }, [blockedTimeSlots, dynamicallyBlockedSlots]);

    // Получение доступных слотов в группе
    const getAvailableSlotsInGroup = useCallback((groupId: GroupId): string[] => {
        const group = sortedGroups.find(g => g.id === groupId);
        if (!group) return [];

        const slots = getSlotsInGroup(group.start, group.end);
        return slots.filter(slot => !isSlotBlocked(slot));
    }, [sortedGroups, getSlotsInGroup, isSlotBlocked]);

    // Проверка наличия доступных слотов в группе
    const hasAvailableSlots = useCallback((groupId: GroupId): boolean => {
        return getAvailableSlotsInGroup(groupId).length > 0;
    }, [getAvailableSlotsInGroup]);

    // ============ Обработчики ============
    const handleGroupClick = useCallback((groupId: GroupId) => {
        // if (!hasAvailableSlots(groupId)) return;

        if (groupOnlyMode) {
            const newSelectedGroupId = selectedGroupId === groupId ? null : groupId;

            setInternalSelectedGroupId(newSelectedGroupId);

            if (onGroupSelect) {
                onGroupSelect(newSelectedGroupId);
            }

            onChange(null);

            if (newSelectedGroupId) {
                setActiveGroup(newSelectedGroupId);
            }
        } else {
            setActiveGroup(prev => prev === groupId ? null : groupId);
            onChange(null);
        }
    }, [hasAvailableSlots, groupOnlyMode, selectedGroupId, onGroupSelect, onChange]);

    const handleSlotSelect = useCallback((slot: string) => {
        if (groupOnlyMode) return;
        if (isSlotBlocked(slot)) return;

        if (multipleSelect) {
            setSelectedSlots(prev => {
                const newSet = new Set(prev);
                if (newSet.has(slot)) {
                    newSet.delete(slot);
                } else {
                    newSet.add(slot);
                }
                return newSet;
            });
        } else {
            onChange(slot);
        }
    }, [groupOnlyMode, isSlotBlocked, multipleSelect, onChange]);

    const handleApplyMultipleSelect = useCallback(() => {
        if (!groupOnlyMode && multipleSelect && onMultipleSelect && selectedSlots.size > 0) {
            onMultipleSelect(Array.from(selectedSlots));
            setSelectedSlots(new Set());
        }
    }, [groupOnlyMode, multipleSelect, onMultipleSelect, selectedSlots]);

    const handleSelectAllInGroup = useCallback((groupId: GroupId) => {
        if (groupOnlyMode) return;
        const availableSlots = getAvailableSlotsInGroup(groupId);
        setSelectedSlots(prev => {
            const newSet = new Set(prev);
            availableSlots.forEach(slot => newSet.add(slot));
            return newSet;
        });
    }, [groupOnlyMode, getAvailableSlotsInGroup]);

    const handleClearSelection = useCallback(() => {
        setSelectedSlots(new Set());
    }, []);

    const handleGroupAction = useCallback((action: GroupAction, groupId: GroupId) => {
        const slots = getAvailableSlotsInGroup(groupId);
        action.onClick(groupId, slots);
    }, [getAvailableSlotsInGroup]);

    // ============ Получение данных для рендера ============
    const activeGroupData = sortedGroups.find(group => group.id === activeGroup);
    const selectedSlotGroup = useMemo(() => {
        if (!selectedTimeSlot) return null;

        const slotTime = convertToMinutes(selectedTimeSlot);

        for (const group of sortedGroups) {
            const startTime = convertToMinutes(group.start);
            const endTime = convertToMinutes(group.end);

            if (slotTime >= startTime && slotTime < endTime) {
                return group;
            }
        }

        return null;
    }, [selectedTimeSlot, sortedGroups]);

    const availableSlotsInActiveGroup = activeGroup
        ? getAvailableSlotsInGroup(activeGroup)
        : [];

    // ============ Рендеринг ============
    const renderTimeSlots = () => {
        if (!activeGroupData) return null;

        const groupSlots = getSlotsInGroup(activeGroupData.start, activeGroupData.end);

        if (groupOnlyMode) {
            return (
                <></>
            );
        }

        if (availableSlotsInActiveGroup.length === 0) {
            return (
                <NoSlotsMessage>
                    Нет доступных слотов в этой группе
                </NoSlotsMessage>
            );
        }

        return (
            <TimeSlotsContainer>
                <GroupHeader>
                    <GroupTitle>
                        <span style={{color: activeGroupData.color}}>{activeGroupData.label}</span>
                        {showGroupStats && (
                            <AvailableCount>
                                Доступно: {availableSlotsInActiveGroup.length} / {groupSlots.length}
                            </AvailableCount>
                        )}
                    </GroupTitle>
                    <GroupActions>
                        {multipleSelect && (
                            <>
                                <ActionButton
                                    key="select-all-button"
                                    onClick={() => handleSelectAllInGroup(activeGroupData.id)}
                                >
                                    Выбрать все
                                </ActionButton>
                                <ActionButton
                                    key="clear-button"
                                    onClick={handleClearSelection}
                                >
                                    Очистить
                                </ActionButton>
                            </>
                        )}
                        {groupActions.map((action, index) => (
                            <ActionButton
                                key={`${action.id}-${index}`}
                                onClick={() => handleGroupAction(action, activeGroupData.id)}
                                title={action.label}
                            >
                                {action.icon || action.label}
                            </ActionButton>
                        ))}
                    </GroupActions>
                </GroupHeader>

                {multipleSelect && selectedSlots.size > 0 && (
                    <SelectionToolbar key="selection-toolbar">
                        <span>Выбрано слотов: {selectedSlots.size}</span>
                        <SelectAllButton onClick={handleApplyMultipleSelect}>
                            Подтвердить выбор
                        </SelectAllButton>
                    </SelectionToolbar>
                )}

                <TimeSlotsGrid $layout={layout}>
                    {groupSlots.map(slot => {
                        const isAvailable = !isSlotBlocked(slot);
                        const isSelected = multipleSelect
                            ? selectedSlots.has(slot)
                            : selectedTimeSlot === slot;

                        let blockReason = "";
                        if (!isAvailable) {
                            if (blockedTimeSlots.includes(slot)) {
                                blockReason = "Это время занято или попадает в перерыв мастера";
                            } else if (dynamicallyBlockedSlots.includes(slot)) {
                                blockReason = `Недоступно из-за длительности услуг (${serviceDuration} мин)`;
                            }
                        }

                        return (
                            <TimeSlot
                                key={slot}
                                type="button"
                                $selected={isSelected}
                                $disabled={!isAvailable}
                                onClick={() => handleSlotSelect(slot)}
                                title={blockReason}
                            >
                                {multipleSelect && (
                                    <SlotCheckbox
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => {}}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                )}
                                {slot}
                            </TimeSlot>
                        );
                    })}
                </TimeSlotsGrid>
            </TimeSlotsContainer>
        );
    };

    // ============ Основной рендер ============
    return (
        <Container>
            <GroupsContainer>
                {sortedGroups.map(group => {
                    // const hasAvailable = hasAvailableSlots(group.id);
                    const hasAvailable = true;
                    const isSelectedGroup = groupOnlyMode
                        ? selectedGroupId === group.id
                        : selectedSlotGroup?.id === group.id;
                    const isActiveGroup = activeGroup === group.id;
                    const availableCount = getAvailableSlotsInGroup(group.id).length;
                    return (
                        <GroupButton
                            key={String(group.id)}
                            type="button"
                            $selected={isSelectedGroup}
                            $active={isActiveGroup}
                            $hasAvailable={hasAvailable}
                            onClick={() => handleGroupClick(group.id)}
                            disabled={!hasAvailable}
                            style={{backgroundColor: isActiveGroup ? group.color : undefined}}
                        >
                            {group.label}
                            {showGroupStats && hasAvailable && availableCount > 0 && !groupOnlyMode && (
                                <GroupBadge>{availableCount}</GroupBadge>
                            )}
                        </GroupButton>
                    );
                })}
            </GroupsContainer>

            {renderTimeSlots()}
        </Container>
    );
};