import React from 'react';
import {act, create} from 'react-test-renderer';
import {beforeEach, expect, it, vi} from 'vitest';
import Home from '~/pages/home/route';
import Create from '~/pages/create/route';

const state = vi.hoisted(() => ({
    company: vi.fn(), last: vi.fn(), cancel: vi.fn(), category: vi.fn(), ready: true, registered: true,
    context: {
        setTheme: vi.fn(), setBarVisible: vi.fn(), setTitle: vi.fn(), setUseOpacity: vi.fn(),
        loader: {showFullscreenLoader: vi.fn(), hideLoader: vi.fn(), setShowLoader: vi.fn()},
    },
}));
vi.mock('~/hooks/AppContext', () => ({useAppContext: () => state.context}));
vi.mock('~/hooks/MessengerContext', () => ({useMessenger: () => ({ready: state.ready, isRegistered: state.registered})}));
vi.mock('~/classes/Company', () => ({default: {get: state.company}}));
vi.mock('~/classes/Appointment', () => ({default: {last: state.last, cancel: state.cancel}}));
vi.mock('~/classes/Category', () => ({default: {getChildrenById: state.category}}));
vi.mock('react-router', () => ({useNavigate: () => vi.fn(), NavLink: () => null}));
vi.mock('~/components/VisitCard', () => ({default: ({$visit, children}: any) => <div data-visit-id={$visit?.id}>{children}</div>}));
vi.mock('~/components/Card', () => ({Card: () => null, GridContainer: () => null}));
vi.mock('~/components/Calendar', () => ({Calendar: () => null}));
vi.mock('~/components/Modal', () => ({default: Object.assign(() => null, {Control: () => null})}));

beforeEach(() => {
    vi.clearAllMocks();
    state.ready = true; state.registered = true;
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal('localStorage', {getItem: () => null, setItem: vi.fn()});
    state.company.mockResolvedValue({id: 1, default_category_id: 8});
    state.last.mockResolvedValue(undefined);
    state.cancel.mockResolvedValue({data: true});
    state.category.mockResolvedValue({children: []});
});

for (const [name, Component] of [['home', Home], ['booking', Create]] as const) {
    it(`${name}: a departed page cannot hide the next page loader`, async () => {
        let resolve!: (value: any) => void;
        state.company.mockReturnValueOnce(new Promise(done => { resolve = done; }));
        let view: ReturnType<typeof create>;
        await act(async () => { view = create(<Component />); });
        await act(async () => { view!.unmount(); });
        state.context.loader.hideLoader.mockClear();
        await act(async () => { resolve({id: 1, default_category_id: 8}); });
        expect(state.context.loader.hideLoader).not.toHaveBeenCalled();
    });
    it(`${name}: releases the loader on a company error and supports retry`, async () => {
        state.company.mockRejectedValueOnce(new Error('403'));
        let view: ReturnType<typeof create>;
        await act(async () => { view = create(<Component />); });
        expect(state.context.loader.hideLoader).toHaveBeenCalled();
        expect(view!.root.findByProps({role: 'alert'})).toBeTruthy();
        const retry = view!.root.findAllByType('button').find(button => button.children.includes('Повторить'));
        await act(async () => { retry!.props.onClick(); });
        expect(view!.root.findAllByProps({role: 'alert'})).toHaveLength(0);
        await act(async () => { view!.unmount(); });
    });

    it(`${name}: loads when messenger readiness arrives later`, async () => {
        state.ready = false;
        let view: ReturnType<typeof create>;
        await act(async () => { view = create(<Component />); });
        expect(state.company).not.toHaveBeenCalled();
        state.ready = true;
        await act(async () => { view!.update(<Component />); });
        expect(state.company).toHaveBeenCalledTimes(1);
        expect(state.context.loader.hideLoader).toHaveBeenCalled();
        await act(async () => { view!.unmount(); });
    });
}

it('home releases the loader when the last appointment fails', async () => {
    state.last.mockRejectedValueOnce(new Error('network'));
    let view: ReturnType<typeof create>;
    await act(async () => { view = create(<Home />); });
    expect(view!.root.findByProps({role: 'alert'})).toBeTruthy();
    expect(state.context.loader.hideLoader).toHaveBeenCalled();
    await act(async () => { view!.unmount(); });
});

