import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Investments from './components/Investments';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Rastreador Financiero</h1>
          <p className="text-sm opacity-90 mt-1">Hola! Aquí está tu resumen financiero.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Dashboard />

        <div className="mt-8">
          <Expenses />
        </div>

        <div className="mt-8">
          <Investments />
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
