import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    
    try {
      await login(email, password);
      navigate('/feed');
    } catch (err: any) {
      console.error('Login error:', err); // Pour débogage
      
      if (err.message.includes('Failed to fetch') || err.message.includes('404')) {
        // Erreur serveur - afficher sous email
        setEmailError('Service temporairement indisponible');
      } 
      else if (err.message.includes('email') || err.message.includes('Email')) {
        // Erreur email spécifique
        setEmailError('Email incorrect ou inexistant');
        setPasswordError(''); // Effacer l'erreur mot de passe
      }
      else if (err.message.includes('password') || err.message.includes('Mot de passe')) {
        // Erreur mot de passe spécifique
        setPasswordError('Mot de passe incorrect');
        setEmailError(''); // Effacer l'erreur email
      }
      else if (err.message.includes('401') || err.message.includes('Invalid credentials')) {
        // Cas où on ne sait pas lequel est incorrect
        setEmailError('Email ou mot de passe incorrect');
        setPasswordError('Email ou mot de passe incorrect');
      }
      else {
        // Erreur générique
        setEmailError('Une erreur inattendue est survenue');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo Vocal_Platform */}
        <div className="flex items-center justify-center mb-8">
          <Mic className="h-10 w-10 text-indigo-600" />
          <h1 className="ml-2 text-3xl font-bold text-gray-900">Vocal_Platform</h1>
        </div>

{/* Bouton Retour à l'accueil */}
<div className="mb-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à la page d'accueil
          </Link>
        </div>

        {/* Formulaire adapté */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-center text-2xl font-bold mb-6">Connexion</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                className={`w-full px-3 py-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                required
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                className={`w-full px-3 py-2 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                required
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Pas encore de compte?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              S'inscrire
            </Link>
          </div>

          <div className="mt-1 text-right">
            <Link 
              to="/forgot-password" 
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}