import React from 'react';
import { STARTER_INVENTORY } from '@/src/features/home/starterCatalog';
import { Clock, BookOpen, Sparkles, Flower2, Award } from 'lucide-react';
import { CharacterAvatar } from './CharacterAvatar';

interface Props {
  roomData: {
    wall?: string | null;
    floor?: string | null;
    desk?: string | null;
    plant?: string | null;
    bed?: string | null;
    [key: string]: any;
  };
  characterId: string;
  onSlotClick?: (slotName: string) => void;
  isEditable?: boolean;
}

export const RoomCanvas: React.FC<Props> = ({
  roomData,
  characterId,
  onSlotClick,
  isEditable = false,
}) => {
  const getItem = (id: string | null | undefined) => {
    if (!id) return null;
    return STARTER_INVENTORY.find((i) => i.id === id || i.asset_path === id) || null;
  };

  const wallItem = getItem(roomData.wall);
  const floorItem = getItem(roomData.floor);
  const deskItem = getItem(roomData.desk);
  const plantItem = getItem(roomData.plant);

  return (
    <div className="relative w-full aspect-16/10 max-h-[460px] bg-gradient-to-b from-stone-100 via-amber-50/40 to-stone-200 rounded-3xl border-4 border-stone-300 shadow-inner overflow-hidden select-none">
      {/* Wall Area (Top 60%) */}
      <div className="absolute inset-x-0 top-0 h-[60%] bg-[#faf6f0] border-b-4 border-amber-900/20 flex flex-col justify-between p-6">
        {/* Wall Molding & Shadow */}
        <div className="w-full h-2 bg-stone-300/40 rounded-full" />

        {/* Wall Decor Slot */}
        <div className="flex justify-around items-center px-8">
          {/* Wall Slot 1: Window / Chalkboard */}
          <button
            type="button"
            onClick={() => onSlotClick?.('wall')}
            disabled={!isEditable}
            className={`relative p-3 rounded-2xl border-2 transition-all ${
              wallItem
                ? 'bg-amber-50/90 border-amber-300 shadow-sm'
                : 'border-dashed border-stone-300 hover:border-emerald-400 bg-white/40'
            } ${isEditable ? 'cursor-pointer hover:scale-105' : ''}`}
            title="Қабырға әшекейі"
          >
            {wallItem ? (
              <div className="flex flex-col items-center">
                <Clock className="w-8 h-8 text-amber-700 mb-1" />
                <span className="text-[10px] font-bold text-slate-700 max-w-[80px] truncate">
                  {wallItem.name}
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-stone-400 font-medium px-2 py-1">
                + Қабырға (сағат / тақта)
              </div>
            )}
          </button>

          {/* Academic Certificate / Banner */}
          <div className="p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-800 flex items-center gap-1.5 shadow-xs">
            <Award className="w-5 h-5 text-amber-600" />
            <span className="text-[10px] font-extrabold tracking-wide uppercase">
              MathQuest Академиясы
            </span>
          </div>
        </div>

        {/* Baseboard */}
        <div className="w-full h-3 bg-amber-900/10 rounded-sm" />
      </div>

      {/* Floor Area (Bottom 40%) */}
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-stone-200/90 shadow-inner flex items-center justify-around px-8 pb-4">
        {/* Floor Pattern Overlay if carpet placed */}
        {floorItem && (
          <div className="absolute inset-0 bg-emerald-950/5 pointer-events-none flex items-center justify-center">
            <div className="w-3/4 h-3/4 rounded-full border-2 border-emerald-600/20 bg-emerald-500/5 shadow-xs flex items-center justify-center">
              <span className="text-[11px] font-semibold text-emerald-800/40">
                {floorItem.name}
              </span>
            </div>
          </div>
        )}

        {/* Left Slot: Plant / Bonsai */}
        <button
          type="button"
          onClick={() => onSlotClick?.('plant')}
          disabled={!isEditable}
          className={`relative z-10 p-3 rounded-2xl border-2 transition-all ${
            plantItem
              ? 'bg-emerald-50 border-emerald-300 shadow-md'
              : 'border-dashed border-stone-300 hover:border-emerald-400 bg-white/50'
          } ${isEditable ? 'cursor-pointer hover:scale-105' : ''}`}
          title="Өсімдік орны"
        >
          {plantItem ? (
            <div className="flex flex-col items-center">
              <Flower2 className="w-9 h-9 text-emerald-600" />
              <span className="text-[10px] font-bold text-slate-700 mt-1">{plantItem.name}</span>
            </div>
          ) : (
            <div className="text-[11px] text-stone-400 font-medium px-2 py-1">
              + Өсімдік (бонсай / кактус)
            </div>
          )}
        </button>

        {/* Center: The Student Character standing in the room */}
        <div className="relative z-20 flex flex-col items-center">
          <div className="animate-bounce" style={{ animationDuration: '3s' }}>
            <CharacterAvatar characterId={characterId} size="lg" />
          </div>
          <div className="w-20 h-3 bg-slate-900/15 rounded-full blur-[2px] mt-1" />
        </div>

        {/* Right Slot: Desk / Study Station */}
        <button
          type="button"
          onClick={() => onSlotClick?.('desk')}
          disabled={!isEditable}
          className={`relative z-10 p-3 rounded-2xl border-2 transition-all ${
            deskItem
              ? 'bg-amber-100 border-amber-300 shadow-md'
              : 'border-dashed border-stone-300 hover:border-emerald-400 bg-white/50'
          } ${isEditable ? 'cursor-pointer hover:scale-105' : ''}`}
          title="Оқу үстелі"
        >
          {deskItem ? (
            <div className="flex flex-col items-center">
              <BookOpen className="w-9 h-9 text-amber-800" />
              <span className="text-[10px] font-bold text-slate-700 mt-1">{deskItem.name}</span>
            </div>
          ) : (
            <div className="text-[11px] text-stone-400 font-medium px-2 py-1">
              + Оқу үстелі
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
