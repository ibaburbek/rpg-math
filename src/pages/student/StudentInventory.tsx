import React, { useState, useEffect } from 'react';
import { Package, Check, Sparkles, Shirt, Shield, Clock } from 'lucide-react';
import { studentService } from '@/src/lib/supabase/services/studentService';
import { InventoryItem, StudentItem } from '@/src/types/database';
import { DEMO_STUDENT_ID } from '@/src/lib/supabase/services/demoData';

interface Props {
  studentId?: string;
}

export const StudentInventory: React.FC<Props> = ({ studentId = DEMO_STUDENT_ID }) => {
  const [catalog, setCatalog] = useState<InventoryItem[]>([]);
  const [studentItems, setStudentItems] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cat, items] = await Promise.all([
          studentService.getCatalog(),
          studentService.getStudentItems(studentId),
        ]);
        setCatalog(cat);
        setStudentItems(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  const ownedCatalogItems = studentItems.map((si) => {
    const item = catalog.find((c) => c.id === si.inventory_id);
    return {
      ...si,
      details: item,
    };
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Менің инвентарым</h1>
        <p className="text-xs text-slate-500 mt-1">
          Есептер шығарып тапқан монеталарыңызға сатып алынған барлық бұйымдар
        </p>
      </div>

      {ownedCatalogItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-slate-400 text-xs">
          <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          Әзірге инвентарыңызда ешнәрсе жоқ. «Виртуалды бөлме» бөліміндегі дүкеннен жиһаз немесе аксессуарлар сатып алыңыз!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ownedCatalogItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    {item.details?.category || 'Зат'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(item.acquired_at).toLocaleDateString('kk-KZ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-800 mt-2">
                  {item.details?.name || 'Атаусыз зат'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.details?.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  ✓ Сақтаулы
                </span>
                <span className="text-[11px] text-slate-400">
                  {item.placement ? `Орны: ${item.placement}` : 'Бөлмеге қойылмаған'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
