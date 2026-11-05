import React from 'react';
import {act, create} from 'react-test-renderer';
import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import Create from '~/pages/create/route';

const state = vi.hoisted(() => ({
    company: vi.fn(), metadata: vi.fn(), directions: vi.fn(), full: vi.fn(),
    loader: {showFullscreenLoader: vi.fn(), hideLoader: vi.fn(), setShowLoader: vi.fn()},
    storage: new Map<string, string>(),
}));
vi.mock('~/classes/Company', () => ({default: {get: state.company, getForBooking: state.metadata}}));
vi.mock('~/classes/Category', () => ({default: {getChildrenById: state.full, getBookingDirections: state.directions}}));
vi.mock('~/hooks/MessengerContext', () => ({useMessenger: () => ({ready: true, isRegistered: true})}));
vi.mock('~/hooks/AppContext', () => ({useAppContext: () => ({loader: state.loader, setTheme: vi.fn(), setBarVisible: vi.fn(), setTitle: vi.fn(), setUseOpacity: vi.fn()})}));
vi.mock('react-router', () => ({useNavigate: () => vi.fn()}));
vi.mock('~/components/Card', () => ({Card: ({children, onClick}: any) => <button data-card onClick={onClick}>{children}</button>, GridContainer: ({children}: any) => <div>{children}</div>}));
vi.mock('~/components/Modal', () => ({default: Object.assign(({$visible, $onClose, children}: any) => $visible ? <div><button data-close onClick={$onClose}>Close</button>{children}</div> : null, {Control: ({children}: any) => <div>{children}</div>})}));
vi.mock('~/components/SelectList', () => ({SelectList: ({name, onChange, list}: any) => <select data-list={name} onChange={onChange}>{list.map((item: any) => <option key={item.id}>{item.title}</option>)}</select>}));
vi.mock('~/components/Calendar', () => ({Calendar: ({selectedDate, onChange}: any) => <input data-calendar value={selectedDate.getTime()} onChange={onChange}/>}));
vi.mock('~/components/TimeSlotGroup', () => ({TimeSlotGroup: () => null}));
beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('VITE_COMPANY_ID', '1');
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    state.storage.clear();
    vi.stubGlobal('localStorage', {getItem: (key: string) => state.storage.get(key) ?? null, removeItem: (key: string) => state.storage.delete(key)});
    state.company.mockResolvedValue({id: 1, default_category_id: 8});
    state.metadata.mockResolvedValue({id: 1, default_category_id: 8});
    state.directions.mockImplementation(async () => ({children: [{id: 10, title: 'Direction', services: []}, {id: 11, title: 'Another direction', services: []}]}));
    state.full.mockResolvedValue({id: 10, title: 'Direction', services: [{id: 20, title: 'Service', status: 1, getSchedule: () => undefined}]});
});
const choose = (view: ReturnType<typeof create>, id: number) => view.root.findByProps({'data-list': 'category'}).props.onChange({target: {getAttribute: () => String(id)}});
async function openDirections(view: ReturnType<typeof create>) {
    await act(async () => { view.root.findAllByProps({'data-card': true})[0].props.onClick({preventDefault() {}}); });
}

it('opens the page before service schedules are requested, then loads only the selected direction', async () => {
    let view!: ReturnType<typeof create>;
    await act(async () => { view = create(<Create />); });
    expect(state.company).not.toHaveBeenCalled();
    expect(state.directions).toHaveBeenCalledWith(8, expect.objectContaining({id: 1}));
    expect(state.full).not.toHaveBeenCalled();
    expect(state.loader.hideLoader).toHaveBeenCalled();
    await openDirections(view);
    await act(async () => { choose(view, 10); });
    expect(state.full).toHaveBeenCalledWith(10, expect.objectContaining({id: 1}));
    expect(state.full).toHaveBeenCalledTimes(1);
    await act(async () => { view.unmount(); });
});

it('keeps the original full catalogue loading path for a different company', async () => {
    vi.stubEnv('VITE_COMPANY_ID', '42');
    state.full.mockResolvedValueOnce({children: []});
    let view!: ReturnType<typeof create>;
    await act(async () => { view = create(<Create />); });
    expect(state.company).toHaveBeenCalledWith('42');
    expect(state.full).toHaveBeenCalledWith(8);
    expect(state.metadata).not.toHaveBeenCalled();
    expect(state.directions).not.toHaveBeenCalled();
    await act(async () => { view.unmount(); });
});

