export function catalog(count = 4) {
    const schedules = Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i + 1, {
        is_working: 1, start_time: '09:00', end_time: '18:00', break_start: null, break_end: null,
    }]));
    return {
        id: 9000, title: 'Тестовый каталог', company_id: 9001, status: 1, source: 'stand', services: [], schedules, children: [
            { id: 9010, title: 'Тестовое направление', company_id: 9001, status: 1, source: 'stand', children: [], schedules,
                services: Array.from({ length: count }, (_, i) => ({
                    id: 9100 + i, title: i === 1 ? 'Тестовая услуга с очень длинным названием для проверки отображения на маленьком экране '.repeat(3) : `Тестовая услуга ${i + 1}`,
                    company_id: 9001, category_id: 9010, status: i === 2 ? 0 : 1,
                    duration: 30, price: String(1000 + i), price_max: 2000 + i, price_unit: 'приём',
                    summary: '', description: '', schedules,
                })),
            },
        ],
    };
}

export function apiFixture(path, params, config) {
    if (path.includes('/appointment/create') || path.includes('/appointment/cancel') || path.includes('/user/register')) {
        return { status: 409, data: { error: 'Запись, отмена и регистрация на стенде отключены' } };
    }
    if (config.apiError === '503') return { status: 503, data: { error: 'Synthetic 503' } };
    const root = catalog(config.catalog === 'empty' ? 0 : config.catalog === 'large' ? 1000 : 4);
    if (path === '/api/category/view' && params.has('fields')) {
        const direction = ({id, title, company_id, status, source}) => ({id, title, company_id, status, source});
        return {status: 200, data: {...direction(root), children: root.children.map(direction)}};
    }
    const routes = {
        '/api/company/view': { id: 9001, title: 'Синтетическая клиника — стенд', logo: '', default_category_id: 9000, branches: [] },
        '/api/user/check-chat-id': { id: Number(config.user || 900001), username: 'stand_user', access_token: 'stand-only-not-a-real-token' },
        '/api/category/view': Number(params.get('id')) === 9010 ? root.children[0] : root,
        '/api/category/time-slots': [], '/api/branch/availability': [],
        '/api/appointment/last': null, '/api/appointment/index': [], '/api/promo/index': [],
    };
    return path in routes ? { status: 200, data: routes[path] } : { status: 404, data: { error: 'Unknown synthetic API' } };
}
