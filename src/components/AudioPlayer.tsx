import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export default function AudioPlayer({ src, className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const fullSrc = src.startsWith('/uploads/') 
    ? `https://p6-groupeb.com/abass/backend${src}`
    : src;

  useEffect(() => {
    // Réinitialiser lors du changement de source
    setIsPlaying(false);
    setProgress(0);
    setHasError(false);
  }, [src]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Vérifier que la source est valide avant de jouer
        if (!audioRef.current.src) {
          throw new Error("Aucune source audio valide");
        }
        
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Erreur de lecture :", err);
      setHasError(true);
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsPlaying(false);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={togglePlay}
        disabled={hasError || !src}
        className={`p-2 rounded-full ${hasError ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      >
        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
      </button>

      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <audio
        ref={audioRef}
        src={fullSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onError={handleError}
        preload="metadata"
      />

      {hasError && (
        <span className="text-sm text-red-600 ml-2">
          Erreur de lecture audio
        </span>
      )}
    </div>
  );
}