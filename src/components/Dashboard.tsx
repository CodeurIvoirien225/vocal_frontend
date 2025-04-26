import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Mic, BarChart2, User, MessageCircle, Heart, CheckCircle, Share2, Home, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AudioPlayer from '../components/AudioPlayer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';



const safeDisplay = (value: unknown): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
};

interface StatsData {
    success: boolean;
    data?: {
        messages: number;
        likes: number;
        comments: number;
        shares: number;
    };
    user?: {
        id: number;
        username: string;
        email: string;
        created_at: string;
    };
}

interface UserStats {
    total_messages: number;
    total_likes: number;
    total_comments: number;
    total_shares: number;
}

interface Comment {
    id: number;
    user_id: number;
    message_id: number;
    content: string;
    created_at: string;
    username: string;
}

interface UserMessage {
    id: number;
    audio_url: string;
    created_at: string;
    username: string;
    reactions: {
        laugh: number;
        cry: number;
        like: number;
    };
    comments: Comment[];
}






export default function Dashboard() {
  const { user, updateUser, logout } = useAuth(); // Destructurez updateUser
    const navigate = useNavigate();
    const [stats, setStats] = useState<UserStats>({
        total_messages: 0,
        total_likes: 0,
        total_comments: 0,
        total_shares: 0
    });
    const [messages, setMessages] = useState<UserMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('messages');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedMessageForComments, setSelectedMessageForComments] = useState<UserMessage | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);


    
const [isChangingPassword, setIsChangingPassword] = useState(false);
const [passwordData, setPasswordData] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});
const [passwordError, setPasswordError] = useState<string | null>(null);

    
const [modalState, setModalState] = useState({
  showConfirmDelete: false,
  showError: false,
  messageIdToDelete: null as number | null,
  errorMessage: '',
});


const [isEditing, setIsEditing] = useState(false);
const [editedUser, setEditedUser] = useState({
    username: user?.username || '',
    email: user?.email || ''
});
const [updateError, setUpdateError] = useState<string | null>(null);
const [isUpdating, setIsUpdating] = useState(false);

const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
        ...prev,
        [name]: value
    }));
};



const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setPasswordData(prev => ({
    ...prev,
    [name]: value
  }));
};


const handleChangePassword = async () => {
  // Validation côté client
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    setPasswordError('Les nouveaux mots de passe ne correspondent pas');
    return;
  }

  if (passwordData.newPassword.length < 6) {
    setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
    return;
  }

  try {
    setPasswordError(null);
    setIsUpdating(true);

    // Récupération du token JWT depuis le localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Session expirée - Veuillez vous reconnecter');
    }

    const response = await fetch('https://p6-groupeb.com/abass/backend/api/change-password.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Ajout du token JWT
      },
      body: JSON.stringify({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      }),
    });

    // Gestion spécifique des erreurs 401 (Non autorisé)
    if (response.status === 401) {
      localStorage.removeItem('token'); // Nettoyage du token invalide
      throw new Error('Session expirée - Veuillez vous reconnecter');
    }

    // Vérification du type de contenu
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Réponse non-JSON:', text);
      throw new Error('Le serveur a renvoyé une réponse inattendue');
    }

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Échec de la modification du mot de passe');
    }

    // Succès
    setSuccessMessage('Mot de passe modifié avec succès');
    setTimeout(() => setSuccessMessage(null), 3000);
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

  } catch (err) {
    console.error('Erreur modification mot de passe:', err);
    
    let errorMessage = 'Une erreur est survenue';
    if (err instanceof Error) {
      errorMessage = err.message;
      // Messages d'erreur plus conviviaux
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Problème de connexion au serveur';
      } else if (err.message.includes('Unexpected token')) {
        errorMessage = 'Erreur de configuration du serveur';
      } else if (err.message.includes('401')) {
        errorMessage = 'Session expirée - Veuillez vous reconnecter';
      }
    }
    
    setPasswordError(errorMessage);
  } finally {
    setIsUpdating(false);
  }
};



