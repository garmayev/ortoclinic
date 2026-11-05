import React from 'react';
import {act, create} from 'react-test-renderer';
import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import {Calendar} from '~/components/Calendar';

beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 30, 12));
});
afterEach(() => { vi.useRealTimers(); });

it('updates both the highlighted day and visible month when the parent resets the date', async () => {
    const onChange = vi.fn();
    let view!: ReturnType<typeof create>;
    await act(async () => { view = create(<Calendar selectedDate={new Date(2027, 1, 12)} onChange={onChange}/>); });
    const selected = () => view.root.findAll(node => node.type === 'div' && /(?:^| )selected(?: |$)/.test(node.props.className || ''));
    expect(selected()[0].children).toEqual(['12']);
    await act(async () => { view.update(<Calendar selectedDate={new Date(2026, 11, 31)} onChange={onChange}/>); });
    expect(selected()).toHaveLength(1);
    expect(selected()[0].children).toEqual(['31']);
    expect(view.root.findAllByType('span').some(node => node.children.join('') === 'Декабрь 2026')).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
    await act(async () => { view.unmount(); });
});
