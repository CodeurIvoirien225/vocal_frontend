import React, { createContext, useContext, useState, useEffect } from 'react';

// Interface pour le type User
export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
  // Ajoutez d'autres champs si nécessaire
}

// Interface pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider d'authentification
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Vérification de l'authentification au montage
  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthLoading(true);
      const storedToken = localStorage.getItem('token');
  
      if (!storedToken) {
        setIsAuthLoading(false);
        return;
      }
  
      try {
        const response = await fetch('https://p6-groupeb.com/abass/backend/api/verify-token.php', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        const responseText = await response.text();
        if (!responseText.trim()) {
          throw new Error('Réponse vide du serveur');
        }

        const data = JSON.parse(responseText);
  
        if (!response.ok) {
          throw new Error(data.error || 'Erreur de vérification du token');
        }
  
        const userData = data.user || data;
        if (userData.id) {
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          throw new Error('Données utilisateur manquantes');
        }
      } catch (error) {
        console.error('Erreur de vérification du token:', error);
        logout();
      } finally {
        setIsAuthLoading(false);
      }
    };
  
    checkAuth();
  }, []);

  // Fonction de connexion
// Fonction de connexion modifiée
const login = async (email: string, password: string) => {
  try {
    const response = await fetch('https://p6-groupeb.com/abass/backend/api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : {};

    if (!response.ok) {
      // Si le backend retourne une erreur spécifique
      if (data.error === 'email') {
        throw new Error('email'); // Propage l'erreur spécifique
      } else if (data.error === 'password') {
        throw new Error('password'); // Propage l'erreur spécifique
      } else {
        throw new Error(data.message || 'Erreur de connexion');
      }
    }

    if (data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
    } else {
      throw new Error('Données de connexion incomplètes');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error; // Propage l'erreur pour la gérer dans le composant
  }
};



  // Fonction d'inscription
  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch('https://p6-groupeb.com/abass/backend/api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur d\'inscription');
      }

      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Données d\'inscription incomplètes');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Fonction pour mettre à jour l'utilisateur
const updateUser = (userData: User) => {
  setUser(prev => ({
    ...prev, // Garde les anciennes valeurs
    ...userData // Ajoute les nouvelles valeurs
  }));
  localStorage.setItem('user', JSON.stringify({
    ...JSON.parse(localStorage.getItem('user') || '{}'), // Anciennes valeurs
    ...userData // Nouvelles valeurs
  }));
};

  // Valeur du contexte
  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    isAuthLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {isAuthLoading ? <div>Chargement de l'authentification...</div> : children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}