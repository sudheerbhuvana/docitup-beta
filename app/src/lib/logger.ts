// Frontend logging utility
const isDev = import.meta.env.DEV;

export const logger = {
  // API call logs
  api: {
    request: (method: string, url: string, data?: any) => {
      if (isDev) {
        console.log(
          `%c📤 API ${method}`,
          'color: #3b82f6; font-weight: bold',
          url,
          data ? '\n  Data:' : '',
          data || ''
        );
      }
    },
    response: (method: string, url: string, status: number, data?: any) => {
      const emoji = status < 400 ? '✅' : '❌';
      const color = status < 400 ? '#10b981' : '#ef4444';
      if (isDev) {
        console.log(
          `%c${emoji} API ${method}`,
          `color: ${color}; font-weight: bold`,
          url,
          `(${status})`,
          data ? '\n  Response:' : '',
          data || ''
        );
      }
    },
    error: (method: string, url: string, error: any) => {
      if (isDev) {
        console.error(
          `%c❌ API ${method} ERROR`,
          'color: #ef4444; font-weight: bold',
          url,
          '\n  Error:',
          error
        );
      }
    },
  },

  // Auth logs
  auth: {
    login: (email: string) => {
      if (isDev) {
        console.log(
          '%c🔐 Login Attempt',
          'color: #8b5cf6; font-weight: bold',
          email
        );
      }
    },
    loginSuccess: (user: any) => {
      if (isDev) {
        console.log(
          '%c✅ Login Success',
          'color: #10b981; font-weight: bold',
          user
        );
      }
    },
    logout: () => {
      if (isDev) {
        console.log('%c👋 Logout', 'color: #f59e0b; font-weight: bold');
      }
    },
  },

  // Navigation logs
  nav: {
    route: (from: string, to: string) => {
      if (isDev) {
        console.log(
          '%c🧭 Navigation',
          'color: #06b6d4; font-weight: bold',
          `${from} → ${to}`
        );
      }
    },
  },

  // Component logs
  component: {
    mount: (name: string) => {
      if (isDev) {
        console.log(
          '%c⚛️  Component Mount',
          'color: #ec4899; font-weight: bold',
          name
        );
      }
    },
    unmount: (name: string) => {
      if (isDev) {
        console.log(
          '%c⚛️  Component Unmount',
          'color: #ec4899; font-weight: bold',
          name
        );
      }
    },
  },

  // General logs
  info: (message: string, ...args: any[]) => {
    if (isDev) {
      console.log(
        '%cℹ️  Info',
        'color: #3b82f6; font-weight: bold',
        message,
        ...args
      );
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (isDev) {
      console.warn(
        '%c⚠️  Warning',
        'color: #f59e0b; font-weight: bold',
        message,
        ...args
      );
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(
      '%c❌ Error',
      'color: #ef4444; font-weight: bold',
      message,
      ...args
    );
  },
  success: (message: string, ...args: any[]) => {
    if (isDev) {
      console.log(
        '%c✅ Success',
        'color: #10b981; font-weight: bold',
        message,
        ...args
      );
    }
  },
};

// Log app initialization
if (isDev) {
  console.log(
    '%c🚀 Docitup Frontend Started',
    'color: #8b5cf6; font-weight: bold; font-size: 16px; padding: 4px 8px; border-radius: 4px; background: #1f2937'
  );
  console.log(
    '%cEnvironment: Development',
    'color: #10b981; font-weight: bold'
  );
  console.log(
    '%cAPI URL:',
    'color: #3b82f6; font-weight: bold',
    import.meta.env.VITE_API_URL || 'https://api-docitup.sudheerbhuvana.in/api'
  );
}

