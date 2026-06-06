import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import AppGate from './components/AppGate.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    if (window.confirm('A new version of LifeFlow is available. Reload now?')) {
      void updateSW(true);
    }
  },
  onOfflineReady() {
    console.info('LifeFlow is ready to work offline.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppGate />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