const handleUpdateUser = async () => {
  if (!user) return;
  
  setIsUpdating(true);
  setUpdateError(null);
  
  try {
    const response = await fetch('https://p6-groupeb.com/abass/backend/api/update-user.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(editedUser)
    });

    const data = await response.json();

    if (data.success && data.user) {
      updateUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsEditing(false);
      // Afficher le message de succès
      setSuccessMessage('Vos informations ont été mises à jour avec succès');
      // Faire disparaître le message après 3 secondes
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      throw new Error(data.error || 'Échec de la mise à jour');
    }
  } catch (err) {
    console.error('Update error:', err);
    setUpdateError(err instanceof Error ? err.message : 'Une erreur est survenue');
  } finally {
    setIsUpdating(false);
  }
};




    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [statsRes, messagesRes] = await Promise.all([
                fetch('https://p6-groupeb.com/abass/backend/api/stats.php', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }),
                fetch('https://p6-groupeb.com/abass/backend/api/messages.php?user_only=true', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
            ]);

            if (!statsRes.ok) throw new Error('Stats fetch failed');
            if (!messagesRes.ok) throw new Error('Messages fetch failed');

            const statsData: StatsData = await statsRes.json();
            
            const messagesData = await messagesRes.json();


            if (statsData.success && statsData.data) {
                setStats({
                    total_messages: statsData.data.messages || 0,
                    total_likes: statsData.data.likes || 0,
                    total_comments: statsData.data.comments || 0,
                    total_shares: statsData.data.shares || 0
                });
            }

            

            setMessages(messagesData.messages || []);

        } catch (err) {
            console.error('Fetch error:', err);
            setError('Erreur lors du chargement des données');
            setStats({
                total_messages: 0,
                total_likes: 0,
                total_comments: 0,
                total_shares: 0
            });
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteClick = (messageId: number) => {
      setModalState({
        showConfirmDelete: true,
        showError: false,
        messageIdToDelete: messageId,
        errorMessage: ''
      });
    };
    
    const handleConfirmDelete = async (messageId: number) => {
      try {
        const response = await fetch('https://p6-groupeb.com/abass/backend/api/messages.php', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message_id: messageId })
        });
    
        const data = await response.json();
    
        if (data.success) {
          setMessages(messages.filter(msg => msg.id !== messageId));
          setStats(prev => ({
            ...prev,
            total_messages: prev.total_messages - 1
          }));
        } else {
          throw new Error(data.error || 'Échec de la suppression');
        }
      } catch (err) {
        console.error('Error deleting message:', err);
        setModalState({
          showConfirmDelete: false,
          showError: true,
          messageIdToDelete: null,
          errorMessage: 'Erreur lors de la suppression du message'
        });
      }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement de votre dashboard...</p>
                </div>
            </div>
        );
    } 

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mic className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                Vocal_Platform
              </h1>
            </div>
            
            {/* Bouton hamburger pour mobile */}
            <button
              className="sm:hidden text-gray-600 hover:text-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Navigation desktop (inchangée) */}
            <div className="hidden sm:flex items-center gap-4">
              <button
                onClick={() => navigate('/feed')}
                className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md flex items-center gap-1"
              >
                <Home className="h-5 w-5" />
                <span className="hidden md:inline">Accueil</span>
              </button>
              {user && (
                <span className="text-gray-700 font-medium">
                  {user.username || user.name}
                </span>
              )}
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white py-4 px-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {user && (
                <span className="text-gray-700 font-medium py-2">
                  Connecté en tant que: {user.username || user.name}
                </span>
              )}
              <button
                onClick={() => {
                  navigate('/feed');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <Home className="h-5 w-5 mr-2" />
                Accueil
              </button>
              <button
                onClick={() => {
                  setActiveTab('messages');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <Mic className="h-5 w-5 mr-2" />
                Mes Publications
              </button>
        
              <button
                onClick={() => {
                  setActiveTab('account');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <User className="h-5 w-5 mr-2" />
                Mon Compte
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <h2 className="text-2xl font-bold">Mon Tableau de Bord</h2>
            <p className="mt-2 opacity-90">Bienvenue dans votre espace personnel</p>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
              <div className="bg-indigo-50 rounded-lg p-4 flex items-center">
                <div className="p-3 bg-indigo-100 rounded-full mr-4">
                  <Mic className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Publications</p>
                  <p className="text-2xl font-bold">{safeDisplay(stats?.total_messages)}</p>
                </div>
              </div>

              <div className="bg-pink-50 rounded-lg p-4 flex items-center">
                <div className="p-3 bg-pink-100 rounded-full mr-4">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Likes reçus</p>
                  <p className="text-2xl font-bold">{safeDisplay(stats?.total_likes)}</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 flex items-center">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Commentaires</p>
                  <p className="text-2xl font-bold">{safeDisplay(stats?.total_comments)}</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 flex items-center">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                  <Share2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Partages</p>
                  <p className="text-2xl font-bold">{safeDisplay(stats?.total_shares)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'messages' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Mes Publications
              </button>

              <button
                onClick={() => setActiveTab('account')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'account' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Mon Compte
              </button>
            </nav>
          </div>

          <div className="p-6">
      {activeTab === 'messages' && (
        <div>
          <h3 className="text-lg font-medium mb-4">Mes Publications Audio</h3>
          <button 
            onClick={() => navigate('/feed')}
            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
          >
            <Home className="h-4 w-4 mr-1" />
            Voir le feed global
          </button>

          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Mic className="mx-auto h-12 w-12 text-gray-400" />
              <h4 className="mt-2 text-sm font-medium text-gray-900">Aucune publication</h4>
              <p className="mt-1 text-sm text-gray-500">Commencez par publier votre premier message audio.</p>
              <button
                onClick={() => navigate('/feed')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Publier un message
              </button>
                                                </div>
                                ) : (
                                    <div className="space-y-6">
                                        {messages.map((message) => (
                                            <div key={message.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <span className="font-medium text-gray-900">@{message.username}</span>
                                                            <span className="mx-2 text-gray-400">•</span>
                                                            <span className="text-sm text-gray-500">
                                                                {format(new Date(message.created_at), 'PPp', { locale: fr })}
                                                            </span>
                                                        </div>
                                                        <AudioPlayer
                                                            src={message.audio_url}
                                                            className="w-full"
                                                            audioProps={{
                                                                controls: true,
                                                                controlsList: "nodownload noplaybackrate"
                                                            }}
                                                        />
                                                    </div>
                                                    <button
  onClick={() => handleDeleteClick(message.id)}
  className="ml-4 text-red-600 hover:text-red-800 text-sm"
>
  Supprimer
</button>
                                                </div>
                                                <div className="mt-4 flex items-center space-x-6 text-sm">
                                                    <span className="flex items-center text-gray-600">
                                                        <Heart className="h-4 w-4 mr-1" />
                                                        {safeDisplay(message.reactions.like)} likes
                                                    </span>
                                                    {message.comments.length > 0 && (
                                                        <button
                                                            onClick={() => setSelectedMessageForComments(message)}
                                                            className="flex items-center text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            <MessageCircle className="h-4 w-4 mr-1" />
                                                            Voir les {message.comments.length} commentaires
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )} 

{activeTab === 'account' && (
    <div className="w-full">
        <h3 className="text-lg md:text-xl font-medium mb-4">Mon Compte</h3>
        
        {updateError && (
            <div className="mb-4 p-3 md:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm md:text-base">
                {updateError}
            </div>
        )}

        <div className="bg-white shadow overflow-hidden rounded-lg">
            {/* Header section */}
            <div className="px-3 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center flex-1 min-w-0">
                    <div className="p-2 sm:p-3 bg-indigo-100 rounded-full mr-3 sm:mr-4">
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                    </div>
                    <div className="truncate">
                        <h4 className="text-base sm:text-lg leading-6 font-medium text-gray-900 truncate">
                            Informations du compte
                        </h4>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500 truncate">
                            Détails personnels
                        </p>
                    </div>
                </div>
                
                {/* Buttons section */}
                <div className="flex sm:flex-none justify-end">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm sm:text-base"
                        >
                            Modifier
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditedUser({
                                        username: user?.username || '',
                                        email: user?.email || ''
                                    });
                                }}
                                className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm sm:text-base"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleUpdateUser}
                                disabled={isUpdating}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm sm:text-base"
                            >
                                {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Account details */}
            <div className="border-t border-gray-200 px-3 py-4 sm:px-6 sm:py-5">
                <dl className="space-y-4 sm:space-y-0 sm:divide-y sm:divide-gray-200">
                    {/* Username field */}
                    <div className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500 pb-1 sm:pb-0">
                            Nom d'utilisateur
                        </dt>
                        <dd className="text-sm text-gray-900 sm:col-span-2">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="username"
                                    value={editedUser.username}
                                    onChange={handleEditChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                                />
                            ) : (
                                <div className="py-2">{user?.username || 'Non défini'}</div>
                            )}
                        </dd>
                    </div>

                    {/* Email field */}
                    <div className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-4 pt-4 sm:pt-5">
                        <dt className="text-sm font-medium text-gray-500 pb-1 sm:pb-0">
                            Email
                        </dt>
                        <dd className="text-sm text-gray-900 sm:col-span-2">
                            {isEditing ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={editedUser.email}
                                    onChange={handleEditChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                                />
                            ) : (
                                <div className="py-2">{user?.email || 'Non défini'}</div>
                            )}
                        </dd>
                    </div>

                    {/* Registration date */}
                    
                    <div className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-4 pt-4 sm:pt-5">
                        <dt className="text-sm font-medium text-gray-500 pb-1 sm:pb-0">
                            Date d'inscription
                        </dt>
                        <dd className="text-sm text-gray-900 sm:col-span-2 py-2">
                          
                       
        {user?.created_at 
            ? format(new Date(user.created_at), 'PPpp', { locale: fr }) 
            : 'Inconnue'}
   
                            
                        </dd>
                    </div>
                </dl>
            </div>
        </div>

        {/* Logout button */}
        <div className="mt-4 sm:mt-6">

{/* Section modification du mot de passe */}
<div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
    <h3 className="text-lg leading-6 font-medium text-gray-900">
      Modification du mot de passe
    </h3>
  </div>
  
  <div className="px-4 py-5 sm:p-6">
    {!isChangingPassword ? (
      <button
        onClick={() => setIsChangingPassword(true)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        Changer mon mot de passe
      </button>
    ) : (
      <div className="space-y-4">
        {passwordError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {passwordError}
          </div>
        )}

        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Mot de passe actuel
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmer le nouveau mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={() => {
              setIsChangingPassword(false);
              setPasswordError(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleChangePassword}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Enregistrer
          </button>
        </div>
      </div>
    )}
  </div>
</div>


            <button
                onClick={logout}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
                <LogOut className="h-4 w-4" />
                Se déconnecter
            </button>
        </div>
    </div>
)}
                    </div>
                </div>

                {/* Popup des commentaires */}
{selectedMessageForComments && (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={() => setSelectedMessageForComments(null)} // Ferme la popup quand on clique sur le fond
    >
        <div 
            className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Empêche la fermeture quand on clique sur la popup
        >
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Commentaires</h3>
                    <button
                        onClick={() => setSelectedMessageForComments(null)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                {selectedMessageForComments.comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucun commentaire</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedMessageForComments.comments.map(comment => (
                        <div key={comment.id} className="text-sm border-b pb-3">
                          <div className="flex items-center">
                            <span className="font-medium">@{comment.username}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-gray-500 text-xs">
                              {format(new Date(comment.created_at), 'PPp', { locale: fr })}
                            </span>
                          </div>
                          
                          {(comment.content.startsWith('/uploads/') || 
                 comment.content.startsWith('blob:') || 
                 comment.content.startsWith('data:audio/') || 
                 (comment as any).is_audio) ? (
                  <div className="mt-2">
                    <AudioPlayer
                      src={comment.content}
                      className="w-full"
                      audioProps={{
                        controls: true,
                        controlsList: "nodownload noplaybackrate"
                      }}
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-gray-700">{comment.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* Modal de confirmation de suppression */}
{modalState.showConfirmDelete && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-md w-full">
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">Confirmer la suppression</h3>
        <p className="text-gray-600 mb-6">Voulez-vous vraiment supprimer ce message ?</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setModalState(prev => ({...prev, showConfirmDelete: false}))}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              if (modalState.messageIdToDelete) {
                handleConfirmDelete(modalState.messageIdToDelete);
              }
              setModalState(prev => ({...prev, showConfirmDelete: false}));
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Modal d'erreur */}
{modalState.showError && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-md w-full">
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4 text-red-600">Erreur</h3>
        <p className="text-gray-600 mb-6">{modalState.errorMessage}</p>
        
        <div className="flex justify-end">
          <button
            onClick={() => setModalState(prev => ({...prev, showError: false}))}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/*  modale de succès */}
{successMessage && (
  <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-500">
    <div className="flex items-center">
    <CheckCircle className="h-6 w-6 mr-2" />
      <span>{successMessage}</span>
    </div>
  </div>
)}

      </main>
    </div>
  );
}