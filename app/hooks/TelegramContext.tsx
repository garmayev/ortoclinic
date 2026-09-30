import React, { createContext, useContext, useEffect, useState } from 'react';

interface TelegramContextType {
    webApp: any;
    user: any;
    ready: boolean;
    isTelegram: boolean;
    isRegistered: boolean;
    setIsRegistered: (value: boolean) => void;
}

const TelegramContext = createContext<TelegramContextType | null>(null);

export const useTelegram = () => {
    const context = useContext(TelegramContext);
    if (!context) {
        throw new Error('useTelegram must be used within TelegramProvider');
    }
    return context;
};

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [webApp, setWebApp] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [ready, setReady] = useState(false);
    const [isTelegram, setIsTelegram] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false)

    useEffect(() => {
        let initAttempts = 0;
        const maxAttempts = 50; // Увеличиваем количество попыток

        // Функция для проверки наличия Telegram WebApp
        const checkTelegramWebApp = () => {
            // Проверяем все возможные места где может быть Telegram API
            if (window.Telegram?.WebApp) {
                return window.Telegram.WebApp;
            }

            // Проверяем глобальный объект Telegram (некоторые версии используют это)
            if ((window as any).TelegramWebApp) {
                return (window as any).TelegramWebApp;
            }

            return null;
        };

        const initTelegram = () => {
            const tg = checkTelegramWebApp();

            if (tg) {
                try {
                    // Проверяем, что это действительно Telegram
                    if (tg.initData || tg.initDataUnsafe) {
                        tg.ready();
                        tg.expand();

                        setWebApp(tg);
                        setUser(tg.initDataUnsafe?.user || null);
                        setIsTelegram(true);
                        setReady(true);
                        return true;
                    } else {
                        console.warn('Telegram WebApp найден, но нет initData');
                    }
                } catch (error) {
                    console.error('Ошибка при инициализации Telegram:', error);
                }
            }

            return false;
        };

        // Проверяем сразу
        if (initTelegram()) {
            return;
        }

        // Функция для принудительной загрузки скрипта
        const loadTelegramScript = () => {
            return new Promise((resolve, reject) => {
                // Проверяем, не загружен ли уже скрипт
                if (document.querySelector('script[src*="telegram-web-app"]')) {
                    resolve(null);
                    return;
                }

                // Создаем новый скрипт
                const script = document.createElement('script');
                script.src = '/js/telegram-web-app.js'; // Используем старую версию
                script.async = true;

                script.onload = () => {
                    // Даем время на инициализацию
                    setTimeout(resolve, 100);
                };

                script.onerror = (error) => {
                    console.error('Ошибка загрузки скрипта Telegram:', error);
                    reject(error);
                };

                document.head.appendChild(script);
            });
        };

        // Устанавливаем интервал для повторных попыток
        const intervalId = setInterval(async () => {
            initAttempts++;

            if (initTelegram()) {
                clearInterval(intervalId);
                clearTimeout(timeoutId);
                return;
            }

            if (initAttempts === 10) {
                // После 3 неудачных попыток пробуем перезагрузить скрипт
                try {
                    await loadTelegramScript();
                } catch (error) {
                    console.error('Не удалось загрузить скрипт Telegram');
                }
            }

            if (initAttempts >= maxAttempts) {
                console.warn('Не удалось инициализировать Telegram WebApp после всех попыток');

                // Проверяем, может мы вообще не в Telegram
                const isTelegramEnv = navigator.userAgent.includes('Telegram') ||
                    (window as any).Telegram !== undefined;

                setIsTelegram(isTelegramEnv);
                setReady(true);
                clearInterval(intervalId);
                clearTimeout(timeoutId);
            }
        }, 500);

        // Таймаут на случай, если что-то пошло не так
        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            if (!ready) {
                // Последняя проверка
                if (!initTelegram()) {
                    setIsTelegram(false);
                    setReady(true);
                }
            }
        }, 10000);

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, []);

    const value = {
        webApp,
        user,
        ready,
        isTelegram,
        isRegistered,
        setIsRegistered
    };

    return (
        <TelegramContext.Provider value={value}>
            {children}
        </TelegramContext.Provider>
    );
};