import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, Trash } from 'lucide-react';

interface AudioRecorderProps {
  onAudioRecorded: (blob: Blob, title: string) => void; // Modifié pour inclure le titre
  className?: string;
}

export default function AudioRecorder({ onAudioRecorded, className = '' }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [title, setTitle] = useState(''); // Nouvel état pour le titre
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
    if (audioBlob && title.trim()) { // Vérifie que le titre n'est pas vide
      onAudioRecorded(audioBlob, title.trim());
      setAudioBlob(null);
      setTitle(''); // Réinitialise le titre après envoi
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
    <div className={`flex items-center gap-4 flex-wrap ${className}`}>
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

      {/* Lecteur audio et champ de titre */}
      {audioBlob && (
        <div className="flex flex-col gap-4 w-full">
          <audio
            controls
            src={URL.createObjectURL(audioBlob)}
            className="h-10"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ajouter un titre à votre enregistrement"
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      )}

      {/* Bouton Supprimer */}
      {audioBlob && (
        <button
          onClick={handleDelete}
          className="p-2 rounded-full bg-gray-300 text-gray-800 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <Trash className="h-6 w-6" />
        </button>
      )}

      {/* Bouton Envoyer */}
      {audioBlob && (
        <button
          onClick={handleSend}
          disabled={!title.trim()} // Désactive si le titre est vide
          className={`p-2 rounded-full ${title.trim() ? 'bg-green-600 hover:bg-green-700' : 'bg-green-300 cursor-not-allowed'} text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
        >
          <Send className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
