import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, Trash, Pause, Play } from 'lucide-react';

interface AudioRecorderProps {
  onAudioRecorded: (blob: Blob, title: string) => void;
}

export default function AudioRecorder({ onAudioRecorded }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [title, setTitle] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setCountdown(60);

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

      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Erreur d'accès au micro :", err);
      alert("Impossible d'accéder au microphone. Vérifiez les permissions.");
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

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
      setIsPlaying(false);
    }
  };

  const handleDelete = () => {
    setAudioBlob(null);
    setTitle('');
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-end gap-4">
      {!audioBlob ? (
        <div className="flex items-center gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="p-4 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 shadow-lg"
              title="Commencer l'enregistrement"
            >
              <Mic className="h-6 w-6" />
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={stopRecording}
                className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 shadow-lg"
                title="Arrêter l'enregistrement"
              >
                <Square className="h-6 w-6" />
              </button>
              <div className="bg-white px-4 py-2 rounded-lg shadow-md">
                <span className="text-red-600 font-medium">
                  Enregistrement... {countdown}s
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Votre enregistrement</h3>
              <button
                onClick={handleDelete}
                className="text-gray-500 hover:text-red-600 transition-colors duration-200"
                title="Supprimer"
              >
                <Trash className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayback}
                className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors duration-200"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <audio
                ref={audioRef}
                src={audioBlob ? URL.createObjectURL(audioBlob) : ''}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isPlaying ? 'bg-indigo-600 animate-pulse' : 'bg-gray-300'}`}
                  style={{ width: isPlaying ? '100%' : '0%' }}
                ></div>
              </div>
            </div>

            <div className="mt-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre de l'enregistrement
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Donnez un titre à votre message vocal"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                maxLength={255}
              />
              <p className="text-xs text-gray-500 mt-1">{title.length}/255 caractères</p>
            </div>

            <button
              onClick={handleSend}
              disabled={!title.trim()}
              className={`mt-2 w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${title.trim() ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} transition-colors duration-200`}
            >
              <Send className="h-5 w-5" />
              Envoyer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}