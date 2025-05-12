import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Smile, ThumbsUp, Frown, AlertTriangle, MessageCircle, Mic, Share2 } from 'lucide-react';
import { VocalMessage as VocalMessageType } from '../types';
import AudioPlayer from './AudioPlayer';
import AudioRecorder from './AudioRecorder';
import { useAuth } from '../contexts/AuthContext';
import ShareButton from './ShareButton';

interface VocalMessageProps {
    message: VocalMessageType & { user_id: number };
    onReact: (messageId: number, type: 'laugh' | 'cry' | 'like') => void;
    onComment: (messageId: number, content: string, isAudio: boolean) => void;
    onReport: (messageId: number) => void;
    onUserClick?: (userId: number) => void;
}



export default function VocalMessage({
    message,
    onReact,
    onComment,
    onReport,
    onUserClick,
}: VocalMessageProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isCommenting, setIsCommenting] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [localComments, setLocalComments] = useState(message.comments);
    const [localReactions, setLocalReactions] = useState(message.reactions);
    const [lastReaction, setLastReaction] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const [isReporting, setIsReporting] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportCategory, setReportCategory] = useState('inappropriate');

    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
      } | null>(null);


      const handleSubmitReport = async () => {
        try {
          const token = localStorage.getItem('token');
          
          if (!token) {
            setToast({
              show: true,
              message: 'Veuillez vous reconnecter (token manquant)',
              type: 'error'
            });
            setTimeout(() => setToast(null), 3000);
            return;
          }
      
          const response = await fetch('https://p6-groupeb.com/abass/backend/api/submit_reports.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              message_id: message.id,
              reason: reportReason,
              category: reportCategory
            })
          });
      
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Erreur serveur");
          }
      
          setToast({
            show: true,
            message: 'Signalement envoyé avec succès !',
            type: 'success'
          });
          setTimeout(() => setToast(null), 3000);
          
          setIsReporting(false);
          setReportReason('');
          setReportCategory('inappropriate');
          
        } catch (error) {
          console.error("Erreur complète:", error);
          
          setToast({
            show: true,
            message: error.message || "Erreur lors du signalement",
            type: 'error'
          });
          setTimeout(() => setToast(null), 3000);
        }
    };

      
    // Gestion du clic à l'extérieur de la modale
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsCommentsModalOpen(false);
            }
        }

        if (isCommentsModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCommentsModalOpen]);

    const handleAudioComment = async (blob: Blob) => {
        setIsSending(true);
        setError(null);

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;

                const newComment = {
                    id: Date.now(),
                    content: base64Audio,
                    is_audio: true,
                    created_at: new Date().toISOString(),
                    username: user?.username || "Utilisateur"
                };
                setLocalComments([...localComments, newComment]);

                await onComment(message.id, base64Audio, true);
                setIsCommenting(false);
            };
            reader.readAsDataURL(blob);
        } catch (err) {
            setError("Erreur lors de l'envoi du commentaire audio");
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    const handleTextComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setIsSending(true);
        setError(null);

        try {
            const newComment = {
                id: Date.now(),
                content: commentText,
                is_audio: false,
                created_at: new Date().toISOString(),
                username: user?.username || "Utilisateur"
            };
            setLocalComments([...localComments, newComment]);

            await onComment(message.id, commentText, false);
            setCommentText('');
            setIsCommenting(false);
        } catch (err) {
            setError("Erreur lors de l'envoi du commentaire");
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    const handleReaction = (type: 'laugh' | 'cry' | 'like') => {
        const updatedReactions = { ...localReactions };

        if (lastReaction === type) {
            updatedReactions[type]--;
            setLastReaction(null);
        } else {
            if (lastReaction) {
                updatedReactions[lastReaction as keyof typeof updatedReactions]--;
            }
            updatedReactions[type]++;
            setLastReaction(type);
        }

        setLocalReactions(updatedReactions);
        onReact(message.id, type);
    };

    const displayUsername = message.username || user?.username || "Utilisateur";

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                        {format(new Date(message.created_at), 'PPp', { locale: fr })}
                    </span>
                    <button
  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
  onClick={(e) => {
    e.stopPropagation(); // Empêche la propagation de l'événement
    if (onUserClick) {
      onUserClick(message.user_id);
    } else {
      navigate(`/user/${message.user_id}/messages`);
    }
  }}
>
  @{displayUsername}
</button>

                    {toast && (
  <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
    toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }`}>
    {toast.message}
  </div>
)}

                </div>
                <button
  onClick={() => setIsReporting(true)}
  className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
>
  <AlertTriangle className="h-4 w-4" />
  Signaler
</button>
            </div>

            {/* Audio avec bouton de partage */}
            
<div className="flex items-start gap-4 mb-4">
  {/* Ajoutez cette section pour le titre */}
  <div className="flex-1">
    <h3 className="font-semibold text-lg mb-2">{message.title}</h3>
    <AudioPlayer
      src={message.audio_url}
      className="w-full"
      audioProps={{
        controls: true,
        controlsList: "nodownload noplaybackrate"
      }}
    />
  </div>
  <ShareButton 
    messageId={message.id}
    audioUrl={message.audio_url}
    username={displayUsername}
    messageUserId={message.user_id}
  />
</div>

            {/* Réactions */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    type="button"
                    onClick={() => handleReaction('laugh')}
                    className={`flex items-center gap-1 ${lastReaction === 'laugh' ? 'text-yellow-500' : 'text-gray-600 hover:text-gray-800'}`}
                    aria-label="Rire"
                >
                    <Smile className="h-5 w-5" />
                    <span>{localReactions.laugh}</span>
                </button>
                <button
                    type="button"
                    onClick={() => handleReaction('cry')}
                    className={`flex items-center gap-1 ${lastReaction === 'cry' ? 'text-blue-500' : 'text-gray-600 hover:text-gray-800'}`}
                    aria-label="Pleurer"
                >
                    <Frown className="h-5 w-5" />
                    <span>{localReactions.cry}</span>
                </button>
                <button
                    type="button"
                    onClick={() => handleReaction('like')}
                    className={`flex items-center gap-1 ${lastReaction === 'like' ? 'text-green-500' : 'text-gray-600 hover:text-gray-800'}`}
                    aria-label="J'aime"
                >
                    <ThumbsUp className="h-5 w-5" />
                    <span>{localReactions.like}</span>
                </button>
            </div>

            {/* Commentaires existants */}
            {localComments.length > 0 && (
                <div className="mb-4 border-t pt-4">
                    <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                        <MessageCircle className="h-4 w-4" />
                        Commentaires ({localComments.length})
                    </h3>
                
                    {/* Afficher seulement le premier commentaire */}
                    {localComments.slice(0, 1).map((comment) => (
                        <div key={comment.id} className="mb-3 pl-4 border-l-2 border-gray-200">
                            {comment.is_audio ? (
                                <AudioPlayer
                                    src={comment.content}
                                    className="w-full max-w-md"
                                    audioProps={{
                                        controls: true,
                                        controlsList: "nodownload noplaybackrate"
                                    }}
                                />
                            ) : (
                                <p className="text-gray-700">{comment.content}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                {format(new Date(comment.created_at), 'PPp', { locale: fr })}
                                {comment.username && (
                                    <span className="ml-2 text-indigo-500">@{comment.username}</span>
                                )}
                            </p>
                        </div>
                    ))}
                
                    {localComments.length > 1 && (
                        <button
                            onClick={() => setIsCommentsModalOpen(true)}
                            className="text-sm text-indigo-600 hover:text-indigo-700 mt-2"
                        >
                            Voir tous les commentaires
                        </button>
                    )}
                </div>
            )}

            {/* Formulaire de commentaire */}
            {isCommenting ? (
                <div className="mt-4">
                    {error && (
                        <div className="mb-3 text-sm text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleTextComment} className="mb-3">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Écrire un commentaire..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            disabled={isSending}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => setIsCommenting(false)}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                                disabled={isSending}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 flex items-center gap-2"
                                disabled={isSending || !commentText.trim()}
                            >
                                {isSending ? 'Envoi...' : 'Envoyer'}
                            </button>
                        </div>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-2 bg-white text-sm text-gray-500">OU</span>
                        </div>
                    </div>

                    <div className="mt-4">
                        <AudioRecorder
                            onAudioRecorded={handleAudioComment}
                            className="w-full"
                            disabled={isSending}
                        />
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsCommenting(true)}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
                >
                    <Mic className="h-4 w-4" />
                    Ajouter un commentaire
                </button>
            )}

            {/* Modale des commentaires */}
            {isCommentsModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div 
                        ref={modalRef}
                        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Commentaires ({localComments.length})
                                </h3>
                                <button
                                    onClick={() => setIsCommentsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {localComments.map((comment) => (
                                    <div key={comment.id} className="pl-4 border-l-2 border-gray-200">
                                        {comment.is_audio ? (
                                            <AudioPlayer
                                                src={comment.content}
                                                className="w-full max-w-md"
                                                audioProps={{
                                                    controls: true,
                                                    controlsList: "nodownload noplaybackrate"
                                                }}
                                            />
                                        ) : (
                                            <p className="text-gray-700">{comment.content}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            {format(new Date(comment.created_at), 'PPp', { locale: fr })}
                                            {comment.username && (
                                                <span className="ml-2 text-indigo-500">@{comment.username}</span>
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}


{isReporting && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h3 className="text-xl font-bold mb-4">Signaler ce message</h3>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">Catégorie</label>
        <select
          value={reportCategory}
          onChange={(e) => setReportCategory(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="inappropriate">Contenu inapproprié</option>
          
          <option value="harassment">Harcèlement</option>
          <option value="other">Autre</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Description *</label>
        <textarea
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          placeholder="Pourquoi signalez-vous ce message ?"
          className="w-full p-2 border rounded h-32"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setIsReporting(false)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmitReport}
          disabled={!reportReason.trim()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Envoyer le signalement
        </button>
      </div>
    </div>
  </div>
)}

        </div>
    );
}