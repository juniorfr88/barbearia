import React from 'react';
import { Scissors, Crown, Sparkles, Flame, User, Shield, Zap, Gem } from 'lucide-react';
import { getRgba } from '../utils/theme';

interface ClientAvatarProps {
  iconId: string;
  themeColor: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
}

export const ClientAvatar: React.FC<ClientAvatarProps> = ({
  iconId,
  themeColor,
  size = 'md',
  className = '',
  showGlow = false,
}) => {
  const getIcon = () => {
    const iconProps = { className: 'w-full h-full stroke-[2.2]' };
    switch (iconId) {
      case 'mustache':
      case 'scissors':
        return <Scissors {...iconProps} />;
      case 'crown':
        return <Crown {...iconProps} />;
      case 'sparkles':
        return <Sparkles {...iconProps} />;
      case 'flame':
        return <Flame {...iconProps} />;
      case 'shield':
        return <Shield {...iconProps} />;
      case 'zap':
        return <Zap {...iconProps} />;
      case 'gem':
        return <Gem {...iconProps} />;
      case 'user':
      default:
        return <User {...iconProps} />;
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5 text-xs',
    md: 'w-10 h-10 p-2 text-sm',
    lg: 'w-14 h-14 p-3 text-base',
    xl: 'w-20 h-20 p-4 text-xl',
  };

  const glowStyle = showGlow
    ? {
        boxShadow: `0 0 20px ${getRgba(themeColor, 0.45)}, inset 0 0 10px ${getRgba(themeColor, 0.2)}`,
      }
    : {};

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl transition-all duration-300 ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: getRgba(themeColor, 0.15),
        borderColor: themeColor,
        borderWidth: '2px',
        color: themeColor,
        ...glowStyle,
      }}
    >
      {getIcon()}
    </div>
  );
};
