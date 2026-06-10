import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {initSentry} from './lib/sentry';
import './index.css';

initSentry();

if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEVTOOLS === 'true') {
  import('./utils/devTools');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
