// app/hooks/MessengerContext.tsx

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import Account from "~/classes/Account";

export type MessengerType = 'telegram' | 'max' | 'none';

interface MessengerUser {
    id: number | string;
    username?: string;
    first_name?: string;
    lastName?: string;
    firstName?: string;
    phone?: string;
}

interface MessengerWebApp {
    ready: () => void;
    expand: () => void;
    close: () => void;
    sendData: (data: any) => void;
    requestContact?: () => Promise<any>;
    initData?: string;
    initDataUnsafe?: {
        user?: MessengerUser;
    };
}

interface MessengerContextType {
    messengerType: MessengerType;
    webApp: MessengerWebApp | null;
    user: MessengerUser | null;
    ready: boolean;
    isRegistered: boolean;
    isInMessenger: boolean;
    register: (phoneNumber?: string) => Promise<{ success: boolean; token?: string; error?: string }>;
    checkUserExists: () => Promise<boolean>;
    requestPhoneNumber: () => Promise<string | null>;
}

const MessengerContext = createContext<MessengerContextType | null>(null);

declare global {
    interface Window {
        __MESSENGER_DATA__: MessengerWebApp;
        __MESSENGER_INITIALIZED__: boolean
        __MESSENGER_CALLBACKS__: Array<() => void>
    }
}

export const useMessenger = () => {
    const context = useContext(MessengerContext);
    if (!context) {
        throw new Error('useMessenger must be used within MessengerProvider');
    }
    return context;
};

// Преобразование пользователя из разных мессенджеров в единый формат
const normalizeUser = (user: any, type: MessengerType): MessengerUser | null => {
    if (!user) return null;
    
    console.log('[normalizeUser] Input:', { user, type });
    
    if (type === 'telegram') {
        const normalized = {
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            lastName: user.last_name,
        };
        console.log('[normalizeUser] Telegram normalized:', normalized);
        return normalized;
    } else if (type === 'max') {
        const normalized = {
            id: user.id,
            username: user.username,
            firstName: user.firstName || user.first_name,
            lastName: user.lastName || user.last_name,
            first_name: user.firstName || user.first_name,
        };
        console.log('[normalizeUser] Max normalized:', normalized);
        return normalized;
    }
    
    return null;
};

// Обертка для унификации WebApp API
const createWebAppWrapper = (webApp: any, type: MessengerType): MessengerWebApp | null => {
    if (!webApp) return null;

    return {
        ready: () => webApp.ready?.(),
        expand: () => webApp.expand?.(),
        close: () => webApp.close?.(),
        sendData: (data: any) => webApp.sendData?.(data),
        requestContact: type === 'telegram' ? undefined : webApp.requestContact?.bind(webApp),
        initData: webApp.initData,
        initDataUnsafe: webApp.initDataUnsafe
    };
};

