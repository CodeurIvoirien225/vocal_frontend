import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, ChevronLeft } from 'lucide-react';
import VocalMessage from '../components/VocalMessage';
import { useAuth } from '../contexts/AuthContext';

export default function UserMessages() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUserMessages = async () => {
            try {
                const response = await fetch(`https://p6-groupeb.com/abass/backend/api/messages.php?user_id=${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

                const data = await response.json();
                if (!data.success) throw new Error(data.error || 'Erreur serveur');

                setMessages(data.messages || []);
                setUsername(data.username || data.messages?.[0]?.username || 'Utilisateur');
            } catch (err) {
                console.error('Erreur:', err);
                setMessages([]);
                setUsername('Utilisateur inconnu');
            } finally {
                setLoading(false);
            }
        };

        fetchUserMessages();
    }, [userId]);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow sticky top-0 z-10 p-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-gray-100"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-xl font-bold">
                        Messages de @{username}
                    </h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div>Chargement...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                        <Mic className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">
                            {username === 'Utilisateur inconnu' ? 'Utilisateur non trouvé' : 'Aucun message trouvé'}
                        </h3>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {messages.map((message) => (
                            <VocalMessage
                                key={message.id}
                                message={message}
                                onReact={() => {}}
                                onComment={() => {}}
                                onReport={() => {}}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}