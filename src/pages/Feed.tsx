import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Mic, BarChart2, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { VocalMessage as VocalMessageType } from '../types';
import VocalMessage from '../components/VocalMessage';
import AudioRecorder from '../components/AudioRecorder';

export default function Feed() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<VocalMessageType[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 5;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMessages();
  }, [user, navigate]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://p6-groupeb.com/abass/backend/api/messages.php', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calcul des messages à afficher pour la page courante
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = messages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(messages.length / messagesPerPage);

  const handleAudioRecorded = async (blob: Blob, title: string) => {
    const formData = new FormData();
    formData.append('audio', blob);
    formData.append('title', title);
  
    try {
      const response = await fetch('https://p6-groupeb.com/abass/backend/api/messages.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });


      const data = await response.json();
      if (data.success) {
        fetchMessages();
        // Revenir à la première page après l'ajout d'un nouveau message
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Error uploading audio:', err);
    }
  };

  const handleReact = async (messageId: number, type: string) => {
    try {
        const response = await fetch('https://p6-groupeb.com/abass/backend/api/reactions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                message_id: messageId,
                type: type
            })
        });

        if (!response.ok) {
            throw new Error('Erreur serveur');
        }
    } catch (error) {
        console.error("Erreur:", error);
    }
  };

  const handleComment = async (messageId: number, content: string, isAudio: boolean) => {
    try {
        const response = await fetch('https://p6-groupeb.com/abass/backend/api/comments.php', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message_id: messageId, 
                content, 
                is_audio: isAudio 
            })
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Réponse serveur invalide: ${text.substring(0, 100)}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Erreur inconnue du serveur');
        }

        fetchMessages();
    } catch (err) {
        console.error('Error adding comment:', err);
        alert('Erreur lors de l\'ajout du commentaire. Veuillez réessayer.');
    }
  };

  const handleReport = async (messageId: number) => {
    try {
      const response = await fetch('https://p6-groupeb.com/abass/backend/api/reports.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message_id: messageId })
      });
      const data = await response.json();
      if (data.success) {
        alert('Message signalé avec succès');
      }
    } catch (err) {
      console.error('Error reporting message:', err);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mic className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                Vocal_Platform
              </h1>
            </div>
            
            <button
              className="sm:hidden text-gray-600 hover:text-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <div className="hidden sm:flex items-center gap-4">
              {user && (
                <span className="text-gray-700 font-medium">
                  {user.username || user.name}
                </span>
              )}
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-800"
                title="Dashboard"
              >
                <BarChart2 className="h-6 w-6" />
              </button>
              <button
                onClick={() => navigate('/notifications')}
                className="text-gray-600 hover:text-gray-800"
              >
                <Bell className="h-6 w-6" />
              </button>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

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
                  navigate('/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <BarChart2 className="h-5 w-5 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  navigate('/notifications');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <Bell className="h-5 w-5 mr-2" />
                Notifications
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {loading ? (
          <div>Chargement...</div>
        ) : (
          <div className="space-y-6">
            {currentMessages.map((message) => (
              <VocalMessage
                key={message.id}
                message={message}
                onReact={handleReact}
                onComment={handleComment}
                onReport={handleReport}
                onUserClick={(userId) => navigate(`/user/${userId}/messages`)}
              />
            ))}

            {/* Pagination */}
            {messages.length > messagesPerPage && (
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center px-4 py-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Précédent
                </button>
                
                <span className="text-gray-600">
                  Page {currentPage} sur {totalPages}
                </span>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-4 py-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
                >
                  Suivant
                  <ChevronRight className="h-5 w-5 ml-1" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <div className="fixed bottom-6 right-6 z-20">
        <AudioRecorder
          onAudioRecorded={handleAudioRecorded}
          className="bg-white rounded-full shadow-lg p-4 border border-gray-200"
        />
      </div>
    </div>
  );
}