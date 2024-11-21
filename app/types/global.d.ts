declare global {
  interface Window {
    ethereum?: any;
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            is_premium?: boolean;
            language_code?: string;
          };
        };
        clearData?: () => Promise<void>;
        reload?: () => void;
        close?: () => void;
        expand?: () => void;
        showConfirm?: (message: string) => Promise<boolean>;
        showAlert?: (message: string) => Promise<void>;
        ready?: () => void;
        isExpanded?: boolean;
        platform?: string;
      };
    };
  }
}

export {}; 