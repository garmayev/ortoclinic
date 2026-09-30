// app/hooks/MaxContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

interface MaxUser {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    [key: string]: any;
}

interface MaxWebApp {
    ready: () => void;
    expand: () => void;
    close: () => void;
    sendData: (data: any) => void;
    initData?: string;
    initDataUnsafe?: {
        user?: MaxUser;
        [key: string]: any;
    };
    [key: string]: any;
}

interface MaxContextType {
    webApp: MaxWebApp | null;
    user: MaxUser | null;
    ready: boolean;
    isMax: boolean;
    isRegistered: boolean;
    setIsRegistered: (value: boolean) => void;
}

const MaxContext = createContext<MaxContextType | null>(null);

export const useMax = () => {
    const context = useContext(MaxContext);
    if (!context) {
        throw new Error('useMax must be used within MaxProvider');
    }
    return context;
};

export const MaxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [webApp, setWebApp] = useState<MaxWebApp | null>(null);
    const [user, setUser] = useState<MaxUser | null>(null);
    const [ready, setReady] = useState(false);
    const [isMax, setIsMax] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        let initAttempts = 0;
        const maxAttempts = 50;

        // Проверка наличия Max WebApp
        const checkMaxWebApp = () => {
            // Проверяем различные варианты расположения Max API
            if (window.Max?.WebApp) {
                return window.Max.WebApp;
            }
            if ((window as any).MaxWebApp) {
                return (window as any).MaxWebApp;
            }
            if ((window as any).maxWebApp) {
                return (window as any).maxWebApp;
            }
            return null;
        };

        const initMax = () => {
            const max = checkMaxWebApp();

            if (max) {
                try {
                    // Инициализация Max WebApp
                    if (max.initData || max.initDataUnsafe) {
                        max.ready();
                        max.expand();

                        setWebApp(max);
                        setUser(max.initDataUnsafe?.user || null);
                        setIsMax(true);
                        setReady(true);
                        return true;
                    } else {
                        console.warn('Max WebApp найден, но нет initData');
                    }
                } catch (error) {
                    console.error('Ошибка при инициализации Max:', error);
                }
            }
            return false;
        };

        // Немедленная проверка
        if (initMax()) {
            return;
        }

        // Загрузка скрипта Max
        const loadMaxScript = () => {
            return new Promise((resolve, reject) => {
                if (document.querySelector('script[src*="max-web-app"]')) {
                    resolve(null);
                    return;
                }

                const script = document.createElement('script');
                script.src = '/js/max-web-app.js';
                script.async = true;

                script.onload = () => {
                    setTimeout(resolve, 100);
                };

                script.onerror = (error) => {
                    console.error('Ошибка загрузки скрипта Max:', error);
                    reject(error);
                };

                document.head.appendChild(script);
            });
        };

        // Интервал повторных попыток
        const intervalId = setInterval(async () => {
            initAttempts++;

            if (initMax()) {
                clearInterval(intervalId);
                clearTimeout(timeoutId);
                return;
            }

            if (initAttempts === 10) {
                try {
                    await loadMaxScript();
                } catch (error) {
                    console.error('Не удалось загрузить скрипт Max');
                }
            }

            if (initAttempts >= maxAttempts) {
                console.warn('Не удалось инициализировать Max WebApp после всех попыток');

                const isMaxEnv = navigator.userAgent.includes('Max') ||
                    navigator.userAgent.includes('MaxMessenger') ||
                    (window as any).Max !== undefined;

                setIsMax(isMaxEnv);
                setReady(true);
                clearInterval(intervalId);
                clearTimeout(timeoutId);
            }
        }, 500);

        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            if (!ready) {
                if (!initMax()) {
                    setIsMax(false);
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
        isMax,
        isRegistered,
        setIsRegistered
    };

    return (
        <MaxContext.Provider value={value}>
            {children}
        </MaxContext.Provider>
    );
};