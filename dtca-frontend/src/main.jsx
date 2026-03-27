import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { AlertTriangle } from 'lucide-react'
import './index.css'
import App from './App.jsx'

// 1. On crée le design de "l'Airbag" (Ce que l'utilisateur voit en cas de crash)
function EcranDeSecours({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-lg w-full">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Oups ! Un petit souci d'affichage.</h1>
        <p className="text-slate-500 mb-6">
          Notre studio a rencontré une erreur inattendue. Si vous utilisez un traducteur automatique, essayez de le désactiver sur cette page.
        </p>
        
        {/* Détail technique discret pour toi, le développeur */}
        <div className="bg-red-50 p-3 rounded-lg text-left overflow-auto text-xs text-red-600 font-mono mb-6 border border-red-100">
          {error.message}
        </div>

        <button
          onClick={resetErrorBoundary}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition"
        >
          🔄 Recharger le Studio
        </button>
      </div>
    </div>
  );
}

// 2. On enveloppe notre App avec la frontière d'erreur
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary fallbackRender={EcranDeSecours}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)