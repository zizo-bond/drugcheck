import React from 'react';
import { InteractionData, InteractionType } from '../types';
import Badge from './Badge';

interface Props {
  interaction: InteractionData;
  isDarkMode?: boolean;
}

const InteractionCard: React.FC<Props> = ({ interaction, isDarkMode = false }) => {
  // Helper function to split bilingual text
  const splitBilingual = (text: string) => {
    if (!text) return { ar: '', en: '' };
    const parts = text.split('||');
    return { ar: parts[0]?.trim() || text, en: parts[1]?.trim() || parts[0]?.trim() || text };
  };

  const mechanism = splitBilingual(interaction.mechanism);
  const effect = splitBilingual(interaction.effect);
  const management = splitBilingual(interaction.management);

  return (
    <div className={`group rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 relative ${isDarkMode
      ? 'bg-slate-800 border border-slate-700 shadow-slate-900/50 hover:shadow-blue-900/30'
      : 'bg-white border border-slate-100 shadow-slate-200/50 hover:shadow-blue-900/10'
      }`}>

      {/* Card Header */}
      <div className={`border-b p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isDarkMode
        ? 'bg-slate-700/50 border-slate-600'
        : 'bg-slate-50/80 border-slate-100'
        }`}>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Drug A */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl shadow-sm border flex items-center justify-center text-xl font-bold ${isDarkMode
              ? 'bg-slate-600 border-slate-500 text-blue-400'
              : 'bg-white border-slate-100 text-blue-600'
              }`}>
              {interaction.drugA.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{interaction.drugA}</h3>
              <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>الطرف الأول</span>
            </div>
          </div>

          {/* Connector */}
          <div className="hidden md:flex items-center justify-center w-8 h-8">
            <svg className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          {/* Drug B */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl shadow-sm border flex items-center justify-center text-xl font-bold ${interaction.type === InteractionType.DRUG_DRUG
                ? isDarkMode ? 'bg-slate-600 border-slate-500 text-blue-400' : 'bg-white border-slate-100 text-blue-600'
                : interaction.type === InteractionType.DRUG_FOOD
                  ? isDarkMode ? 'bg-emerald-900/50 border-emerald-700 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  : interaction.type === InteractionType.DRUG_DISEASE
                    ? isDarkMode ? 'bg-red-900/50 border-red-700 text-red-400' : 'bg-red-50 border-red-100 text-red-600'
                    : interaction.type === InteractionType.DRUG_VACCINE
                      ? isDarkMode ? 'bg-purple-900/50 border-purple-700 text-purple-400' : 'bg-purple-50 border-purple-100 text-purple-600'
                      : isDarkMode ? 'bg-orange-900/50 border-orange-700 text-orange-400' : 'bg-orange-50 border-slate-100 text-orange-600'
              }`}>
              {(interaction.drugB || interaction.foodOrCondition || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {interaction.type === InteractionType.DRUG_DRUG
                  ? interaction.drugB
                  : interaction.foodOrCondition}
              </h3>
              <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>الطرف الثاني</span>
            </div>
          </div>
        </div>

        {/* Badges & Actions */}
        <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
          <Badge severity={interaction.severity} />

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const text = `تفاعل دوائي:\n${interaction.drugA} + ${interaction.drugB || interaction.foodOrCondition}\nالخطورة: ${interaction.severity}\nالآلية: ${mechanism.ar}\nالتأثير: ${effect.ar}\nالإدارة: ${management.ar}`;
                navigator.clipboard.writeText(text);
                alert('تم نسخ التفاصيل للحافظة');
              }}
              className={`p-2 rounded-xl transition-all ${isDarkMode
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              title="نسخ التفاصيل"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="grid md:grid-cols-3 gap-6">

          {/* Mechanism Tile */}
          <div className={`rounded-2xl p-5 border transition-colors ${isDarkMode
            ? 'bg-blue-900/20 border-blue-800/50 hover:bg-blue-900/30'
            : 'bg-blue-50/50 border-blue-100/50 hover:bg-blue-50'
            }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode
                ? 'bg-blue-900/50 text-blue-400'
                : 'bg-blue-100 text-blue-600'
                }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h4 className={`font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>الآلية</h4>
            </div>
            <p className={`text-lg leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{mechanism.ar}</p>
            {mechanism.en && mechanism.en !== mechanism.ar && (
              <p className={`text-base mt-2 font-medium text-left ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} dir="ltr">{mechanism.en}</p>
            )}
          </div>

          {/* Effect Tile */}
          <div className={`rounded-2xl p-5 border transition-colors ${isDarkMode
            ? 'bg-purple-900/20 border-purple-800/50 hover:bg-purple-900/30'
            : 'bg-purple-50/50 border-purple-100/50 hover:bg-purple-50'
            }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode
                ? 'bg-purple-900/50 text-purple-400'
                : 'bg-purple-100 text-purple-600'
                }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className={`font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-900'}`}>التأثير</h4>
            </div>
            <p className={`text-lg leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{effect.ar}</p>
            {effect.en && effect.en !== effect.ar && (
              <p className={`text-base mt-2 font-medium text-left ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} dir="ltr">{effect.en}</p>
            )}
          </div>

          {/* Management Tile */}
          <div className={`rounded-2xl p-5 border transition-colors ${isDarkMode
            ? 'bg-emerald-900/20 border-emerald-800/50 hover:bg-emerald-900/30'
            : 'bg-emerald-50/50 border-emerald-100/50 hover:bg-emerald-50'
            }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode
                ? 'bg-emerald-900/50 text-emerald-400'
                : 'bg-emerald-100 text-emerald-600'
                }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className={`font-bold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-900'}`}>الإدارة</h4>
            </div>
            <p className={`text-lg leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{management.ar}</p>
            {management.en && management.en !== management.ar && (
              <p className={`text-base mt-2 font-medium text-left ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} dir="ltr">{management.en}</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default InteractionCard;