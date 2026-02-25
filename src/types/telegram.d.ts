declare global {
    interface TelegramWebApp {
        openTelegramLink(tgConfirmLink: string): unknown;
        ready(): void;
        expand(): void;
        close(): void;
        MainButton: {
            text: string;
            color: string;
            textColor: string;
            isVisible: boolean;
            isActive: boolean;
            isProgressVisible: boolean;
            show(): void;
            hide(): void;
            enable(): void;
            disable(): void;
            showProgress(leaveActive: boolean): void;
            hideProgress(): void;
            onClick(callback: () => void): void;
        };
        openLink(url: string, options?: { try_instant_view?: boolean }): void;
        /** Platform: 'ios' | 'android' | 'tdesktop' | 'weba' | 'web' | 'unknown' */
        platform: string;
        // Add other fields as needed
    }

    interface Window {
        Telegram?: {
            WebApp: TelegramWebApp;
        };
    }
}

export { }; // Ensure this is treated as a module that augments global scope
