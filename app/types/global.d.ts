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
          auth_date?: string;
          hash?: string;
          query_id?: string;
        };
        colorScheme: 'dark' | 'light';
        themeParams: {
          bg_color: string;
          text_color: string;
          hint_color: string;
          link_color: string;
          button_color: string;
          button_text_color: string;
        };
        onEvent: (eventType: string, callback: () => void) => void;
        offEvent: (eventType: string, callback: () => void) => void;
        sendData: (data: any) => void;
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

export {}; 