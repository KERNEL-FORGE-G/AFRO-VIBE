import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Github, Mail, Shield, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  // Redirect to admin if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const authError = searchParams.get('auth_error');
  const redirectUri = encodeURIComponent(`${window.location.origin}/callback`);

  const handleGitHubLogin = () => {
    const redirectUrl = `/api/auth/github?app=Authentificator&redirect_uri=${redirectUri}`;
    window.location.href = redirectUrl;
  };

  const handleGoogleLogin = () => {
    const redirectUrl = `/api/auth/google?app=Authentificator&redirect_uri=${redirectUri}`;
    window.location.href = redirectUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/50 mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Authentificator</h1>
          <p className="text-slate-400 text-sm">Système d'authentification OAuth2 sécurisé</p>
        </div>

        {/* Error message */}
        {authError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm font-medium">
              Erreur d'authentification: {decodeURIComponent(authError)}
            </p>
          </div>
        )}

        {/* Login card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2">Se connecter</h2>
          <p className="text-slate-400 text-sm mb-8">Choisissez votre fournisseur d'authentification</p>

          {/* GitHub Login Button */}
          <button
            onClick={handleGitHubLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg hover:shadow-xl mb-4 group"
          >
            <Github className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Continuer avec GitHub</span>
            <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg hover:shadow-xl group"
          >
            <Mail className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Continuer avec Google</span>
            <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800/50 text-slate-500">Ou</span>
            </div>
          </div>

          {/* Demo info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-300 text-xs font-medium mb-2">Mode démo</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Utilisez vos identifiants GitHub ou Google pour accéder au tableau de bord d'administration.
              Les données de test sont réinitialisées régulièrement.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs">
            Système d'authentification sécurisé • OAuth 2.0 • JWT
          </p>
        </div>
      </div>
    </div>
  );
}