it('booking releases the loader when directions are not configured', async () => {
    state.company.mockResolvedValueOnce({id: 1, default_category_id: null});
    let view: ReturnType<typeof create>;
    await act(async () => { view = create(<Create />); });
    expect(state.category).not.toHaveBeenCalled();
    expect(view!.root.findByProps({role: 'alert'})).toBeTruthy();
    expect(state.context.loader.hideLoader).toHaveBeenCalled();
    await act(async () => { view!.unmount(); });
});

it('booking releases the loader when loading categories fails', async () => {
    state.category.mockRejectedValueOnce(new Error('401'));
    let view: ReturnType<typeof create>;
    await act(async () => { view = create(<Create />); });
    expect(view!.root.findByProps({role: 'alert'})).toBeTruthy();
    expect(state.context.loader.hideLoader).toHaveBeenCalled();
    await act(async () => { view!.unmount(); });
});

for (const next of [{id: 102}, undefined]) {
    it(`refreshes the last appointment after cancellation (${next ? 'another visit exists' : 'no visits remain'})`, async () => {
        state.last.mockResolvedValueOnce({id: 101}).mockResolvedValueOnce(next);
        let view: ReturnType<typeof create>;
        await act(async () => { view = create(<Home />); });
        const cancel = view!.root.findAllByType('button').find(button => button.children.includes('Отменить'))!;
        await act(async () => { await cancel.props.onClick(); });
        expect(state.cancel).toHaveBeenCalledWith(101);
        expect(state.last).toHaveBeenCalledTimes(2);
        expect(state.cancel.mock.invocationCallOrder[0]).toBeLessThan(state.last.mock.invocationCallOrder[1]);
        expect(view!.root.findAllByProps({'data-visit-id': 101})).toHaveLength(0);
        if (next) expect(view!.root.findByProps({'data-visit-id': 102})).toBeTruthy();
        else expect(view!.root.findAllByType('button').some(button => button.children.includes('Записаться на прием'))).toBe(true);
        await act(async () => { view!.unmount(); });
    });
}

it('keeps the current visit when cancellation fails and allows another attempt', async () => {
    state.last.mockResolvedValueOnce({id: 101});
    state.cancel.mockRejectedValueOnce(new Error('503'));
    let view: ReturnType<typeof create>;
    await act(async () => { view = create(<Home />); });
    await act(async () => {
        await view!.root.findAllByType('button').find(button => button.children.includes('Отменить'))!.props.onClick();
    });
    expect(state.last).toHaveBeenCalledTimes(1);
    expect(view!.root.findByProps({'data-visit-id': 101})).toBeTruthy();
    expect(view!.root.findByProps({role: 'alert'})).toBeTruthy();
    expect(view!.root.findAllByType('button').find(button => button.children.includes('Отменить'))!.props.disabled).toBe(false);
    await act(async () => { view!.unmount(); });
});

it('does not restore the cancelled visit if refreshing fails; retry can load the next visit', async () => {
    state.last.mockResolvedValueOnce({id: 101}).mockRejectedValueOnce(new Error('503')).mockResolvedValueOnce({id: 102});
    let view: ReturnType<typeof create>;
    await act(async () => { view = create(<Home />); });
    await act(async () => { await view!.root.findAllByType('button').find(button => button.children.includes('Отменить'))!.props.onClick(); });
    expect(view!.root.findAllByProps({'data-visit-id': 101})).toHaveLength(0);
    expect(view!.root.findByProps({role: 'alert'})).toBeTruthy();
    await act(async () => { view!.root.findAllByType('button').find(button => button.children.includes('Повторить'))!.props.onClick(); });
    expect(view!.root.findByProps({'data-visit-id': 102})).toBeTruthy();
    await act(async () => { view!.unmount(); });
});

it('ignores duplicate cancellation clicks and does not refresh a departed page', async () => {
    let finish!: (value: any) => void;
    state.last.mockResolvedValueOnce({id: 101});
    state.cancel.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    let view: ReturnType<typeof create>;
    let pending!: Promise<void>;
    await act(async () => { view = create(<Home />); });
    const click = view!.root.findAllByType('button').find(button => button.children.includes('Отменить'))!.props.onClick;
    await act(async () => { pending = click(); void click(); });
    expect(state.cancel).toHaveBeenCalledTimes(1);
    expect(view!.root.findAllByType('button').find(button => button.children.includes('Отменить'))!.props.disabled).toBe(true);
    await act(async () => { view!.unmount(); });
    await act(async () => { finish({data: true}); await pending; });
    expect(state.last).toHaveBeenCalledTimes(1);
});
