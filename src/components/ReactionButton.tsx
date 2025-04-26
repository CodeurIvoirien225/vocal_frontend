import React, { memo } from 'react';
import { Smile, Frown, ThumbsUp } from 'lucide-react';

interface ReactionButtonProps {
  type: 'laugh' | 'cry' | 'like';
  count: number;
  active: boolean;
  onClick: (type: 'laugh' | 'cry' | 'like') => void;
}

const ReactionButton = memo(({ type, count, active, onClick }: ReactionButtonProps) => {
  const icons = {
    laugh: <Smile className="h-5 w-5 flex-shrink-0" />,
    cry: <Frown className="h-5 w-5 flex-shrink-0" />,
    like: <ThumbsUp className="h-5 w-5 flex-shrink-0" />
  };

  const colors = {
    laugh: active ? 'text-yellow-500' : 'text-gray-600',
    cry: active ? 'text-blue-500' : 'text-gray-600',
    like: active ? 'text-green-500' : 'text-gray-600'
  };

  return (
    <button
      type="button"
      onClick={() => onClick(type)}
      className={`flex items-center gap-1 min-w-[3rem] px-2 py-1 rounded-full transition-colors duration-200 ${
        colors[type]
      } ${active ? 'bg-opacity-10' : 'hover:bg-gray-100'}`}
      style={{
        backgroundColor: active ? 
          (type === 'laugh' ? 'rgba(234, 179, 8, 0.1)' : 
           type === 'cry' ? 'rgba(59, 130, 246, 0.1)' : 
           'rgba(34, 197, 94, 0.1)') : 'transparent'
      }}
    >
      {icons[type]}
      <span className="text-sm min-w-[1rem] text-center">{count}</span>
    </button>
  );
});

ReactionButton.displayName = 'ReactionButton';

export default ReactionButton;