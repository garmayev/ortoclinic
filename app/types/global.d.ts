// app/types/global.d.ts
export {};

declare global {
    interface Window {
        Telegram?: {
            WebApp?: any;
        };
        TelegramWebApp?: any;
        Max?: {
            WebApp?: any;
        };
        MaxWebApp?: any;
        maxWebApp?: any;
    }
}