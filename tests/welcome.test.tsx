import React from 'react';
import {act, create} from 'react-test-renderer';
import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import Welcome from '~/pages/welcome/index';

const state = vi.hoisted(() => ({
    check: vi.fn(), register: vi.fn(), contact: vi.fn(), navigate: vi.fn(),
    user: {id: 123},
    loader: {setLoaderPosition: vi.fn(), setShowLoader: vi.fn(), showFullscreenLoader: vi.fn(), setLoaderConfig: vi.fn()},
}));
vi.mock('~/hooks/AppContext', () => ({useAppContext: () => ({setTheme: vi.fn(), loader: state.loader})}));
vi.mock('~/hooks/MessengerContext', () => ({useMessenger: () => ({
    ready: true, user: state.user, webApp: {requestContact: state.contact},
    checkUserExists: state.check, register: state.register,
})}));
vi.mock('react-router', () => ({useNavigate: () => state.navigate}));

let view: ReturnType<typeof create>;
beforeEach(() => {
    vi.clearAllMocks(); vi.useFakeTimers();
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal('localStorage', {getItem: () => 'true', setItem: vi.fn()});
    state.check.mockResolvedValue(false);
    state.register.mockResolvedValue({success: true});
    state.contact.mockResolvedValue({phone: '+70000000000'});
});
afterEach(async () => {
    if (view) await act(async () => { view.unmount(); });
    vi.useRealTimers();
});

async function openWelcome() {
    await act(async () => { view = create(<Welcome />); });
}

it('shows registration after a successful lookup with no linked account', async () => {
    await openWelcome();
    expect(view.root.findByType('button').children).toContain('Продолжить');
    expect(state.loader.setShowLoader).toHaveBeenLastCalledWith(false);
});

it('continues to home when the linked account exists', async () => {
    state.check.mockResolvedValue(true);
    await openWelcome();
    expect(state.navigate).toHaveBeenCalledWith('/home');
    expect(vi.getTimerCount()).toBe(0);
});

it('registers using the shared contact and stored consent', async () => {
    await openWelcome();
    await act(async () => { await view.root.findByType('button').props.onClick(); });
    expect(localStorage.setItem).toHaveBeenCalledWith('policy', 'true');
    expect(localStorage.setItem).toHaveBeenCalledWith('privacy', 'true');
    expect(state.register).toHaveBeenCalledWith('+70000000000');
    expect(state.navigate).toHaveBeenCalledWith('/home');
});

it('shows an actionable error if contact sharing is declined', async () => {
    state.contact.mockResolvedValue({});
    await openWelcome();
    await act(async () => { await view.root.findByType('button').props.onClick(); });
    expect(view.root.findByProps({role: 'alert'}).children.join('')).toContain('номер телефона');
    expect(state.register).not.toHaveBeenCalled();
    expect(view.root.findByType('button').props.disabled).toBe(false);
});
