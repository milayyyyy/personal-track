import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import AppGate from './components/AppGate.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppGate />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
