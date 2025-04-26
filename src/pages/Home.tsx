// pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';

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
                src="src/pages/photo.jpg"
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