it('preloads only the selected direction when booking from history', async () => {
    state.storage.set('selected_category', '10');
    state.storage.set('selected_service', '20');
    let view!: ReturnType<typeof create>;
    await act(async () => { view = create(<Create />); });
    expect(state.full).toHaveBeenCalledTimes(1);
    expect(state.full).toHaveBeenCalledWith(10, expect.objectContaining({id: 1}));
    expect(state.storage.has('selected_service')).toBe(false);
    await act(async () => { view.unmount(); });
});

it('keeps selection disabled while loading, handles errors and ignores late results for an old selection', async () => {
    let finish!: (value: any) => void;
    state.full.mockReturnValueOnce(new Promise(resolve => { finish = resolve; })).mockResolvedValueOnce({id: 11, services: []});
    let view!: ReturnType<typeof create>;
    await act(async () => { view = create(<Create />); });
    await openDirections(view);
    await act(async () => { choose(view, 10); });
    expect(view.root.findByProps({role: 'status'})).toBeTruthy();
    expect(view.root.findAllByType('button').find(button => button.children.includes('Выберите услугу'))!.props.disabled).toBe(true);
    await act(async () => { choose(view, 11); });
    await act(async () => { finish({id: 10, services: []}); });
    expect(view.root.findAllByProps({role: 'status'})).toHaveLength(0);
    state.full.mockRejectedValueOnce(new Error('503'));
    await act(async () => { choose(view, 10); });
    expect(view.root.findByProps({role: 'alert'})).toBeTruthy();
    await act(async () => { view.unmount(); });
});

afterEach(() => { vi.useRealTimers(); });

it('selects tomorrow on first opening and recalculates it on reopening after midnight', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 31, 12));
    let view!: ReturnType<typeof create>;
    await act(async () => { view = create(<Create />); });
    const openCalendar = () => view.root.findAllByProps({'data-card': true})[1].props.onClick({preventDefault() {}});
    await act(async () => { openCalendar(); });
    expect(view.root.findByProps({'data-calendar': true}).props.value).toBe(new Date(2027, 0, 1).getTime());
    await act(async () => { view.root.findByProps({'data-calendar': true}).props.onChange(new Date(2027, 0, 8)); });
    expect(view.root.findByProps({'data-calendar': true}).props.value).toBe(new Date(2027, 0, 8).getTime());
    await act(async () => { view.root.findByProps({'data-close': true}).props.onClick(); });
    vi.setSystemTime(new Date(2027, 0, 1, 12));
    await act(async () => { openCalendar(); });
    expect(view.root.findByProps({'data-calendar': true}).props.value).toBe(new Date(2027, 0, 2).getTime());
    expect(view.root.findAllByType('button').find(button => button.children.includes('Сохранить'))!.props.disabled).toBe(true);
    await act(async () => { view.unmount(); });
});

it('selects tomorrow when the calendar opens directly from visit history', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 5, 19));
    state.storage.set('selected_category', '10');
    state.storage.set('selected_service', '20');
    let view!: ReturnType<typeof create>;
    await act(async () => { view = create(<Create />); });
    expect(view.root.findByProps({'data-calendar': true}).props.value).toBe(new Date(2026, 10, 6).getTime());
    await act(async () => { view.unmount(); });
});

it('explains missing clinic configuration and forces a server refresh on retry', async () => {
    state.metadata.mockResolvedValueOnce({id: 1, default_category_id: 0}).mockResolvedValueOnce({id: 1, default_category_id: 8});
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    let view!: ReturnType<typeof create>;
    await act(async () => { view = create(<Create />); });
    expect(state.directions).not.toHaveBeenCalled();
    expect(view.root.findByProps({role: 'alert'}).findByType('p').children.join('')).toContain('В настройках клиники');
    expect(log).toHaveBeenCalledWith('[Booking] load failed:', 'BookingConfigurationError');
    await act(async () => { view.root.findAllByType('button').find(button => button.children.includes('Повторить'))!.props.onClick(); });
    expect(state.metadata).toHaveBeenLastCalledWith('1', true);
    expect(state.directions).toHaveBeenCalledWith(8, expect.objectContaining({id: 1}));
    expect(view.root.findAllByProps({role: 'alert'})).toHaveLength(0);
    await act(async () => { view.unmount(); });
    log.mockRestore();
});
