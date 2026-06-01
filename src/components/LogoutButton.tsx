'use client';

import Cookies from 'js-cookie';

export default function LogoutButton() {
  
  const handleLogout = () => {
    // 1. Borramos todas las evidencias de la sesión
    Cookies.remove('token');
    Cookies.remove('idUsuario');
    Cookies.remove('rol');
    
    // Opcional: si guardaste el email o nombre, bórralos también
    // Cookies.remove('email');

    // 2. Redirigimos al Login forzando una recarga de página 
    // para limpiar la memoria caché del servidor de Next.js
    window.location.href = '/login';
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full mt-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 py-2 px-4 rounded-lg transition-all text-sm font-bold flex items-center justify-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Cerrar Sesión
    </button>
  );
}