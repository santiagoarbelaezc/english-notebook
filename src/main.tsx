import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './router/AppRouter'
import { tokenService } from './services/token.service'

// Función global para debugging (disponible en consola del navegador)
declare global {
  interface Window {
    debugTokens: {
      clearAll: () => void;
      showInfo: () => void;
      forceClean: () => void;
    };
  }
}

// Agregar utilidades de debugging globales
const debugTokens = {
  clearAll: () => {
    console.log('🧹 Limpiando todos los tokens desde consola...');
    tokenService.clearTokens();
    console.log('✅ Tokens eliminados');
  },
  showInfo: () => {
    console.log('🔍 Información de tokens:');
    console.log('Access Token:', tokenService.getAccessToken()?.substring(0, 20) + '...');
    console.log('Refresh Token:', tokenService.getRefreshToken()?.substring(0, 20) + '...');
    console.log('Has Tokens:', tokenService.hasTokens());
  },
  forceClean: () => {
    console.log('💥 Forzando limpieza completa de tokens...');
    tokenService.forceCleanAllTokens();
    console.log('✅ Limpieza forzada completada');
  },
  healthCheck: () => {
    console.log('🏥 Health Check de TokenService:');
    console.log(tokenService.healthCheck());
  }
};

(window as any).debugTokens = debugTokens;

console.log('🐛 Utilidades de debugging disponibles:');
console.log('- window.debugTokens.clearAll() - Limpiar tokens');
console.log('- window.debugTokens.showInfo() - Mostrar info de tokens');
console.log('- window.debugTokens.forceClean() - Limpieza forzada');
console.log('- window.debugTokens.healthCheck() - Health check');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
