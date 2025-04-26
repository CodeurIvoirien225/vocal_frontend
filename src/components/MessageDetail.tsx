import React from 'react';
import VocalMessage from './VocalMessage'; // Assurez-vous que le chemin est correct
import { useAuth } from '../contexts/AuthContext'; // Si vous utilisez l'authentification

interface MessageDetailProps {
  message: any; // Remplacez 'any' par le type de votre objet message
  // ... d'autres props si nécessaire
}

const MessageDetail: React.FC<MessageDetailProps> = ({ message }) => {
  const { user } = useAuth();

  const handleCommentSubmit = async (messageId: number, content: string, isAudio: boolean) => {
    try {
      const response = await fetch('https://p6-groupeb.com/abass/backend/api/comments.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Récupérez le token d'authentification
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_id: messageId,
          content: content,
          is_audio: isAudio,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur lors de l\'envoi du commentaire:', errorData);
        // Ici, vous devriez gérer l'erreur, par exemple afficher un message à l'utilisateur
        return;
      }

      const successData = await response.json();
      console.log('Commentaire envoyé avec succès:', successData);
      // Ici, vous pouvez potentiellement mettre à jour l'état local des commentaires
      // ou refetcher les commentaires pour afficher le nouveau commentaire.
    } catch (error) {
      console.error('Erreur lors de la requête d\'envoi du commentaire:', error);
      // Ici, vous devriez gérer l'erreur, par exemple afficher un message à l'utilisateur
    }
    // N'oubliez pas : PAS D'APPEL À L'API notifications.php ICI.
    // Votre backend (comments.php) gère la création de la notification.
  };

  return (
    <div>
      {/* ... Affichage des détails du message (par exemple, l'audio original) ... */}
      <VocalMessage
        message={message}
        onReact={() => {}} // Implémentez votre logique de réaction
        onComment={handleCommentSubmit} // Passez la fonction à VocalMessage
        onReport={() => {}} // Implémentez votre logique de signalement
      />
      {/* ... Autres éléments de l'interface utilisateur ... */}
    </div>
  );
};

export default MessageDetail;