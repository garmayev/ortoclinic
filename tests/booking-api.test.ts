import {beforeEach, expect, it, vi} from 'vitest';
import axios from 'axios';
import Company from '~/classes/Company';
import Category, {BOOKING_DIRECTION_FIELDS} from '~/classes/Category';
import {isBookingOptimizationEnabled} from '~/bookingOptimization';

vi.mock('axios', () => ({default: {get: vi.fn()}}));
let token = '';
beforeEach(() => {
    vi.resetAllMocks();
    token = `synthetic-${Math.random()}`;
    vi.stubGlobal('localStorage', {getItem: (key: string) => key === 'token' ? token : key === 'user_id' ? '100' : null});
    vi.stubEnv('VITE_COMPANY_ID', '1');
});
const companyData = {id: 1, title: 'Synthetic clinic', default_category_id: 8, logo: '', branches: []};
const company = () => new Company(companyData);

it('reuses only clinic metadata already loaded by the home page, and invalidates on user change', async () => {
    vi.mocked(axios.get).mockResolvedValue({data: companyData});
    await Company.get(1);
    await Company.getForBooking(1);
    expect(axios.get).toHaveBeenCalledTimes(1);
    token = 'another-synthetic-session';
    await Company.getForBooking(1);
    expect(axios.get).toHaveBeenCalledTimes(2);
});

it('keeps the previous request behaviour for other clinic builds', async () => {
    vi.stubEnv('VITE_COMPANY_ID', '42');
    expect(isBookingOptimizationEnabled()).toBe(false);
    vi.mocked(axios.get).mockResolvedValue({data: {...companyData, id: 42}});
    await Company.get(42);
    await Company.getForBooking(42);
    expect(axios.get).toHaveBeenCalledTimes(2);
});

it('loads only direction labels initially, without extra company lookups', async () => {
    const compact = {id: 8, title: 'Catalogue', company_id: 1, children: [{id: 10, title: 'Direction', company_id: 1, status: 1}]};
    vi.mocked(axios.get).mockResolvedValue({data: compact});
    const result = await Category.getBookingDirections(8, company());
    expect(axios.get).toHaveBeenCalledTimes(1);
    const [url] = vi.mocked(axios.get).mock.calls[0];
    expect(new URL(url).searchParams.get('fields')).toBe(BOOKING_DIRECTION_FIELDS);
    expect(BOOKING_DIRECTION_FIELDS).not.toContain('services');
    expect(result.children[0].title).toBe('Direction');
    expect(result.children[0].services).toEqual([]);
    expect(result.children[0].company?.id).toBe(1);
});

it('preserves complete service data and weekly schedules when a direction is selected', async () => {
    const schedules = {1: {is_working: 1, start_time: '09:00', end_time: '18:00', break_start: '13:00', break_end: '14:00'}};
    const services = [1, 0].map((status, i) => ({id: 20 + i, title: 'Service', status, category_id: 10, price: '1234', summary: 'Summary', schedules}));
    vi.mocked(axios.get).mockResolvedValue({data: {id: 10, company_id: 1, title: 'Direction', children: [], services, schedules}});
    const result = await Category.getChildrenById(10, company());
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(vi.mocked(axios.get).mock.calls[0][0]).not.toContain('fields=');
    expect(result.services.map((item: any) => [item.id, item.status, item.price])).toEqual([[20, 1, '1234'], [21, 0, '1234']]);
    expect((result.services[0] as any).getSchedule(new Date(2026, 9, 26))).toEqual(schedules[1]);
});

it('falls back on unsupported field projections, but does not double failed 503 requests', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce({response: {status: 400}}).mockResolvedValueOnce({data: {id: 8, company_id: 1, services: [], children: []}});
    await Category.getBookingDirections(8, company());
    expect(axios.get).toHaveBeenCalledTimes(2);
    vi.mocked(axios.get).mockClear().mockRejectedValueOnce({response: {status: 503}});
    await expect(Category.getBookingDirections(8, company())).rejects.toEqual({response: {status: 503}});
    expect(axios.get).toHaveBeenCalledTimes(1);
});

it('falls back on an incomplete projection instead of showing a falsely empty catalogue', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({data: {id: 8, company_id: 1}}).mockResolvedValueOnce({data: {
        id: 8, company_id: 1, services: [], children: [{id: 10, title: 'Preserved direction', company_id: 1, services: [], children: []}],
    }});
    const result = await Category.getBookingDirections(8, company());
    expect(result.children[0].title).toBe('Preserved direction');
    expect(axios.get).toHaveBeenCalledTimes(2);
});
