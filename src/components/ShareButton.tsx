import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ShareButtonProps {
    messageId: number;
    audioUrl: string;
    username: string;
    messageUserId: number;
}


export default function ShareButton({ messageId, audioUrl, username, messageUserId }: ShareButtonProps) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [shareCount, setShareCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchShareCount = async () => {
            try {
                const response = await fetch(`https://p6-groupeb.com/abass/backend/api/shares_count.php?message_id=${messageId}`);
                const data = await response.json();
                setShareCount(data.count);
            } catch (err) {
                console.error('Error fetching share count:', err);
            }
        };
        fetchShareCount();
    }, [messageId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const trackShare = async (type: string) => {
        if (!user) return;
    
        setIsLoading(true);
        try {
            const response = await fetch('https://p6-groupeb.com/abass/backend/api/shares.php', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message_id: messageId,
                    share_type: type
                })
            });
    
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Échec du partage');
            }
    
            setShareCount(data.count); // Utilisez directement le count retourné
        } catch (err) {
            console.error('Error:', err);
            alert('Le partage n\'a pas pu être enregistré');
        } finally {
            setIsLoading(false);
        }
    };

    const shareOnWhatsApp = () => {
        // Construire l'URL complète
        const fullAudioUrl = `https://p6-groupeb.com/abass/backend/${audioUrl}`;
        
        // Message avec lien cliquable
        const text = `${username} vous a envoyé un message vocal ! \n${fullAudioUrl}\n\n Ecouter et faite aussi une publication audio en vous inscrivant via ce lien : https://vocal-frontend.onrender.com`;
        
        // Encodage URL
        const encodedText = encodeURIComponent(text);
        const whatsappUrl = `https://wa.me/?text=${encodedText}`;
        
        window.open(whatsappUrl, '_blank');
        trackShare('whatsapp');
    };
    

    const shareOnFacebook = () => {
        const fullAudioUrl = `https://p6-groupeb.com/abass/backend/${audioUrl}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullAudioUrl)}`;
        window.open(facebookUrl, '_blank');
        trackShare('facebook');
    };
    
    const shareOnTwitter = () => {
        const fullAudioUrl = `https://p6-groupeb.com/abass/backend/${audioUrl}`;
        const text = `${username}  vous a envoyé un message vocal ! Ecouter et faite aussi une publication audio en vous inscrivant via ce lien  : https://vocal-frontend.onrender.com`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullAudioUrl)}`;
        window.open(twitterUrl, '_blank');
        trackShare('twitter');
    };

    const copyLink = () => {
        const fullAudioUrl = `https://p6-groupeb.com/abass/backend/${audioUrl}`;
        navigator.clipboard.writeText(fullAudioUrl);
        trackShare('link');
    };

    return (
        <div className="relative flex items-center gap-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm"
                disabled={isLoading}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Partager
            </button>
            
            {shareCount > 0 && (
                <span className="text-sm text-gray-500">
                 (   {shareCount} {shareCount > 1 ? '' : ''} )
                </span> 
            )}

            {isOpen && (
                <div ref={dropdownRef} className="absolute z-10 right-0 mt-8 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                        <button
                            onClick={shareOnWhatsApp}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            disabled={isLoading}
                        >
                            <svg className="h-5 w-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            WhatsApp
                        </button>
                        <button
                            onClick={shareOnFacebook}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            disabled={isLoading}
                        >
                            <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                            </svg>
                            Facebook
                        </button>
                        <button
                            onClick={shareOnTwitter}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            disabled={isLoading}
                        >
                            <svg className="h-5 w-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                            Twitter
                        </button>
                        <button
                            onClick={copyLink}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            disabled={isLoading}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            Copier le lien
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}