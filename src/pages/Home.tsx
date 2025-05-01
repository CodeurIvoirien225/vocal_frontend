// pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import photo from '../pages/photo.jpg';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
          Bienvenue sur <span className="text-indigo-700">Vocal Plateform</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          La plateforme qui donne une voix à vos idées
        </p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Section */}
        <section className="flex flex-col md:flex-row items-center gap-12 mb-16">
          {/* Photo */}
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img
                src={photo}
                alt="El ABASS ABDOUL ANZIZ KONE"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* About Me */}
          <div className="w-full md:w-2/3">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              À propos de moi
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Je m'appelle El abass abdoul anziz kone, développeur passionné et créateur de Vocal Plateform.
              </p>
              <p>
              Animé par une grande passion pour le développement web, j'ai conçu cette plateforme pour permettre aux utilisateurs d'envoyer facilement des messages vocaux, en simplifiant la communication rapide et naturelle.              </p>
              <p>
                Mon objectif est de créer des solutions technologiques qui simplifient la vie des utilisateurs tout en offrant une expérience intuitive et agréable.
              </p>
            </div>
          </div>
        </section>

        {/* Project Description */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Le projet <span className="text-blue-600">Vocal Platform</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Qu'est-ce que c'est ?</h3>
              <p className="text-gray-600">
              Vocal Plateform est une application innovante qui permet aux utilisateurs d'envoyer facilement des messages vocaux.
              Notre plateforme offre une solution unique pour simplifier et accélérer les échanges vocaux, en rendant la communication plus naturelle, plus rapide et plus accessible que jamais.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Fonctionnalités clés</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Publication et partage de contenus vocaux</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Interaction communautaire via commentaires audio et texte</span>
                </li>
              
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Notifications en temps réel</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Technologies Used - Enhanced Version */}
<section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 mb-16 border border-white border-opacity-30">
  <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 relative">
    <span className="relative z-10">
      Technologies utilisées
      <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-indigo-500 rounded-full"></span>
    </span>
  </h2>
  
  <div className="grid md:grid-cols-2 gap-12">
    {/* Frontend Column */}
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-800">Frontend</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* React Card */}
        <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col items-center text-center">
          <div className="mb-3 p-3 bg-blue-50 rounded-full">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" 
              alt="React" 
              className="w-10 h-10"
            />
          </div>
          <span className="font-semibold text-gray-700">React.js</span>
          <span className="text-xs text-indigo-500 mt-1">Bibliothèque JavaScript</span>
        </div>
        
        {/* Tailwind Card */}
        <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col items-center text-center">
          <div className="mb-3 p-3 bg-blue-50 rounded-full">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" 
              alt="Tailwind CSS" 
              className="w-10 h-10"
            />
          </div>
          <span className="font-semibold text-gray-700">Tailwind CSS</span>
          <span className="text-xs text-indigo-500 mt-1">Framework CSS</span>
        </div>
      </div>
    </div>
    
    {/* Backend Column */}
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-800">Backend</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* PHP Card */}
        <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col items-center text-center">
          <div className="mb-3 p-3 bg-purple-50 rounded-full">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/2/27/PHP-logo.svg" 
              alt="PHP" 
              className="w-10 h-10"
            />
          </div>
          <span className="font-semibold text-gray-700">PHP</span>
          <span className="text-xs text-purple-500 mt-1">Langage serveur</span>
        </div>
        
        {/* MySQL Card */}
        <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col items-center text-center">
          <div className="mb-3 p-3 bg-blue-50 rounded-full">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/b/b2/Database-mysql.svg" 
              alt="MySQL" 
              className="w-10 h-10"
            />
          </div>
          <span className="font-semibold text-gray-700">MySQL</span>
          <span className="text-xs text-blue-500 mt-1">Base de données</span>
        </div>
        
        
      </div>
    </div>
  </div>
  
  {/* Decorative Elements */}
  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
</section>

        {/* Call to Action */}
        <section className="text-center">
          <h3 className="text-2xl font-semibold text-gray-700 mb-6">
            Prêt à nous rejoindre ?
          </h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg shadow-md transition duration-300"
            >
              Créer un compte
            </Link>
            <Link
              to="/login"
              className="bg-white hover:bg-gray-100 text-indigo-600 font-medium py-3 px-8 rounded-lg border border-indigo-600 shadow-md transition duration-300"
            >
              Se connecter
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 border-t border-gray-200 mt-12">
        <p>© {new Date().getFullYear()} Vocal Platform. El abass abdoul anziz kone</p>
      </footer>
    </div>
  );
};

export default Home;