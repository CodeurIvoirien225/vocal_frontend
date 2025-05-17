import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, Trash } from 'lucide-react';

interface AudioRecorderProps {
  onAudioRecorded: (blob: Blob, title: string) => void; 
  className?: string;
}

export default function AudioRecorder({ onAudioRecorded, className = '' }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [title, setTitle] = useState(''); 
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setCountdown(60); // Réinitialiser le compte à rebours

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Démarrer le compte à rebours
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Stop recording after 60 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 60000);
    } catch (err) {
      console.error("Erreur d'accès au micro :', err");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    }
  };

  const handleSend = () => {
    if (!title.trim()) {
      alert('Veuillez ajouter un titre à votre enregistrement');
      return;
    }
    
    if (title.length > 255) {
      alert('Le titre ne peut pas dépasser 255 caractères');
      return;
    }
  
    if (audioBlob) {
      onAudioRecorded(audioBlob, title.trim());
      setAudioBlob(null);
      setTitle('');
    }
  };

  const handleDelete = () => {
    setAudioBlob(null);
    setTitle(''); // Réinitialise le titre lors de la suppression
  };

  useEffect(() => {
    return () => {
      // Nettoyage des intervalles
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  return (
    <div className={`flex flex-col gap-4 w-full ${className}`}>
      <div className="flex items-center gap-4 flex-wrap">
        {/* Microphone / Stop */}
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Mic className="h-6 w-6" />
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Square className="h-6 w-6" />
          </button>
        )}

        {/* Message enregistrement en cours avec compte à rebours */}
        {isRecording && (
          <div className="flex items-center gap-2">
            <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded">
              Enregistrement en cours...
            </span>
            <span className="text-lg font-bold text-black">
              {countdown}s
            </span>
          </div>
        )}
      </div>

      {/* Lecteur audio et champ de titre */}
      {audioBlob && (
        <div className="flex flex-col gap-4 w-full">
          <audio
            controls
            src={URL.createObjectURL(audioBlob)}
            className="w-full"
          />
          
          <div className="relative w-full">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ajouter un titre à votre enregistrement"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              maxLength={255}
              required
            />
            {title.length > 0 && (
              <span className="absolute right-2 bottom-2 text-xs text-gray-500">
                {title.length}/255
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 self-end">
            {/* Bouton Supprimer */}
            <button
              onClick={handleDelete}
              className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-200"
              title="Supprimer l'enregistrement"
            >
              <Trash className="h-5 w-5" />
            </button>

            {/* Bouton Envoyer */}
            <button
              onClick={handleSend}
              disabled={!title.trim()}
              className={`p-2 rounded-full ${title.trim() ? 'bg-green-600 hover:bg-green-700' : 'bg-green-300 cursor-not-allowed'} text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200`}
              title="Envoyer l'enregistrement"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}