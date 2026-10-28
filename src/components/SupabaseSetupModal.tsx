import React, { useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, Copy, ExternalLink, X, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured } from '@/src/lib/supabase/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(
      `VITE_SUPABASE_URL="https://your-project.supabase.co"\nVITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOi..."`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/60 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isSupabaseConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Supabase дерекқорының күйі</h2>
              <p className="text-xs text-slate-500">
                {isSupabaseConfigured ? 'Нақты Supabase бұлтымен байланыс орнатылған' : 'Қазір демо режимі белсенді (интерактивті алдын ала қарау)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Alert */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isSupabaseConfigured
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            {isSupabaseConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-sm">
              <span className="font-semibold">
                {isSupabaseConfigured ? 'Supabase қосылған:' : 'Supabase кілттері табылмады:'}
              </span>{' '}
              {isSupabaseConfigured
                ? 'Барлық сыныптар, есептер, тапсырмалар мен бағалаулар бұлттық PostgreSQL дерекқорында тікелей сақталады.'
                : 'Қолданба қазір канондық деректер құрылымымен жабдықталған жергілікті демонстрациялық режимде жұмыс істеп тұр. Нақты дерекқорды қосу үшін төмендегі нұсқаулықты орындаңыз.'}
            </div>
          </div>

          {/* Quick Setup Guide */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Канондық Supabase интеграциясын орнату 3 қадамы:
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <p className="font-semibold text-slate-800 mb-1">1. SQL сұлбасын орындау</p>
                <p>
                  Жоба ішіндегі <code className="px-1.5 py-0.5 bg-stone-200 rounded font-mono">supabase/schema.sql</code> файлын ашып, Supabase басқару панеліндегі <strong>SQL Editor</strong> бөліміне қойып, Run батырмасын басыңыз.
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <p className="font-semibold text-slate-800 mb-1">2. Storage бакетін ашу</p>
                <p>
                  Supabase <strong>Storage</strong> бөліміне өтіп, <code className="px-1.5 py-0.5 bg-stone-200 rounded font-mono">problem-images</code> атауымен жаңа Public бакет ашыңыз (есептерге сурет жүктеу үшін).
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-slate-800">3. .env айнымалыларын енгізу</p>
                  <button
                    onClick={copyEnvSnippet}
                    className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Көшірілді!' : 'Көшіріп алу'}
                  </button>
                </div>
                <pre className="p-2.5 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto">
{`VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOi..."`}
                </pre>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Түсіндім
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
