export function detectMessenger(location, userAgent, host) {
    const query = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
    const explicit = query.get('platform');
    if (explicit === 'none') return 'none';
    if (explicit === 'max' || explicit === 'telegram') return explicit;
    if (query.has('WebAppData') || hash.has('WebAppData') || /MaxMessenger/i.test(userAgent)) return 'max';
    if (query.has('tgWebAppData') || hash.has('tgWebAppData') || /TelegramMessenger/i.test(userAgent)) return 'telegram';
    if (host.WebApp?.initDataUnsafe?.user || host.Max?.WebApp?.initDataUnsafe?.user || host.MaxWebApp?.initDataUnsafe?.user) return 'max';
    if (host.Telegram?.WebApp?.initDataUnsafe?.user) return 'telegram';
    try {
        if (host.sessionStorage?.getItem('WebAppData')) return 'max';
        if (JSON.parse(host.sessionStorage?.getItem('__telegram__initParams') || 'null')?.tgWebAppData) return 'telegram';
    } catch { /* Storage may be unavailable in a webview. */ }
    return 'none';
}

export function loadSdk(document, src, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.async = true;
        script.src = src;
        const finish = (error) => {
            clearTimeout(timer);
            script.onload = script.onerror = null;
            if (error) {
                script.remove();
                reject(error);
            } else resolve();
        };
        const timer = setTimeout(() => finish(new Error('SDK timeout')), timeoutMs);
        script.onload = () => finish();
        script.onerror = () => finish(new Error('SDK load failed'));
        document.head.appendChild(script);
    });
}

export async function initializeMessenger(host = window, document = host.document, baseUrl = import.meta.env.BASE_URL) {
    const type = detectMessenger(host.location, host.navigator.userAgent, host);
    let webApp = null;
    if (type !== 'none') {
        await loadSdk(document, type === 'telegram'
            ? (import.meta.env?.MODE === 'stand' ? '/__stand/sdk/telegram.js' : `${baseUrl}js/telegram-web-app.js`)
            : (import.meta.env?.MODE === 'stand' ? '/__stand/sdk/max.js' : 'https://st.max.ru/js/max-web-app.js'));
        // Read the SDK global only after the load event, including on retries.
        webApp = type === 'telegram' ? host.Telegram?.WebApp
            : host.Max?.WebApp || host.WebApp || host.MaxWebApp;
        if (!webApp?.initDataUnsafe?.user?.id || !webApp?.initData) {
            throw new Error('SDK user data unavailable');
        }
        const owner = `${type}:${webApp.initDataUnsafe.user.id}`;
        if (host.localStorage.getItem('messenger_token_owner') !== owner) {
            host.localStorage.removeItem('token');
            host.localStorage.removeItem('user_id');
        }
        host.localStorage.setItem('messenger_token_owner', owner);
        webApp.ready?.();
        webApp.expand?.();
    }
    host.__MESSENGER_DATA__ = {
        ready: true, type, webApp, user: webApp?.initDataUnsafe?.user || null,
        initData: webApp?.initData || null, initDataUnsafe: webApp?.initDataUnsafe || null,
    };
    host.__MESSENGER_INITIALIZED__ = true;
    host.__MESSENGER_CALLBACKS__ = host.__MESSENGER_CALLBACKS__ || [];
}
