import React from 'react';
import { getCharacterById } from '@/src/features/rpg/characters';
import { Compass, Wrench, Sparkles, MapPin, Cpu, Shield } from 'lucide-react';

interface Props {
  characterId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  level?: number;
  showDetails?: boolean;
}

export const CharacterAvatar: React.FC<Props> = ({
  characterId,
  size = 'md',
  level,
  showDetails = false,
}) => {
  const char = getCharacterById(characterId);

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-base',
    xl: 'w-32 h-32 text-lg',
  }[size];

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const renderIcon = () => {
    switch (char.iconName) {
      case 'Compass':
        return <Compass className={iconSizes} />;
      case 'Wrench':
        return <Wrench className={iconSizes} />;
      case 'Sparkles':
        return <Sparkles className={iconSizes} />;
      case 'MapPin':
        return <MapPin className={iconSizes} />;
      case 'Cpu':
        return <Cpu className={iconSizes} />;
      case 'Shield':
        return <Shield className={iconSizes} />;
      default:
        return <Sparkles className={iconSizes} />;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div
          className={`${sizeClasses} rounded-2xl flex items-center justify-center border-2 shadow-sm transition-transform group-hover:scale-105 ${char.avatarBg}`}
        >
          {renderIcon()}
        </div>

        {level !== undefined && (
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-slate-900 text-white rounded-full text-[10px] font-extrabold border border-amber-400 shadow-xs flex items-center gap-0.5">
            <span>lvl</span>
            <span>{level}</span>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="text-center mt-2">
          <p className="font-bold text-slate-800 text-sm">{char.nameKz}</p>
          <p className="text-[11px] text-emerald-700 font-medium">{char.titleKz}</p>
        </div>
      )}
    </div>
  );
};
