import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();


  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser les erreurs
    setErrors({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      general: ''
    });
  
    // Validation des mots de passe
    if (password !== confirmPassword) {
      setErrors(prev => ({
        ...prev,
        password: 'Les mots de passe ne correspondent pas',
        confirmPassword: 'Les mots de passe ne correspondent pas'
      }));
      return;
    }
  
    try {
      await register(username, email, password);
      navigate('/feed');
    } catch (err: any) {
      // Gestion des erreurs structurées
      if (err.type && err.message) {
        if (err.type === 'email') {
          setErrors(prev => ({ ...prev, email: err.message }));
        } else if (err.type === 'username') {
          setErrors(prev => ({ ...prev, username: err.message }));
        } else {
          setErrors(prev => ({ ...prev, general: err.message }));
        }
      } 
      // Gestion des erreurs non structurées
      else {
        setErrors(prev => ({ ...prev, general: err.message || 'Une erreur est survenue' }));
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
          <h2 className="text-center text-2xl font-bold mb-6">Inscription</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
  {errors.general && (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      {errors.general}
    </div>
  )}
  
  <div>
    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
      Nom d'utilisateur
    </label>
    <input
      type="text"
      id="username"
      name="username"
      value={username}
      onChange={(e) => {
        setUsername(e.target.value);
        setErrors(prev => ({ ...prev, username: '' }));
      }}
      className={`w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
      required
    />
    {errors.username && (
      <p className="mt-1 text-sm text-red-600">{errors.username}</p>
    )}
  </div>

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
        setErrors(prev => ({ ...prev, email: '' }));
      }}
      className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
      required
    />
    {errors.email && (
      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
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
        setErrors(prev => ({ ...prev, password: '' }));
      }}
      className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
      required
    />
    {errors.password && (
      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
    )}
  </div>

  <div>
    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
      Confirmer le mot de passe
    </label>
    <input
      type="password"
      id="confirmPassword"
      name="confirmPassword"
      value={confirmPassword}
      onChange={(e) => {
        setConfirmPassword(e.target.value);
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }}
      className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
      required
    />
    {errors.confirmPassword && (
      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
    )}
  </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              S'inscrire
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Déjà un compte?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}