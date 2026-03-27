import { useState, useEffect } from 'react';
import { 
  Upload, ImageIcon, Loader2, Sparkles, Copy, 
  CheckCircle2, LayoutGrid, PlusCircle, Moon, Sun, 
  Download, CreditCard, RefreshCw, LogOut, Phone,
  Facebook, Instagram, MessageCircle, Star, Zap, ShieldCheck, User as UserIcon,
  Crown, Coins, Smartphone
} from 'lucide-react';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  // ==========================================
  // 🚪 LA PORTE DÉROBÉE DU CEO
  // ==========================================
  // Si l'URL contient exactement ce chemin, on bloque l'app normale et on affiche le Dashboard
  if (window.location.pathname === '/admin-secret-ceo') {
    return <AdminDashboard />;
  }

  // --- LE RESTE DE TON APPLICATION ---
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // --- SYSTÈME D'AUTHENTIFICATION & PROFIL ---
  const [userId, setUserId] = useState(localStorage.getItem('dtca_user_id') || '');
  const [userInfo, setUserInfo] = useState(null);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [indicatif, setIndicatif] = useState('+225');
  const [telephoneAuth, setTelephoneAuth] = useState('');
  const [fullNameAuth, setFullNameAuth] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [errorAuth, setErrorAuth] = useState(null);

  const chargerProfil = async (id) => {
    try {
      const response = await fetch(`https://studio-ia-backend.onrender.com/api/users/${id}/profil`);
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      }
    } catch (err) {
      console.error("Erreur de chargement du profil", err);
    }
  };

  useEffect(() => {
    if (userId) chargerProfil(userId);
  }, [userId]);

  const gererConnexion = async (e) => {
    e.preventDefault();
    setLoadingAuth(true); setErrorAuth(null);
    const numeroComplet = `${indicatif} ${telephoneAuth.trim()}`;

    try {
      let url = isLoginMode ? `https://studio-ia-backend.onrender.com/api/users/login/${encodeURIComponent(numeroComplet)}` : 'https://studio-ia-backend.onrender.com/api/users';
      let options = isLoginMode ? {} : { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ phone_number: numeroComplet, full_name: fullNameAuth }) 
      };

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Erreur d'authentification");

      localStorage.setItem('dtca_user_id', data.id);
      setUserId(data.id);
      chargerProfil(data.id);
    } catch (err) {
      setErrorAuth(err.message);
    } finally {
      setLoadingAuth(false);
    }
  };

  const seDeconnecter = () => {
    localStorage.removeItem('dtca_user_id');
    setUserId(''); setUserInfo(null); setTelephoneAuth(''); setFullNameAuth(''); setHistorique([]); setOngletActif('creer');
  };

  // --- LE RESTE DE L'APPLICATION ---
  const [ongletActif, setOngletActif] = useState('creer');
  const [nomProduit, setNomProduit] = useState('');
  const [categorie, setCategorie] = useState('Vêtements');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [reseaux, setReseaux] = useState({ WhatsApp: true, Facebook: false, Instagram: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [loadingHistorique, setLoadingHistorique] = useState(false);

  // --- NOUVEAU : GESTION DES PAIEMENTS ---
  const [loadingPayment, setLoadingPayment] = useState(false);

  const declencherPaiement = async (fournisseur, montant) => {
    setLoadingPayment(true);
    try {
      // Appel à ton vrai backend sur Render
      const response = await fetch(`https://studio-ia-backend.onrender.com/api/payments/${fournisseur}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: montant,
          user_id: userId
        })
      });

      const data = await response.json();

      if (response.ok && data.checkout_url) {
        // Redirection vers la page de paiement (ou simulation)
        window.location.href = data.checkout_url;
      } else {
        alert(data.detail || data.message || "Erreur lors de l'initialisation du paiement.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion au serveur de paiement.");
    } finally {
      setLoadingPayment(false);
    }
  };

  const toggleReseau = (nomReseau) => setReseaux(prev => ({ ...prev, [nomReseau]: !prev[nomReseau] }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return setError("L'image est trop lourde (Max 5 Mo).");
      setError(null); setImage(file); setImagePreview(URL.createObjectURL(file));
    }
  };

  const copyToClipboard = (texte, index = 'global') => {
    navigator.clipboard.writeText(texte); setCopiedIndex(index); setTimeout(() => setCopiedIndex(null), 2000);
  };

  const reinitialiserFormulaire = () => {
    setNomProduit(''); setImage(null); setImagePreview(null); setResult(null); setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reseauxSelectionnes = Object.keys(reseaux).filter(r => reseaux[r]).join(', ');
    if (!reseauxSelectionnes) return setError("Sélectionnez au moins un réseau.");

    setLoading(true); setError(null); setResult(null);
    const formData = new FormData();
    formData.append('user_id', userId); formData.append('nom_produit', nomProduit);
    formData.append('categorie', categorie); formData.append('reseaux', reseauxSelectionnes); formData.append('image', image);

    try {
      const response = await fetch('https://studio-ia-backend.onrender.com/api/generer-visuel', { method: 'POST', body: formData });
      const textData = await response.text();
      let data; try { data = JSON.parse(textData); } catch (err) { throw new Error("Erreur serveur."); }
      
      if (!response.ok) {
        if (data.detail && data.detail.toLowerCase().includes('crédits insuffisants')) {
           setOngletActif('tarifs'); throw new Error(data.detail);
        }
        throw new Error(data.detail || "Erreur");
      }
      setResult(data.resultats);
      chargerProfil(userId); // Met à jour les crédits dans le header
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const chargerHistorique = async () => {
    setLoadingHistorique(true);
    try {
      const response = await fetch(`https://studio-ia-backend.onrender.com/api/users/${userId}/generations`);
      if (response.ok) { const data = await response.json(); setHistorique(data); }
    } catch (err) { alert("Erreur de galerie."); } finally { setLoadingHistorique(false); }
  };

  const changerOnglet = (nouvelOnglet) => {
    setOngletActif(nouvelOnglet); if (nouvelOnglet === 'galerie') chargerHistorique();
  };

  const extraireCartes = (texteBrut) => {
    if (!texteBrut) return [];
    const parts = texteBrut.split('**'); const cartes = [];
    for (let i = 1; i < parts.length; i += 2) {
      const titre = parts[i].trim(); const contenu = parts[i+1] ? parts[i+1].trim() : '';
      if (/whatsapp|facebook|instagram/i.test(titre)) {
        let r = 'Texte'; if (/whatsapp/i.test(titre)) r = 'WhatsApp'; else if (/facebook/i.test(titre)) r = 'Facebook'; else if (/instagram/i.test(titre)) r = 'Instagram';
        cartes.push({ reseau: r, contenu: contenu });
      }
    }
    return cartes.length === 0 ? [{ reseau: 'Contenu Généré', contenu: texteBrut }] : cartes;
  };

  // ==========================================
  // ÉCRAN 1 : L'AUTHENTIFICATION 
  // ==========================================
  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700 page-transition">
          <div className="text-center mb-6 md:mb-8">
            <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3 md:mb-4" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Studio Créatif IA</h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
              {isLoginMode ? "Heureux de vous revoir !" : "Créez votre compte en 10 secondes."}
            </p>
          </div>

          <form onSubmit={gererConnexion} className="space-y-4">
            {!isLoginMode && (
              <div className="page-transition">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 md:mb-2">Nom de votre Boutique (ou Prénom)</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 md:top-3.5 w-5 h-5 text-slate-400" />
                  <input type="text" required={!isLoginMode} value={fullNameAuth} onChange={(e) => setFullNameAuth(e.target.value)} placeholder="ex: Boutique de Marie" className="w-full pl-10 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 md:mb-2">Numéro WhatsApp</label>
              <div className="flex relative rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition">
                <div className="flex items-center pl-3 pr-1 bg-slate-100 dark:bg-slate-600 border-r border-slate-200 dark:border-slate-500">
                  <Phone className="w-4 h-4 md:w-5 md:h-5 text-slate-400 mr-1.5" />
                  <select value={indicatif} onChange={(e) => setIndicatif(e.target.value)} className="bg-transparent text-sm md:text-base text-slate-700 dark:text-slate-200 outline-none font-medium appearance-none cursor-pointer py-2.5 md:py-3">
                    <option value="+225">🇨🇮 +225</option>
                    <option value="+221">🇸🇳 +221</option>
                    <option value="+223">🇲🇱 +223</option>
                    <option value="+226">🇧🇫 +226</option>
                    <option value="+228">🇹🇬 +228</option>
                    <option value="+229">🇧🇯 +229</option>
                    <option value="+237">🇨🇲 +237</option>
                    <option value="+33">🇫🇷 +33</option>
                  </select>
                </div>
                <input type="tel" required value={telephoneAuth} onChange={(e) => setTelephoneAuth(e.target.value)} placeholder="01 02 03 04 05" className="w-full px-3 py-2.5 md:py-3 text-sm md:text-base bg-transparent text-slate-800 dark:text-white outline-none" />
              </div>
            </div>
            
            {errorAuth && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg text-center border border-red-100 dark:border-red-800 page-transition">{errorAuth}</div>}
            
            <button type="submit" disabled={loadingAuth || !telephoneAuth} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 mt-2 md:mt-4 rounded-xl transition flex justify-center items-center disabled:opacity-50 text-sm md:text-base">
              {loadingAuth ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLoginMode ? 'Accéder à mon Studio' : 'Créer mon compte (3 crédits offerts)')}
            </button>
          </form>

          <div className="mt-5 md:mt-6 text-center">
            <button type="button" onClick={() => { setIsLoginMode(!isLoginMode); setErrorAuth(null); }} className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
              {isLoginMode ? "Nouveau ici ? Créer un compte" : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ÉCRAN 2 : LE STUDIO 
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-3 sm:p-4 md:p-8 font-sans transition-colors duration-300">
      
      {/* NAVBAR */}
      <nav className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-800 p-3 sm:p-4 md:px-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 md:mb-10 gap-3 sm:gap-4 page-transition">
        {userInfo ? (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg md:text-xl shadow-md border-2 border-white dark:border-slate-700">
              {userInfo.full_name ? userInfo.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col justify-center overflow-hidden">
              <h2 className="text-base md:text-lg font-extrabold text-slate-800 dark:text-white leading-tight truncate">{userInfo.full_name}</h2>
              <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1 flex-wrap">
                <span className={`flex items-center gap-1 px-2 md:px-2.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${
                  userInfo.subscription_plan === 'Starter' ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 
                  userInfo.subscription_plan === 'Pro' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' : 
                  'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-sm'
                }`}>
                  {userInfo.subscription_plan !== 'Starter' && <Crown className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                  {userInfo.subscription_plan}
                </span>
                <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full hidden sm:block"></span>
                <span className={`flex items-center gap-1 text-[10px] md:text-xs font-bold ${userInfo.credits > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 animate-pulse'}`}>
                  <Coins className="w-3 h-3 md:w-3.5 md:h-3.5" /> {userInfo.credits} <span className="hidden sm:inline">crédit(s)</span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full sm:w-48 h-10 md:h-12 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-xl"></div>
        )}

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="flex items-center justify-center p-2.5 md:px-4 md:py-2 bg-slate-50 dark:bg-slate-900 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700">
            {isDarkMode ? <Sun className="w-4 h-4 md:w-4 md:h-4 text-amber-500" /> : <Moon className="w-4 h-4 md:w-4 md:h-4 text-indigo-500" />}
            <span className="hidden md:inline ml-2">{isDarkMode ? 'Clair' : 'Sombre'}</span>
          </button>
          <button onClick={seDeconnecter} className="flex items-center justify-center p-2.5 md:px-4 md:py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium text-sm rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition border border-red-100 dark:border-red-900/30">
            <LogOut className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden md:inline ml-2">Quitter</span>
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto">
        <header className="mb-6 md:mb-8 page-transition" style={{animationDelay: '0.1s'}}>
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2 mb-1 md:mb-2">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8" /> Studio Créatif IA
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-500">Votre assistant marketing en Côte d'Ivoire</p>
          </div>
          
          <div className="flex justify-center flex-wrap gap-2 md:gap-4 relative z-0">
            <button onClick={() => changerOnglet('creer')} className={`flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-bold transition ${ongletActif === 'creer' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
              <PlusCircle className="w-4 h-4 md:w-5 md:h-5" /> Créer
            </button>
            <button onClick={() => changerOnglet('galerie')} className={`flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-bold transition ${ongletActif === 'galerie' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
              <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" /> Ma Galerie
            </button>
            <button onClick={() => changerOnglet('tarifs')} className={`flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-bold transition ${ongletActif === 'tarifs' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
              <CreditCard className="w-4 h-4 md:w-5 md:h-5" /> Abonnements
            </button>
          </div>
        </header>

        {/* CONTENEUR ANIMÉ : La key force l'animation à se rejouer à chaque changement d'onglet */}
        <div key={ongletActif} className="page-transition">
          
          {/* CONTENU : ONGLET CRÉER */}
          {ongletActif === 'creer' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Colonne Formulaire */}
              <div className="bg-white dark:bg-slate-800 p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-5 md:mb-6">
                  <h2 className="text-lg md:text-xl font-bold">Nouveau Produit</h2>
                  {result && <button onClick={reinitialiserFormulaire} className="text-xs md:text-sm flex items-center gap-1 text-slate-500 hover:text-blue-600 transition"><RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" /> Vider</button>}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1 md:mb-1.5 dark:text-slate-300">Nom du produit</label>
                    <input type="text" required value={nomProduit} onChange={(e) => setNomProduit(e.target.value)} className="w-full border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white rounded-xl p-2.5 md:p-3 text-sm md:text-base outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: Robe Wax Élégante" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 md:mb-1.5 dark:text-slate-300">Catégorie</label>
                    <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className="w-full border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white rounded-xl p-2.5 md:p-3 text-sm md:text-base outline-none focus:ring-2 focus:ring-blue-500">
                      <option className="dark:bg-slate-800">Vêtements</option>
                      <option className="dark:bg-slate-800">Chaussures</option>
                      <option className="dark:bg-slate-800">Boissons & Nourriture</option>
                      <option className="dark:bg-slate-800">Cosmétiques</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-slate-300">Optimiser le texte pour :</label>
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" onClick={() => toggleReseau('WhatsApp')} className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border-2 transition text-xs md:text-sm font-medium ${reseaux.WhatsApp ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'border-slate-200 dark:border-slate-600 text-slate-500'}`}><MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> WhatsApp</button>
                      <button type="button" onClick={() => toggleReseau('Facebook')} className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border-2 transition text-xs md:text-sm font-medium ${reseaux.Facebook ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'border-slate-200 dark:border-slate-600 text-slate-500'}`}><Facebook className="w-3.5 h-3.5 md:w-4 md:h-4" /> Facebook</button>
                      <button type="button" onClick={() => toggleReseau('Instagram')} className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border-2 transition text-xs md:text-sm font-medium ${reseaux.Instagram ? 'border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' : 'border-slate-200 dark:border-slate-600 text-slate-500'}`}><Instagram className="w-3.5 h-3.5 md:w-4 md:h-4" /> Instagram</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 md:mb-1.5 dark:text-slate-300">Photo brute (Max 5 Mo)</label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 md:p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer relative">
                      <input type="file" required accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {imagePreview ? <img src={imagePreview} className="mx-auto h-24 md:h-32 object-contain rounded-lg shadow-sm" /> : <div className="text-slate-500"><Upload className="w-6 h-6 md:w-8 md:h-8 mb-2 mx-auto text-slate-400" /><span className="text-xs md:text-sm">Cliquez pour ajouter une photo</span></div>}
                    </div>
                  </div>

                  <button type="submit" disabled={loading || !image} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 md:py-3.5 px-4 rounded-xl transition disabled:bg-blue-300 dark:disabled:bg-blue-900 mt-4 md:mt-6 flex justify-center items-center gap-2 text-sm md:text-base">
                    {loading ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> Magie en cours...</span> : <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 md:w-5 md:h-5" /> Générer pour {Object.values(reseaux).filter(Boolean).length} réseau(x)</span>}
                  </button>
                  
                  {error && error.toLowerCase().includes('crédit') ? (
                    <div className="bg-orange-50 dark:bg-orange-900/30 p-3 md:p-4 rounded-xl border border-orange-200 text-center mt-3 md:mt-4 page-transition">
                      <p className="text-orange-700 dark:text-orange-400 font-bold mb-2 md:mb-3 text-sm md:text-base">⚠️ {error}</p>
                      <button type="button" onClick={() => setOngletActif('tarifs')} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 md:px-4 md:py-2.5 rounded-lg font-medium text-sm md:text-base flex mx-auto gap-2 transition"><CreditCard className="w-4 h-4 md:w-5 md:h-5" /> Voir les abonnements</button>
                    </div>
                  ) : error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs md:text-sm border mt-3 md:mt-4 page-transition">⚠️ {error}</div>}
                </form>
              </div>

              {/* Colonne Résultat */}
              <div className="bg-white dark:bg-slate-800 p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full min-h-[400px]">
                <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Résultat Final</h2>
                
                {!result && !loading && <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl p-8"><ImageIcon className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 opacity-20" /><p className="text-sm md:text-base text-center">Votre visuel apparaîtra ici</p></div>}
                {loading && <div className="flex-1 flex flex-col items-center justify-center text-blue-500 space-y-3 md:space-y-4 p-8"><Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin" /><p className="font-medium text-sm md:text-base animate-pulse">L'IA prépare vos contenus...</p></div>}
                
                {result && !loading && (
                  <div className="space-y-5 md:space-y-6 page-transition">
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 shadow-sm relative group">
                      <img src={result.image_url} className="w-full h-auto object-cover" />
                      <a href={result.image_url} download={`Studio_IA_${nomProduit.replace(/\s+/g, '_')}.jpg`} className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-white/90 backdrop-blur-sm text-blue-600 font-bold px-3 py-1.5 md:px-3 md:py-2 rounded-lg flex items-center gap-1.5 md:gap-2 shadow-lg transition transform hover:scale-105 text-xs md:text-sm"><Download className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Télécharger</span></a>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                      {extraireCartes(result.texte_whatsapp || result.texte_marketing || result.generated_copy).map((carte, index) => {
                        let colorClass = "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700";
                        let Icone = Sparkles; let badgeColor = "bg-slate-200 text-slate-700";
                        
                        if (carte.reseau === 'WhatsApp') { colorClass = "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800"; Icone = MessageCircle; badgeColor = "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"; }
                        else if (carte.reseau === 'Facebook') { colorClass = "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"; Icone = Facebook; badgeColor = "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"; }
                        else if (carte.reseau === 'Instagram') { colorClass = "bg-pink-50/50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800"; Icone = Instagram; badgeColor = "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-400"; }

                        return (
                          <div key={index} className={`p-3 md:p-4 rounded-xl border relative ${colorClass}`}>
                            <button onClick={() => copyToClipboard(carte.contenu, index)} className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 hover:scale-105 transition text-slate-600 dark:text-slate-300" title="Copier ce texte">{copiedIndex === index ? <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />}</button>
                            <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3"><span className={`p-1.5 rounded-md ${badgeColor}`}><Icone className="w-3.5 h-3.5 md:w-4 md:h-4" /></span><h3 className="font-bold text-xs md:text-sm uppercase tracking-wider opacity-80">{carte.reseau}</h3></div>
                            <div className="whitespace-pre-wrap text-xs sm:text-sm font-medium leading-relaxed dark:text-slate-300">{carte.contenu}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CONTENU : ONGLET GALERIE */}
          {ongletActif === 'galerie' && (
            <div className="bg-white dark:bg-slate-800 p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 min-h-[50vh]">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2"><LayoutGrid className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" /> Vos anciennes créations</h2>
              {loadingHistorique ? (
                <div className="flex justify-center items-center h-40 text-slate-500"><Loader2 className="w-8 h-8 animate-spin" /></div>
              ) : historique.length === 0 ? (
                <div className="text-center py-16 md:py-20 text-slate-400"><ImageIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 opacity-30" /><p className="text-sm md:text-base">Vous n'avez pas encore généré de visuels.</p></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {historique.map((item) => (
                    <div key={item.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-slate-50 dark:bg-slate-900 flex flex-col">
                      <div className="relative"><img src={item.generated_image_url} alt="Génération" className="w-full h-40 md:h-48 object-cover border-b border-slate-200 dark:border-slate-700" /></div>
                      <div className="p-3 md:p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2"><span className="text-[10px] md:text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 px-2 py-1 rounded uppercase">{item.product_category}</span><span className="text-[10px] md:text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString('fr-FR')}</span></div>
                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-3 flex-1">{item.generated_copy}</p>
                        <button onClick={() => copyToClipboard(item.generated_copy, item.id)} className="w-full flex justify-center gap-1.5 md:gap-2 text-xs md:text-sm bg-white dark:bg-slate-800 border dark:border-slate-600 py-1.5 md:py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300">{copiedIndex === item.id ? <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />} Copier</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONTENU : ONGLET TARIFS */}
          {ongletActif === 'tarifs' && (
             <div className="py-4 md:py-8">
              <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12 px-4">
                <h2 className="text-2xl md:text-3xl font-extrabold mb-3 md:mb-4">Des tarifs simples pour booster vos ventes</h2>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Paiement 100% sécurisé via Wave et Orange Money.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto px-2">
                
                {/* Carte 1 : STARTER */}
                <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col relative">
                  <div className="mb-5 md:mb-6"><h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1.5 md:mb-2">Starter</h3><div className="flex items-baseline gap-2"><span className="text-3xl md:text-4xl font-extrabold">0</span><span className="text-sm md:text-base text-slate-500 font-medium">FCFA</span></div><p className="text-xs md:text-sm text-slate-500 mt-2">Pour tester la magie de l'IA.</p></div>
                  <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
                    <li className="flex items-center gap-2 md:gap-3 text-sm"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" /> <span><b>3 crédits</b> offerts</span></li>
                    <li className="flex items-center gap-2 md:gap-3 text-sm"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" /> <span>Qualité Standard</span></li>
                  </ul>
                  <button className="w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-bold py-2.5 md:py-3 rounded-xl transition text-sm md:text-base hover:bg-slate-200 dark:hover:bg-slate-600">Forfait Actuel</button>
                </div>
                
                {/* Carte 2 : PRO (Recommandé) */}
                <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-xl border-2 border-blue-600 flex flex-col relative transform md:-translate-y-4">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap"><Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" /> Recommandé</div>
                  <div className="mb-5 md:mb-6"><h3 className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400 mb-1.5 md:mb-2">Pro</h3><div className="flex items-baseline gap-2"><span className="text-3xl md:text-4xl font-extrabold">2 000</span><span className="text-sm md:text-base text-slate-500 font-medium">FCFA / mois</span></div><p className="text-xs md:text-sm text-slate-500 mt-2">Idéal pour les petits e-commerçants.</p></div>
                  <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
                    <li className="flex items-center gap-2 md:gap-3 text-sm"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-blue-500 flex-shrink-0" /> <span><b>30 crédits</b> mensuels</span></li>
                    <li className="flex items-center gap-2 md:gap-3 text-sm"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-blue-500 flex-shrink-0" /> <span>Textes FB, Insta & WhatsApp</span></li>
                  </ul>
                  
                  {/* BOUTONS DE PAIEMENT - PRO */}
                  <div className="flex flex-col gap-3 mt-auto">
                    <button onClick={() => declencherPaiement('wave', 2000)} disabled={loadingPayment} className="w-full bg-[#11ceea] hover:bg-[#0eb8d4] disabled:opacity-50 text-white font-bold py-2.5 md:py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm md:text-base">
                      {loadingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-4 h-4 md:w-5 md:h-5 fill-current text-white" /> Payer avec Wave</>}
                    </button>
                    <button onClick={() => declencherPaiement('orange', 2000)} disabled={loadingPayment} className="w-full bg-[#ff7900] hover:bg-[#e66d00] disabled:opacity-50 text-white font-bold py-2.5 md:py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm md:text-base">
                      {loadingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Smartphone className="w-4 h-4 md:w-5 md:h-5" /> Payer avec OM</>}
                    </button>
                  </div>
                </div>
                
                {/* Carte 3 : BUSINESS */}
                <div className="bg-slate-900 dark:bg-slate-950 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-800 flex flex-col relative text-white">
                  <div className="mb-5 md:mb-6"><h3 className="text-lg md:text-xl font-bold text-yellow-500 mb-1.5 md:mb-2">Business</h3><div className="flex items-baseline gap-2"><span className="text-3xl md:text-4xl font-extrabold text-white">5 000</span><span className="text-sm md:text-base text-slate-400 font-medium">FCFA / mois</span></div><p className="text-xs md:text-sm text-slate-400 mt-2">Pour les agences et gros vendeurs.</p></div>
                  <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
                    <li className="flex items-center gap-2 md:gap-3 text-sm text-slate-200"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 flex-shrink-0" /> <span><b>100 crédits</b> mensuels</span></li>
                    <li className="flex items-center gap-2 md:gap-3 text-sm text-slate-200"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 flex-shrink-0" /> <span>Priorité serveur</span></li>
                  </ul>
                  
                  {/* BOUTONS DE PAIEMENT - BUSINESS */}
                  <div className="flex flex-col gap-3 mt-auto">
                    <button onClick={() => declencherPaiement('wave', 5000)} disabled={loadingPayment} className="w-full bg-[#11ceea] hover:bg-[#0eb8d4] disabled:opacity-50 text-white font-bold py-2.5 md:py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm md:text-base">
                      {loadingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-4 h-4 md:w-5 md:h-5 fill-current text-white" /> Payer avec Wave</>}
                    </button>
                    <button onClick={() => declencherPaiement('orange', 5000)} disabled={loadingPayment} className="w-full bg-[#ff7900] hover:bg-[#e66d00] disabled:opacity-50 text-white font-bold py-2.5 md:py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm md:text-base">
                      {loadingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Smartphone className="w-4 h-4 md:w-5 md:h-5" /> Payer avec OM</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;