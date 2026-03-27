import { useState, useEffect } from 'react';
import { Users, Crown, Star, ShieldCheck, TrendingUp, Loader2, LayoutDashboard, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    fetch('https://studio-ia-backend.onrender.com/api/admin/stats', {
      method: 'GET',
      headers: {
        'x-admin-token': 'BalanceScorpion2003' // Ton vrai mot de passe
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Accès refusé ! Mauvais mot de passe.");
        return res.json();
      })
      .then(data => setStats(data))
      .catch(err => setErreur(err.message));
  }, []);

  if (erreur) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center max-w-md">
          <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-500 mb-2">Accès Restreint</h2>
          <p className="text-red-400">{erreur}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="font-medium animate-pulse">Connexion à la base de données CEO...</p>
      </div>
    );
  }

  // --- CALCULS DES STATISTIQUES ---
  const revenuEstime = (stats.plans.pro * 2000) + (stats.plans.business * 5000);
  
  // Pourcentages pour le graphique (Sécurité : on évite la division par zéro)
  const totalSafe = stats.total > 0 ? stats.total : 1;
  const pctStarter = Math.round((stats.plans.gratuit / totalSafe) * 100);
  const pctPro = Math.round((stats.plans.pro / totalSafe) * 100);
  const pctBusiness = Math.round((stats.plans.business / totalSafe) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 lg:p-12 font-sans selection:bg-blue-500/30">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3 mb-2">
            <LayoutDashboard className="w-8 h-8 text-blue-500" />
            Centre de Commandement
          </h1>
          <p className="text-slate-400">Vue globale sur les performances de Studio Créatif IA.</p>
        </div>
        <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center gap-2 text-blue-400 font-bold text-sm">
          <ShieldCheck className="w-4 h-4" /> Mode CEO Activé
        </div>
      </div>

      {/* REVENU ESTIMÉ (MRR) */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp className="w-32 h-32 text-emerald-500" />
          </div>
          <h3 className="text-slate-400 font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> Revenus Mensuels Estimés (MRR)
          </h3>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl md:text-6xl font-black text-white">{revenuEstime.toLocaleString('fr-FR')}</span>
            <span className="text-xl text-slate-500 font-bold">FCFA / mois</span>
          </div>
        </div>
      </div>

      {/* GRID DES STATISTIQUES */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Utilisateurs */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg hover:border-blue-500/50 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Total Inscrits</h3>
          <p className="text-3xl font-black text-white">{stats.total}</p>
        </div>

        {/* Plan Starter */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg hover:border-slate-500/50 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-500/10 rounded-xl group-hover:bg-slate-500/20 transition-colors">
              <Star className="w-6 h-6 text-slate-400" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Starter (Gratuit)</h3>
          <p className="text-3xl font-black text-white">{stats.plans.gratuit}</p>
        </div>

        {/* Plan Pro */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg hover:border-blue-400/50 transition-colors group relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-blue-400/10 rounded-xl group-hover:bg-blue-400/20 transition-colors">
              <Star className="w-6 h-6 text-blue-400 fill-blue-400/20" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1 relative z-10">Plan Pro</h3>
          <p className="text-3xl font-black text-white relative z-10">{stats.plans.pro}</p>
        </div>

        {/* Plan Business */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg hover:border-amber-500/50 transition-colors group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors">
              <Crown className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1 relative z-10">Plan Business</h3>
          <p className="text-3xl font-black text-white relative z-10">{stats.plans.business}</p>
        </div>
      </div>

      {/* GRAPHIQUE VISUEL (Nouveau !) */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-lg">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" /> Répartition des abonnements
          </h3>

          {/* La Barre de progression empilée */}
          <div className="w-full h-10 md:h-12 bg-slate-800 rounded-full overflow-hidden flex mb-6 shadow-inner border border-slate-700/50">
            {pctStarter > 0 && (
              <div style={{ width: `${pctStarter}%` }} className="bg-slate-500 hover:brightness-110 transition-all relative group cursor-pointer flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs md:text-sm text-white drop-shadow-md">Starter</span>
              </div>
            )}
            {pctPro > 0 && (
              <div style={{ width: `${pctPro}%` }} className="bg-blue-500 hover:brightness-110 transition-all relative group cursor-pointer flex items-center justify-center border-l border-slate-800/20">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs md:text-sm text-white drop-shadow-md">Pro</span>
              </div>
            )}
            {pctBusiness > 0 && (
              <div style={{ width: `${pctBusiness}%` }} className="bg-amber-500 hover:brightness-110 transition-all relative group cursor-pointer flex items-center justify-center border-l border-slate-800/20">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs md:text-sm text-white drop-shadow-md">Business</span>
              </div>
            )}
          </div>

          {/* Légende du graphique */}
          <div className="flex flex-wrap gap-6 justify-center text-sm md:text-base">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-slate-500 block shadow-sm"></span> 
              <span className="text-slate-300 font-medium">Starter ({pctStarter}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-500 block shadow-sm"></span> 
              <span className="text-slate-300 font-medium">Pro ({pctPro}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-500 block shadow-sm"></span> 
              <span className="text-slate-300 font-medium">Business ({pctBusiness}%)</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;