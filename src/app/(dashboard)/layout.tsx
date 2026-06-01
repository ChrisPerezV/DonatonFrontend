import { cookies } from 'next/headers'; 
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';

// 1. Agregamos la palabra "async" antes de la función
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  
  const cookieStore = await cookies();
  
  const rolUsuario = cookieStore.get('rol')?.value;
  
  const esAdmin = rolUsuario === 'ADMINISTRADOR'; 

  const rolFormateado = rolUsuario 
    ? rolUsuario.charAt(0) + rolUsuario.slice(1).toLowerCase() 
    : 'Usuario';

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* --- MENÚ LATERAL (SIDEBAR) --- */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col shadow-xl">
        {/* ... LA PARTE DE ARRIBA Y EL NAV SE MANTIENEN IGUAL ... */}
        <div className="p-6 bg-blue-950">
          <Link href="/dashboard" className="text-2xl font-black text-white tracking-wider">
            DONATON
          </Link>
          <p className="text-blue-300 text-xs mt-1 font-medium">Ayudar es más fácil</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          
          {/* SECCIÓN DONANTES (Visible para todos) */}
          <p className="px-4 text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 mt-2">
            Aportes
          </p>
          <Link href="/donante/emergencias" className="block px-4 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium text-sm">
            Emergencias Activas
          </Link>
          <Link href="/donante/mis-donaciones" className="block px-4 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium text-sm">
            Mis Donaciones
          </Link>
          <Link href="/donante/nueva-donacion" className="block px-4 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium text-sm">
            Ingresar Donación
          </Link>

          {/* SECCIÓN ADMINISTRADOR (Condicionada por el Rol) */}
          {esAdmin && (
            <>
              <p className="px-4 text-xs font-bold text-red-400 uppercase tracking-wider mb-3 mt-8">
                Administración
              </p>
              <Link href="/admin/necesidades" className="block px-4 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium text-sm">
                Gestión de Necesidades
              </Link>
              <Link href="/admin/nueva-necesidad" className="block px-4 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium text-sm">
                Declarar Emergencia
              </Link>
              <Link href="/admin/centros" className="block px-4 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium text-sm">
                Red de Centros de Acopio
              </Link>
              <Link href="/admin/nuevo-centro" className="block px-4 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium text-sm">
                Nuevo Centro de Acopio
              </Link>
              <Link href="/admin/nuevo-despacho" className="block px-4 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium text-sm">
                Coordinar Despacho
              </Link>
              <Link href="/admin/despachos" className="block px-4 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium text-sm">
                Control de Despachos
              </Link>
            </>
          )}
        </nav>
{/* --- NUEVA ZONA DE PERFIL DE USUARIO --- */}
        <div className="p-5 border-t border-blue-800 bg-blue-950/50">
          <div className="flex items-center space-x-3 mb-2">
            {/* Círculo con la inicial del rol */}
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {rolUsuario ? rolUsuario.charAt(0) : 'U'}
            </div>
            
            {/* Detalles del Usuario */}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">
                {rolFormateado}
              </p>
              <div className="flex items-center mt-0.5">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-1.5 animate-pulse"></div>
                <p className="text-xs text-blue-300">En línea</p>
              </div>
            </div>
          </div>
          
          {/* Aquí inyectamos el componente interactivo de cliente */}
          <LogoutButton />
        </div>
      </aside>

      {/* --- ÁREA PRINCIPAL --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
      
    </div>
  );
}