import React from 'react';
import {act, create} from 'react-test-renderer';
import {beforeEach, expect, it, vi} from 'vitest';
import Home from '~/pages/home/route';
import Create from '~/pages/create/route';

const state = vi.hoisted(() => ({
    company: vi.fn(), last: vi.fn(), category: vi.fn(), ready: true, registered: true,
    context: {
        setTheme: vi.fn(), setBarVisible: vi.fn(), setTitle: vi.fn(), setUseOpacity: vi.fn(),
        loader: {showFullscreenLoader: vi.fn(), hideLoader: vi.fn(), setShowLoader: vi.fn()},
    },
}));
vi.mock('~/hooks/AppContext', () => ({useAppContext: () => state.context}));
vi.mock('~/hooks/MessengerContext', () => ({useMessenger: () => ({ready: state.ready, isRegistered: state.registered})}));
vi.mock('~/classes/Company', () => ({default: {get: state.company}}));
vi.mock('~/classes/Appointment', () => ({default: {last: state.last}}));
vi.mock('~/classes/Category', () => ({default: {getChildrenById: state.category}}));
vi.mock('react-router', () => ({useNavigate: () => vi.fn(), NavLink: () => null}));
vi.mock('~/components/VisitCard', () => ({default: () => null}));
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
