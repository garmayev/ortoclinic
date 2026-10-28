import {beforeEach, describe, expect, it, vi} from 'vitest';
import axios from 'axios';
import Company from '~/classes/Company';
import Category from '~/classes/Category';
import Account from '~/classes/Account';
import Appointment from '~/classes/Appointment';

vi.mock('axios', () => ({default: {get: vi.fn(), post: vi.fn()}}));

beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('localStorage', {getItem: (key: string) => key === 'token' ? 'mobile-token' : null});
    vi.stubEnv('VITE_COMPANY_ID', '1');
});

describe('mobile API authentication and errors', () => {
    it('filters visit history by the configured clinic and current client', async () => {
        vi.stubEnv('VITE_COMPANY_ID', '42');
        vi.stubGlobal('localStorage', {getItem: (key: string) => ({token: 'mobile-token', user_id: '123', company_id: '999'}[key] ?? null)});
        vi.mocked(axios.get).mockResolvedValue({data: []});
        await expect(Appointment.getAll()).resolves.toEqual([]);
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('/appointment/index?filter[client_id]=123&filter[company_id]=42&sort=-date'),
            expect.objectContaining({headers: expect.objectContaining({Authorization: 'Bearer mobile-token'})}),
        );
    });
    it('sends the bearer token without requiring browser cookies', async () => {
        vi.mocked(axios.get).mockResolvedValue({data: {id: 1, default_category_id: 8}});
        await Company.get(1);
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('company/view?id=1'), expect.objectContaining({
            timeout: 20000, headers: {Authorization: 'Bearer mobile-token'},
        }));
    });

    it('propagates a forbidden company instead of returning company zero', async () => {
        const error = {response: {status: 403}};
        vi.mocked(axios.get).mockRejectedValue(error);
        await expect(Company.get(1)).rejects.toBe(error);
    });

    it('bounds the category request and authenticates it', async () => {
        vi.mocked(axios.get).mockResolvedValue({data: {id: 8, services: [], children: [], schedules: []}});
        await Category.getChildrenById(8);
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('category/view?id=8'), expect.objectContaining({
            timeout: 20000, headers: {Authorization: 'Bearer mobile-token'},
        }));
    });

    it('registers in company one before any home-page storage exists', async () => {
        vi.mocked(axios.post).mockResolvedValue({data: {id: 10}});
        await Account.register({id: 123});
        expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('company_id=1'), {id: 123});
    });

    it('looks up the messenger user within the configured clinic', async () => {
        vi.mocked(axios.get).mockResolvedValue({data: null});
        await Account.checkChatId(123);
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('chat_id=123&company_id=1'), {timeout: 20000});
    });

    it('bounds loading the last appointment, including an empty response', async () => {
        vi.mocked(axios.get).mockResolvedValue({data: null});
        await expect(Appointment.last()).resolves.toBeUndefined();
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('filter[company_id]=1'), expect.objectContaining({timeout: 20000}));
    });
});
