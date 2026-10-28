import {createContext, useContext, useState} from "react";
import back from "~/assets/generated/back.webp"
import backAvif from "~/assets/generated/back.avif"

type ThemeType = 'default' | 'gradient' | 'static';
type HorizontalPositionType = 'left' | 'center' | 'right';
type VerticalPositionType = 'top' | 'center' | 'bottom';
type LoaderPositionMode = 'fixed' | 'relative';

interface LoaderPosition {
    x: number | HorizontalPositionType;
    y: number | VerticalPositionType;
}

interface LoaderConfig {
    text?: string;
    ringWidth?: number;
    size?: number;
    dotSize?: number;
    glowIntensity?: number;
    useExtraGlow?: boolean;
    blur?: boolean;
    positionMode?: LoaderPositionMode;
    showOverlay?: boolean;
}

interface LoaderContextType {
    // Основные состояния
    blur: false | true | undefined;
    showLoader: boolean;
    position: LoaderPosition;
    config: LoaderConfig;

    // Методы управления
    setShowLoader: (show: boolean) => void;
    setLoaderPosition: (x: number | HorizontalPositionType, y: number | VerticalPositionType) => void;
    setLoaderConfig: (config: LoaderConfig) => void;

    // Удобные методы для предустановок
    showFullscreenLoader: (text?: string) => void;
    showInlineLoader: (text?: string) => void;
    hideLoader: () => void;

    // Метод для сброса к настройкам по умолчанию
    resetLoaderConfig: () => void;
}

interface AppContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    useOpacity: boolean;
    setUseOpacity: (value: boolean) => void;
    title: string;
    setTitle: (value: string) => void;
    gradient: string;
    loader: LoaderContextType;
    barVisible: boolean;
    setBarVisible: (visible: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Конфигурация по умолчанию
const DEFAULT_LOADER_CONFIG: LoaderConfig = {
    text: "Загрузка...",
    ringWidth: 3,
    size: 150,
    dotSize: 14,
    glowIntensity: 1,
    useExtraGlow: true,
    positionMode: 'relative',
    showOverlay: false,
    blur: true,
};

const DEFAULT_POSITION: LoaderPosition = {
    x: 'center',
    y: 'center'
};

export function AppProvider({children}: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<ThemeType>('default');
    const [showLoader, setShowLoader] = useState(false);
    const [loaderPosition, setLoaderPosition] = useState<LoaderPosition>(DEFAULT_POSITION);
    const [loaderConfig, setLoaderConfig] = useState<LoaderConfig>(DEFAULT_LOADER_CONFIG);
    const [barVisible, setBarVisible] = useState(false)
    const [useOpacity, _setUseOpacity] = useState(false)
    const [title, setTitle] = useState("")

    const gradients = {
        default: 'radial-gradient(circle at 90% 10%, rgba(232, 213, 244, 0.6) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(178, 159, 206, 0.4) 0%, transparent 50%), linear-gradient(135deg, #d499af 0%, #a88dbd 50%, #908fc2 100%)',
        gradient: 'radial-gradient(circle at 90% 10%, rgba(232, 213, 244, 0.6) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(178, 159, 206, 0.4) 0%, transparent 50%), linear-gradient(135deg, #d499af 0%, #a88dbd 50%, #908fc2 100%)',
        static: `image-set(url("${backAvif}") type("image/avif"), url("${back}") type("image/webp"))`
    };
    const handleSetLoaderPosition = (x: number | HorizontalPositionType, y: number | VerticalPositionType) => {
        setLoaderPosition({x, y});
    };
    const handleSetLoaderConfig = (config: LoaderConfig) => {
        setLoaderConfig(prev => ({
            ...prev,
            ...config
        }));
    };
    const resetLoaderConfig = () => {
        setLoaderConfig(DEFAULT_LOADER_CONFIG);
        setLoaderPosition(DEFAULT_POSITION);
    };
    const showFullscreenLoader = (text?: string) => {
        setLoaderConfig({
            ...loaderConfig,
            text: text || loaderConfig.text || "Загрузка...",
            positionMode: 'fixed',
            showOverlay: true,
            size: 150
        });
        setLoaderPosition({x: 'center', y: 'center'});
        setShowLoader(true);
    };
    const showInlineLoader = (text?: string) => {
        setLoaderConfig({
            ...loaderConfig,
            text: text || loaderConfig.text || "Загрузка",
            positionMode: 'relative',
            showOverlay: false,
            size: 150
        });
        setShowLoader(true);
    };
    const hideLoader = () => {
        setShowLoader(false);
    };
    const setUseOpacity = (value: boolean) => {
        _setUseOpacity(value);
    }
    const contextValue: AppContextType = {
        theme,
        setTheme,
        useOpacity,
        setUseOpacity,
        title,
        setTitle,
        gradient: gradients[theme],
        loader: {
            blur: true,
            // Состояния
            showLoader,
            position: loaderPosition,
            config: loaderConfig,

            // Методы
            setShowLoader,
            setLoaderPosition: handleSetLoaderPosition,
            setLoaderConfig: handleSetLoaderConfig,

            // Удобные методы
            showFullscreenLoader,
            showInlineLoader,
            hideLoader,

            // Сброс
            resetLoaderConfig
        },
        barVisible,
        setBarVisible
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
}
