export {};

declare global {
    interface Window {
        Telegram?: {
            WebApp: {
                initData: string;
                initDataUnsafe: {
                    query_id?: string;
                    user?: {
                        id: number;
                        first_name: string;
                        last_name?: string;
                        username?: string;
                        language_code?: string;
                        photo_url?: string;
                    };
                    auth_date?: string;
                    hash?: string;
                };
                colorScheme: 'light' | 'dark';
                themeParams: {
                    bg_color: string;
                    text_color: string;
                    hint_color: string;
                    link_color: string;
                    button_color: string;
                    button_text_color: string;
                };
                backgroundColor: string;
                textColor: string;
                buttonColor: string;
                buttonTextColor: string;

                ready: () => void;
                expand: () => void;
                close: () => void;
                sendData: (data: string) => void;
                showAlert: (message: string) => void;
                showConfirm: (message: string) => void;
                showPopup: (params: any) => void;

                MainButton: {
                    text: string;
                    color: string;
                    textColor: string;
                    isVisible: boolean;
                    isActive: boolean;
                    show: () => void;
                    hide: () => void;
                    enable: () => void;
                    disable: () => void;
                    setText: (text: string) => void;
                    onClick: (callback: () => void) => void;
                };

                HapticFeedback: {
                    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
                };

                onEvent: (event: string, callback: () => void) => void;
                offEvent: (event: string, callback: () => void) => void;
            };
        };
    }
}