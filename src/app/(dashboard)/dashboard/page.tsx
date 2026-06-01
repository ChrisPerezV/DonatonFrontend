export default function DashboardIndexPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido a Donatón</h2>
      <p className="text-gray-600 mb-8 text-lg">
        Selecciona una opción en el menú lateral para comenzar a gestionar ayudas y emergencias.
      </p>

      {/* Tarjetas informativas de ejemplo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h3 className="font-bold text-blue-900 text-xl mb-2">Donaciones</h3>
          <p className="text-blue-700">Gestiona aportes de agua, alimentos y ropa.</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
          <h3 className="font-bold text-orange-900 text-xl mb-2">Necesidades</h3>
          <p className="text-orange-700">Declara emergencias y urgencias en zonas afectadas.</p>
        </div>
        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
          <h3 className="font-bold text-green-900 text-xl mb-2">Logística</h3>
          <p className="text-green-700">Controla el inventario y los despachos a terreno.</p>
        </div>
      </div>
    </div>
  );
}