import { useState } from 'react'

function App() {
  const [activeView] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Rastreador Financiero</h1>
          <p className="text-sm opacity-90 mt-1">Tu gestor de finanzas personales</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Bienvenido a tu Rastreador Financiero
          </h2>
          <p className="text-gray-600 mb-4">
            Gestiona tus gastos, inversiones y finanzas con soporte para plataformas mexicanas como Nu, Didi y MercadoPago.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Quick Stats Cards */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2">Gastos del Mes</h3>
              <p className="text-3xl font-bold">$0.00</p>
              <p className="text-sm opacity-90 mt-1">MXN</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2">Inversiones</h3>
              <p className="text-3xl font-bold">$0.00</p>
              <p className="text-sm opacity-90 mt-1">MXN</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2">Patrimonio Neto</h3>
              <p className="text-3xl font-bold">$0.00</p>
              <p className="text-sm opacity-90 mt-1">MXN</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Acciones Rápidas</h3>
            <div className="flex flex-wrap gap-3">
              <button className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                + Agregar Gasto
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                + Nueva Inversión
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                Ver Reportes
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-auto py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            Financial Tracker © 2025 - Gestiona tus finanzas con inteligencia
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