export const MessengerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<{
        messengerType: MessengerType;
        webApp: MessengerWebApp | null;
        user: MessengerUser | null;
        ready: boolean;
    }>({
        messengerType: 'none',
        webApp: null,
        user: null,
        ready: false
    });
    
    const [isRegistered, setIsRegistered] = useState(false);
    const initializedRef = useRef(false);

    // Инициализация из глобальных данных
    const initializeFromData = (data: any) => {
        if (initializedRef.current) {
            console.log('[MessengerProvider] Already initialized, skipping');
            return true;
        }

        if (data?.ready && data?.type && data?.type !== 'none') {
            const type = data.type as MessengerType;
            const rawUser = data.user || data.webApp?.initDataUnsafe?.user;

            const user = normalizeUser(rawUser, type);

            if (user && user.id) {
                const webApp = createWebAppWrapper(data.webApp, type);
                
                setState({
                    messengerType: type,
                    webApp: webApp,
                    user: user,
                    ready: true
                });
                
                initializedRef.current = true;
                return true;
            } else {
                console.warn('[MessengerProvider] ❌ No valid user in data', { rawUser, user, data });
            }
        }
        
        return false;
    };

    // Проверка глобальных данных
    const checkAndInitialize = () => {
        if (initializedRef.current) return true;
        
        console.log('[MessengerProvider] Checking global data...');
        console.log('[MessengerProvider] window.__MESSENGER_DATA__:', window.__MESSENGER_DATA__);
        
        if (!!window.__MESSENGER_DATA__?.ready) {
            console.log('[MessengerProvider] Found existing global data');
            return initializeFromData(window.__MESSENGER_DATA__);
        }
        
        console.log('[MessengerProvider] No global data available yet');
        return false;
    };

    // Регистрация колбэка для отложенной инициализации
    const registerCallback = () => {
        return new Promise<void>((resolve) => {
            const callback = () => {
                console.log('[MessengerProvider] Callback triggered');
                if (checkAndInitialize()) {
                    resolve();
                }
            };
            
            if (!window.__MESSENGER_CALLBACKS__) {
                window.__MESSENGER_CALLBACKS__ = [];
            }
            window.__MESSENGER_CALLBACKS__.push(callback);
            
            // Если данные уже есть, вызываем callback немедленно
            if (!!window.__MESSENGER_DATA__?.ready) {
                console.log('[MessengerProvider] Data already ready, calling callback immediately');
                callback();
            }
        });
    };

    // Основная инициализация
    useEffect(() => {
        console.log('[MessengerProvider] Component mounted, starting initialization...');
        document.addEventListener("DOMContentLoaded", () => {
            window.addEventListener("max:ready", (data) => {
                console.log("[MessengerProvider][max]", data);
            })
            window.addEventListener("telegram:ready", (data) => {
                console.log("[MessengerProvider][telegram]", data)
            })
        });
        const init = async () => {
            // Сначала проверяем, нет ли уже готовых данных
            if (checkAndInitialize()) {
                console.log('[MessengerProvider] ✅ Initialized from existing data');
                return;
            }
            
            // Если данных нет, регистрируем callback и ждем
            console.log('[MessengerProvider] No data yet, waiting for callback...');
            await registerCallback();
            console.log('[MessengerProvider] Callback completed, initialization done');
        };
        
        init();
        
        // Дополнительная проверка через интервал (на случай, если callback не сработал)
        const interval = setInterval(() => {
            if (!initializedRef.current && !!window.__MESSENGER_DATA__?.ready) {
                console.log('[MessengerProvider] Interval check found data');
                initializeFromData(window.__MESSENGER_DATA__);
            }
        }, 200);
        
        // Таймаут на случай, если ничего не сработало
        const timeout = setTimeout(() => {
            if (!initializedRef.current) {
                console.warn('[MessengerProvider] Timeout - forcing ready state with no user');
                setState(prev => ({ ...prev, ready: true }));
            }
            clearInterval(interval);
        }, 15000);
        
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    // Запрос номера телефона
    const requestPhoneNumber = (): Promise<string | null> => {
        return new Promise((resolve) => {
            try {
                const webApp = state.webApp;
                
                if (webApp?.requestContact) {
                    console.log('[requestPhoneNumber] Calling webApp.requestContact');
                    webApp.requestContact().then((result: any) => {
                        console.log('[requestPhoneNumber] Result:', result);
                        if (result?.phone_number) {
                            resolve(result.phone_number);
                        } else if (result?.responseUnsafe?.contact?.phone_number) {
                            resolve(result.responseUnsafe.contact.phone_number);
                        } else {
                            resolve(null);
                        }
                    }).catch((error: any) => {
                        console.error('[requestPhoneNumber] Error:', error);
                        resolve(null);
                    });
                } else {
                    console.warn('[requestPhoneNumber] requestContact not available');
                    resolve(null);
                }
            } catch (error) {
                console.error('[requestPhoneNumber] Error:', error);
                resolve(null);
            }
        });
    };

    // Проверка существования пользователя
    const checkUserExists = async (): Promise<boolean> => {
        if (!state.user?.id) {
            console.log('[checkUserExists] No user id available');
            return false;
        }
        
        const existingToken = localStorage.getItem("token");
        if (existingToken) {
            setIsRegistered(true);
            return true;
        }

        try {
            const chatId = state.user.id.toString();
            console.log(`[checkUserExists] Checking user with id: ${chatId}`);
            const response = await Account.checkChatId(Number(chatId));

            if (response?.access_token) {
                localStorage.setItem("token", response.access_token);
                localStorage.setItem("user_id", response.id?.toString() || chatId);
                setIsRegistered(true);
                console.log('[checkUserExists] User found, token saved');
                return true;
            } else {
                console.log('[checkUserExists] User not found on server');
            }
        } catch (error) {
            console.error("Error checking user:", error);
        }
        return false;
    };

    // Регистрация пользователя
    const register = async (phoneNumber?: string): Promise<{ success: boolean; token?: string; error?: string }> => {
        if (!state.user?.id) {
            console.error('[register] No user data available');
            return { success: false, error: "No user data" };
        }

        const privacy = localStorage.getItem("privacy") === "true";
        const policy = localStorage.getItem("policy") === "true";

        try {
            const userData = {
                id: state.user.id,
                username: state.user.username,
                first_name: state.user.first_name || state.user.firstName,
                last_name: state.user.lastName,
                phone: phoneNumber || null,
                privacy_accepted: privacy,
                policy_accepted: policy
            };

            const response = await Account.register(userData);

            if (response?.access_token) {
                localStorage.setItem("token", response.access_token);
                localStorage.setItem("user_id", response.id?.toString() || state.user.id.toString());
                localStorage.setItem("privacy", privacy.toString());
                localStorage.setItem("policy", policy.toString());
                setIsRegistered(true);
                console.log('[register] Registration successful');
                return { success: true, token: response.access_token };
            }

            return { success: false, error: "Registration failed - no token in response" };
        } catch (error) {
            console.error("Registration error:", error);
            return { success: false, error: String(error) };
        }
    };

    // Проверяем регистрацию при готовности
    useEffect(() => {
        if (state.ready && state.user?.id) {
            console.log(state);
            checkUserExists();
        }
    }, [state.ready, state.user]);

    const isInMessenger = state.messengerType !== 'none';
    const finalIsRegistered = isRegistered || !!localStorage.getItem("token");

    const contextValue: MessengerContextType = {
        messengerType: state.messengerType,
        webApp: state.webApp,
        user: state.user,
        ready: state.ready,
        isRegistered: finalIsRegistered,
        isInMessenger,
        checkUserExists,
        register,
        requestPhoneNumber
    };

    return (
        <MessengerContext.Provider value={contextValue}>
            {children}
        </MessengerContext.Provider>
    );
};