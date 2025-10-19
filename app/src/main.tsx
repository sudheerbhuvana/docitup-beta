import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Preserve console logs across page navigations
if (import.meta.env.DEV) {
  // Store console logs
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  const logs: any[] = [];
  
  console.log = (...args: any[]) => {
    logs.push({ type: 'log', args, time: new Date() });
    originalLog(...args);
  };
  
  console.error = (...args: any[]) => {
    logs.push({ type: 'error', args, time: new Date() });
    originalError(...args);
  };
  
  console.warn = (...args: any[]) => {
    logs.push({ type: 'warn', args, time: new Date() });
    originalWarn(...args);
  };
  
  // Make logs available globally
  (window as any).__consoleLogs = logs;
  
  console.log(
    '%c🔧 Console Logs Preserved',
    'color: #10b981; font-weight: bold',
    '- Check window.__consoleLogs for history'
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
