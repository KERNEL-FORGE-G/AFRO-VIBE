import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Callback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const status = searchParams.get('status');
    const errorMsg = searchParams.get('error');

    if (status === 'failure' || errorMsg) {
      setError(errorMsg || 'Authentification échouée');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (token) {
      try {
        login(token);
        navigate('/admin');
      } catch (err) {
        console.error('[v0] Callback error:', err);
        setError('Erreur lors du traitement du token');
        setTimeout(() => navigate('/'), 3000);
      }
    } else {
      setError('Token manquant');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow">
        {error ? (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Erreur d'authentification</h2>
            <p className="text-gray-700">{error}</p>
            <p className="text-sm text-gray-600 mt-4">Redirection en cours...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentification en cours</h2>
            <p className="text-gray-700">Veuillez patienter...</p>
          </>
        )}
      </div>
    </div>
  );
}
