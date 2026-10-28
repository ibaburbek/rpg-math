import React, { useState, useEffect } from 'react';
import {
  Home as HomeIcon,
  ShoppingBag,
  Coins,
  Sparkles,
  Lock,
  Check,
  Save,
  AlertCircle,
} from 'lucide-react';
import { studentService } from '@/src/lib/supabase/services/studentService';
import { RoomCanvas } from '@/src/components/RoomCanvas';
import { InventoryItem, StudentItem, Room, Student, StudentStats } from '@/src/types/database';
import { calculateLevelFromXp } from '@/src/features/rpg/levelEngine';
import { DEMO_STUDENT_ID } from '@/src/lib/supabase/services/demoData';

interface Props {
  studentId?: string;
  onBalanceChange?: (newStats: { total_xp: number; coins: number }) => void;
}

export const StudentHome: React.FC<Props> = ({
  studentId = DEMO_STUDENT_ID,
  onBalanceChange,
}) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [catalog, setCatalog] = useState<InventoryItem[]>([]);
  const [ownedItems, setOwnedItems] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'room' | 'shop'>('room');

  useEffect(() => {
    async function init() {
      try {
        const [stu, st, rm, cat, items] = await Promise.all([
          studentService.getStudentProfile(studentId),
          studentService.getStudentStats(studentId),
          studentService.getRoom(studentId),
          studentService.getCatalog(),
          studentService.getStudentItems(studentId),
        ]);
        setStudent(stu);
        setStats(st);
        setRoom(rm);
        setCatalog(cat);
        setOwnedItems(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [studentId]);

  const levelInfo = calculateLevelFromXp(stats?.total_xp || 0);

  const isItemOwned = (itemId: string) => {
    return ownedItems.some((i) => i.inventory_id === itemId);
  };

  const handleBuy = async (item: InventoryItem) => {
    if (!stats || stats.coins < item.price_coins) {
      alert('Монета жеткіліксіз!');
      return;
    }

    try {
      const bought = await studentService.buyItem(studentId, item);
      setOwnedItems((prev) => [...prev, bought]);
      const newStats = await studentService.getStudentStats(studentId);
      setStats(newStats);
      if (onBalanceChange) {
        onBalanceChange({ total_xp: newStats.total_xp, coins: newStats.coins });
      }
      setToastMsg(`«${item.name}» сатып алынды!`);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Сатып алу сәтсіз аяқталды');
    }
  };

  const handlePlaceInSlot = async (slotName: string, itemId: string | null) => {
    if (!room) return;
    const updatedData = {
      ...room.room_data,
      [slotName]: itemId,
    };

    setRoom({ ...room, room_data: updatedData });
    try {
      await studentService.saveRoom(studentId, updatedData);
      setToastMsg('Бөлме дизайны сақталды!');
      setTimeout(() => setToastMsg(null), 2500);
      setSelectedSlot(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  // Find owned items that can fit the selected slot
  const slotCandidates = ownedItems
    .map((oi) => catalog.find((cat) => cat.id === oi.inventory_id))
    .filter(Boolean) as InventoryItem[];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Виртуалды бөлме</h1>
          <p className="text-xs text-slate-500 mt-1">
            Тапқан монеталарыңызға бөлмеңізді жиһаздармен және өсімдіктермен безендіріңіз
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
            <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{stats?.coins || 0} монета</span>
          </div>

          <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('room')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'room' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
              }`}
            >
              Бөлме
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'shop' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
              }`}
            >
              Дүкен
            </button>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-bold animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Tab Views */}
      {activeTab === 'room' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
            <p className="text-xs text-slate-500 mb-3">
              💡 Бөлмедегі орындарды басып, жиһаз бен өсімдіктерді орналастырыңыз немесе алып тастаңыз:
            </p>

            <RoomCanvas
              roomData={room?.room_data || {}}
              characterId={student?.character_id || 'forest_explorer'}
              onSlotClick={(slot) => setSelectedSlot(slot)}
              isEditable={true}
            />
          </div>

          {/* Slot Placement Modal/Drawer */}
          {selectedSlot && (
            <div className="bg-white rounded-3xl border-2 border-teal-500/40 p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">
                  «{selectedSlot}» орнына зат таңдаңыз
                </h3>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕ Жабу
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handlePlaceInSlot(selectedSlot, null)}
                  className="px-3.5 py-2 rounded-xl border border-dashed border-stone-300 text-xs text-slate-500 hover:bg-stone-50 cursor-pointer"
                >
                  Бос қалдыру (Алып тастау)
                </button>

                {slotCandidates.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePlaceInSlot(selectedSlot, item.id)}
                    className="px-4 py-2 rounded-xl border border-stone-200 hover:border-teal-500 bg-white hover:bg-teal-50 text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-2"
                  >
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Shop Tab */
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              MathQuest Жиһаз және аксессуарлар дүкені
            </h2>
            <span className="text-xs text-slate-500">Сіздің деңгейіңіз: {levelInfo.level}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalog.map((item) => {
              const owned = isItemOwned(item.id);
              const isLocked = levelInfo.level < item.unlock_level;
              const canAfford = (stats?.coins || 0) >= item.price_coins;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    owned
                      ? 'bg-stone-50/80 border-stone-200'
                      : isLocked
                      ? 'bg-stone-50/50 border-stone-200 opacity-60'
                      : 'bg-white border-stone-200 hover:border-amber-300 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {item.category}
                      </span>
                      {isLocked && (
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> {item.unlock_level}-деңгейде
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mt-2">{item.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-1">{item.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-600 flex items-center gap-1">
                      <Coins className="w-4 h-4" /> {item.price_coins}
                    </span>

                    {owned ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                        ✓ Сатып алынған
                      </span>
                    ) : isLocked ? (
                      <span className="text-[11px] text-slate-400 font-semibold">Құлыптаулы</span>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-40"
                      >
                        {canAfford ? 'Сатып алу' : 'Монета жетпейді'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
