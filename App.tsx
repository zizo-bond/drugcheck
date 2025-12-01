import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { CLEAN_INTERACTIONS, DRUG_LIST } from './data/database';
import { InteractionData, InteractionType, InteractionSeverity } from './types';
import InteractionCard from './components/InteractionCard';
import DisclaimerModal from './components/DisclaimerModal';
import PrintModal from './components/PrintModal';

// استيراد خط Cairo من Google Fonts
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap');
`;
document.head.appendChild(style);

// خطاف مخصص لإدارة النقر خارج العنصر
function useClickOutside(ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Reusable Search Input Component
interface SearchInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  onSelect: (val: string) => void;
  suggestions: { id: string; name: string }[];
  icon: React.ReactNode;
  isDarkMode?: boolean;
  autoFocus?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  suggestions,
  icon,
  isDarkMode = false,
  autoFocus = false
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // إغلاق القائمة عند النقر خارج الـ wrapper
  useClickOutside(wrapperRef, () => {
    setIsOpen(false);
  });

  // إعادة تعيين الـ highlighted index عند تغيير الاقتراحات
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  // فتح القائمة تلقائياً إذا كانت هناك كتابة (أكثر من حرفين)
  useEffect(() => {
    if (value.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [value]);

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-green-600 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && value.length >= 2) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex].name);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const showDropdown = isOpen && value.length >= 2;

  return (
    <div className="mb-6 relative z-50" ref={wrapperRef}>
      <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        {label}
      </label>
      <div className="relative">
        {icon}
        <input
          ref={inputRef}
          type="text"
          className={`w-full px-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg ${isDarkMode
            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400'
            : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'
            }`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value.length >= 2) setIsOpen(true);
          }}
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div className={`absolute top-full mt-2 w-full border-2 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-[100] ${isDarkMode
          ? 'bg-slate-800 border-slate-600'
          : 'bg-white border-blue-200'
          }`}>
          <div className={`sticky top-0 px-4 py-2 border-b flex justify-between items-center text-xs z-[101] ${isDarkMode
            ? 'bg-slate-700 border-slate-600'
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
            }`}>
            <span className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
              {suggestions.length > 0 ? `${suggestions.length} نتيجة` : 'لا توجد نتائج'}
            </span>
            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>استخدم ↑↓ للتنقل</span>
          </div>

          {suggestions.length > 0 ? (
            suggestions.map((item, index) => (
              <div
                key={item.id}
                className={`px-4 py-3 cursor-pointer transition-all flex items-center gap-3 ${index === highlightedIndex
                  ? isDarkMode
                    ? 'bg-slate-700 border-r-4 border-blue-400'
                    : 'bg-blue-50 border-r-4 border-blue-500'
                  : isDarkMode
                    ? 'hover:bg-slate-700'
                    : 'hover:bg-slate-50'
                  }`}
                onClick={() => handleSelect(item.name)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {item.name.charAt(0).toUpperCase()}
                </div>
                <span className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  {highlightMatch(item.name, value)}
                </span>
              </div>
            ))
          ) : (
            <div className={`px-4 py-8 text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              لا يوجد دواء مطابق لهذا البحث.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function App() {
  // Search Modes: 'PAIR' (2 drugs) or 'PRESCRIPTION' (Multi-drug)
  const [searchMode, setSearchMode] = useState<'PAIR' | 'PRESCRIPTION'>('PAIR');

  // Pair Mode State
  const [term1, setTerm1] = useState('');
  const [term2, setTerm2] = useState('');

  // Prescription Mode State
  const [prescriptionTerm, setPrescriptionTerm] = useState('');
  const [prescriptionDrugs, setPrescriptionDrugs] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<InteractionType | 'ALL'>('ALL');
  const [activeSeverity, setActiveSeverity] = useState<InteractionSeverity | 'ALL'>('ALL');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true; // Default to dark mode
  });

  const [searchHistory, setSearchHistory] = useState<{ t1: string, t2: string, date: number }[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Print Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [reportData, setReportData] = useState({ patientName: '', doctorName: '' });

  const debouncedTerm1 = useDebounce(term1, 300);
  const debouncedTerm2 = useDebounce(term2, 300);
  const debouncedPrescriptionTerm = useDebounce(prescriptionTerm, 300);

  // Toggle dark mode and save to localStorage
  const toggleDarkMode = () => {
    setIsDarkMode((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newValue));
      return newValue;
    });
  };

  const addToHistory = useCallback((t1: string, t2: string) => {
    if (!t1 || !t2) return;

    setSearchHistory(prev => {
      // Avoid duplicates at the top of the list
      const isDuplicate = prev.length > 0 &&
        ((prev[0].t1 === t1 && prev[0].t2 === t2) || (prev[0].t1 === t2 && prev[0].t2 === t1));

      if (isDuplicate) return prev;

      const newItem = { t1, t2, date: Date.now() };
      const newHistory = [newItem, ...prev.filter(item =>
        !((item.t1 === t1 && item.t2 === t2) || (item.t1 === t2 && item.t2 === t1))
      )].slice(0, 5); // Keep only last 5

      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handlePrintRequest = () => {
    setIsPrintModalOpen(true);
  };

  const handlePrintConfirm = (patientName: string, doctorName: string) => {
    setReportData({ patientName, doctorName });
    setIsPrintModalOpen(false);
    // Wait for state update to reflect in DOM before printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Prescription Mode Handlers
  const addDrugToPrescription = (drugName: string) => {
    if (drugName && !prescriptionDrugs.includes(drugName)) {
      setPrescriptionDrugs(prev => [...prev, drugName]);
      setPrescriptionTerm(''); // Clear input
    }
  };

  const removeDrugFromPrescription = (drugToRemove: string) => {
    setPrescriptionDrugs(prev => prev.filter(d => d !== drugToRemove));
  };

  const getSuggestions = useCallback((query: string) => {
    if (!query || query.trim().length < 2) return [];

    const searchTerm = query.toLowerCase().trim();
    const exactMatches: typeof DRUG_LIST = [];
    const startsWithMatches: typeof DRUG_LIST = [];
    const containsMatches: typeof DRUG_LIST = [];
    let count = 0;
    const maxResults = 15;

    for (const drug of DRUG_LIST) {
      if (count >= maxResults) break;

      const drugName = drug.name.toLowerCase();

      if (drugName === searchTerm) {
        exactMatches.push(drug);
        count++;
      } else if (drugName.startsWith(searchTerm)) {
        startsWithMatches.push(drug);
        count++;
      } else if (drugName.includes(searchTerm)) {
        containsMatches.push(drug);
        count++;
      }
    }

    return [...exactMatches, ...startsWithMatches, ...containsMatches].slice(0, maxResults);
  }, []);

  const suggestions1 = useMemo(() => getSuggestions(term1), [term1, getSuggestions]);
  const suggestions2 = useMemo(() => getSuggestions(term2), [term2, getSuggestions]);
  const suggestionsPrescription = useMemo(() => getSuggestions(prescriptionTerm), [prescriptionTerm, getSuggestions]);

  const filteredInteractions = useMemo(() => {
    let results: InteractionData[] = [];

    if (searchMode === 'PAIR') {
      // Logic for Pair Check
      if (!debouncedTerm1 && !debouncedTerm2) return [];
      if (debouncedTerm1.length < 2 && debouncedTerm2.length < 2) return [];

      const t1 = debouncedTerm1.trim().toLowerCase();
      const t2 = debouncedTerm2.trim().toLowerCase();

      results = CLEAN_INTERACTIONS.filter((item) => {
        const drugA = item.drugA.toLowerCase();
        const drugB = (item.drugB || '').toLowerCase();
        const foodOrCond = (item.foodOrCondition || '').toLowerCase();

        const parties = [drugA, drugB, foodOrCond].filter(Boolean);

        if (t1 && !t2) {
          return parties.some(p => p.includes(t1));
        }

        if (!t1 && t2) {
          return parties.some(p => p.includes(t2));
        }

        const match1 = parties.some(p => p.includes(t1));
        const match2 = parties.some(p => p.includes(t2));

        return match1 && match2;
      });

    } else {
      // Logic for Prescription Check (Multi-drug)
      if (prescriptionDrugs.length < 2) return [];

      // Iterate through all unique pairs in the prescription list
      for (let i = 0; i < prescriptionDrugs.length; i++) {
        for (let j = i + 1; j < prescriptionDrugs.length; j++) {
          const d1 = prescriptionDrugs[i].toLowerCase();
          const d2 = prescriptionDrugs[j].toLowerCase();

          const pairInteractions = CLEAN_INTERACTIONS.filter(item => {
            const itemA = item.drugA.toLowerCase();
            const itemB = (item.drugB || item.foodOrCondition || '').toLowerCase();

            // Check for exact match or containment for robustness
            // We check if (itemA matches d1 AND itemB matches d2) OR (itemA matches d2 AND itemB matches d1)
            // Using 'includes' allows for some flexibility if names aren't exact, but exact match is safer for auto-check
            // For now, we'll stick to 'includes' to be consistent with the pair search, but stricter.

            const matchDirect = itemA.includes(d1) && itemB.includes(d2);
            const matchReverse = itemA.includes(d2) && itemB.includes(d1);

            return matchDirect || matchReverse;
          });

          results.push(...pairInteractions);
        }
      }

      // Remove duplicates if any (though logic above shouldn't produce many)
      results = Array.from(new Set(results.map(r => r.id)))
        .map(id => results.find(r => r.id === id)!);
    }

    // Filter by active tab
    if (activeTab !== 'ALL') {
      results = results.filter(item => item.type === activeTab);
    }

    // Filter by active severity
    if (activeSeverity !== 'ALL') {
      results = results.filter(item => item.severity === activeSeverity);
    }

    return results;
  }, [searchMode, debouncedTerm1, debouncedTerm2, prescriptionDrugs, activeTab, activeSeverity]);

  // Save to history when results are found (Only for Pair Mode for now)
  useEffect(() => {
    if (searchMode === 'PAIR' && debouncedTerm1 && debouncedTerm2 && filteredInteractions.length > 0) {
      if (debouncedTerm1.length >= 3 && debouncedTerm2.length >= 3) {
        addToHistory(debouncedTerm1, debouncedTerm2);
      }
    }
  }, [searchMode, debouncedTerm1, debouncedTerm2, filteredInteractions.length, addToHistory]);

  // Sync URL with search terms (Only for Pair Mode)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d1 = params.get('drug1');
    const d2 = params.get('drug2');
    if (d1) setTerm1(d1);
    if (d2) setTerm2(d2);
  }, []);

  useEffect(() => {
    if (searchMode === 'PAIR') {
      const params = new URLSearchParams();
      if (debouncedTerm1) params.set('drug1', debouncedTerm1);
      if (debouncedTerm2) params.set('drug2', debouncedTerm2);
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchMode, debouncedTerm1, debouncedTerm2]);

  const isSearching = (searchMode === 'PAIR' && ((term1 !== debouncedTerm1) || (term2 !== debouncedTerm2))) ||
    (searchMode === 'PRESCRIPTION' && (prescriptionTerm !== debouncedPrescriptionTerm));

  return (
    <div className={`min-h-screen flex flex-col font-['Cairo',sans-serif] transition-colors duration-300 ${isDarkMode
      ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
      : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
      }`}>
      {/* Header */}
      <header className={`shadow-sm border-b sticky top-0 z-30 transition-colors duration-300 ${isDarkMode
        ? 'bg-slate-800 border-slate-700'
        : 'bg-white border-slate-200'
        }`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">Rx</span>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>PharmaCheck Pro</h1>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Medical Interaction Checker</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-blue-50'
              }`}>
              <svg className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{CLEAN_INTERACTIONS.length.toLocaleString()} تفاعل مسجل</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all ${isDarkMode
                ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-grow">
        {/* Hero Section */}
        <div className={`relative text-white overflow-visible transition-colors duration-300 ${isDarkMode
          ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-black'
          : 'bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800'
          }`}>
          {/* Abstract Shapes Container */}
          <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
            <div className={`absolute top-10 right-10 w-72 h-72 rounded-full blur-3xl ${isDarkMode ? 'bg-blue-500' : 'bg-white'}`}></div>
            <div className={`absolute bottom-10 left-10 w-96 h-96 rounded-full blur-3xl ${isDarkMode ? 'bg-indigo-500' : 'bg-purple-300'}`}></div>
            <div className={`absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl ${isDarkMode ? 'bg-purple-500' : 'bg-blue-300'}`}></div>
          </div>

          {/* Header Content */}
          <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-24 text-center">
            {/* Hero Title */}
            <div className="mb-6">
              <h2 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
                فحص التداخلات الدوائية بدقة واحترافية
              </h2>
              <p className={`text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-blue-100'}`}>
                منصة متقدمة للصيادلة والأطباء للتحقق الفوري من سلامة الوصفات الطبية وكشف التداخلات بين الأدوية والأغذية والأمراض.
              </p>
            </div>
          </div>

          {/* Search Container - Floating */}
          <div className={`relative z-40 rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto border transition-colors duration-300 ${isDarkMode
            ? 'bg-slate-800 border-slate-700'
            : 'bg-white border-slate-100'
            }`} style={{ transform: 'translateY(-50px)' }}>

            {/* Mode Tabs */}
            <div className="flex justify-center mb-8">
              <div className={`p-1 rounded-xl flex gap-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <button
                  onClick={() => setSearchMode('PAIR')}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${searchMode === 'PAIR'
                    ? 'bg-white text-blue-600 shadow-md'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-white hover:bg-slate-600'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  فحص ثنائي (دواء ضد دواء)
                </button>
                <button
                  onClick={() => setSearchMode('PRESCRIPTION')}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${searchMode === 'PRESCRIPTION'
                    ? 'bg-white text-blue-600 shadow-md'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-white hover:bg-slate-600'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  فحص وصفة كاملة (عدة أدوية)
                </button>
              </div>
            </div>

            {searchMode === 'PAIR' ? (
              /* PAIR MODE UI */
              <div className="grid md:grid-cols-2 gap-6 relative">
                {/* Input 1 */}
                <SearchInput
                  label="الدواء أو الغذاء الأول"
                  placeholder="ابحث عن دواء..."
                  value={term1}
                  onChange={setTerm1}
                  onSelect={setTerm1}
                  suggestions={suggestions1}
                  isDarkMode={isDarkMode}
                  icon={
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />

                {/* Exchange Icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                </div>

                {/* Input 2 */}
                <SearchInput
                  label="الدواء أو الغذاء الثاني"
                  placeholder="ابحث عن دواء آخر..."
                  value={term2}
                  onChange={setTerm2}
                  onSelect={setTerm2}
                  suggestions={suggestions2}
                  isDarkMode={isDarkMode}
                  icon={
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
            ) : (
              /* PRESCRIPTION MODE UI */
              <div className="flex flex-col gap-6">
                <SearchInput
                  label="أضف أدوية الوصفة (واحداً تلو الآخر)"
                  placeholder="اكتب اسم الدواء ثم اضغط Enter للإضافة..."
                  value={prescriptionTerm}
                  onChange={setPrescriptionTerm}
                  onSelect={addDrugToPrescription}
                  suggestions={suggestionsPrescription}
                  isDarkMode={isDarkMode}
                  autoFocus={true}
                  icon={
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                />

                {/* Selected Drugs Chips */}
                <div className={`p-4 rounded-xl border min-h-[100px] flex flex-wrap gap-2 content-start ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
                  }`}>
                  {prescriptionDrugs.length === 0 && (
                    <div className={`w-full text-center py-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      لم تتم إضافة أي أدوية بعد. ابدأ بالكتابة أعلاه لإضافة الأدوية للقائمة.
                    </div>
                  )}
                  {prescriptionDrugs.map((drug, idx) => (
                    <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-sm animate-fadeIn ${isDarkMode ? 'bg-slate-600 text-white' : 'bg-white text-slate-800'
                      }`}>
                      <span className="font-semibold">{drug}</span>
                      <button
                        onClick={() => removeDrugFromPrescription(drug)}
                        className="text-red-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches History (Only in Pair Mode) */}
            {searchMode === 'PAIR' && searchHistory.length > 0 && (
              <div className="mt-6 pt-4 border-t border-dashed border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    آخر عمليات البحث
                  </span>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-red-500 hover:text-red-600 hover:underline"
                  >
                    مسح السجل
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTerm1(item.t1);
                        setTerm2(item.t2);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${isDarkMode
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                        }`}
                    >
                      <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{item.t1} + {item.t2}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Status Indicator */}
            {((searchMode === 'PAIR' && term1 && term2) || (searchMode === 'PRESCRIPTION' && prescriptionDrugs.length >= 2)) && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                {isSearching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-700 font-medium">جاري البحث...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-700">
                      {searchMode === 'PAIR' ? (
                        <>البحث عن التفاعل بين: <span className="font-bold text-blue-600">{debouncedTerm1}</span> و <span className="font-bold text-indigo-600">{debouncedTerm2}</span></>
                      ) : (
                        <>فحص التفاعلات لـ <span className="font-bold text-purple-600">{prescriptionDrugs.length}</span> أدوية في الوصفة</>
                      )}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-3xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              النتائج
            </h3>
            {filteredInteractions.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('تم نسخ رابط البحث! يمكنك مشاركته الآن.');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${isDarkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                    : 'bg-white border text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="hidden md:inline">مشاركة الرابط</span>
                </button>

                <button
                  onClick={handlePrintRequest}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${isDarkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                    : 'bg-white border text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span className="hidden md:inline">طباعة التقرير</span>
                </button>

                <span className={`px-4 py-2 rounded-full font-semibold text-sm ${isDarkMode
                  ? 'bg-blue-900 text-blue-300'
                  : 'bg-blue-100 text-blue-700'
                  }`}>
                  تم العثور على {filteredInteractions.length} نتيجة
                </span>
              </div>
            )}
          </div>

          {/* Print Header (Visible only in print) */}
          <div className="print-header hidden mb-8 border-b-2 border-black pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">PharmaCheck Pro</h1>
                <p className="text-gray-600 text-lg">Medical Interaction Report</p>
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-500 mb-1">Date: {new Date().toLocaleDateString('en-GB')}</div>
                <div className="text-sm text-gray-500">Time: {new Date().toLocaleTimeString('en-GB')}</div>
              </div>
            </div>

            {(reportData.patientName || reportData.doctorName) && (
              <div className="mt-6 grid grid-cols-2 gap-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {reportData.patientName && (
                  <div>
                    <span className="block text-xs text-gray-500 uppercase tracking-wider font-bold">Patient Name</span>
                    <span className="text-xl font-bold text-gray-900">{reportData.patientName}</span>
                  </div>
                )}
                {reportData.doctorName && (
                  <div>
                    <span className="block text-xs text-gray-500 uppercase tracking-wider font-bold">Doctor / Pharmacist</span>
                    <span className="text-xl font-bold text-gray-900">{reportData.doctorName}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filters Container */}
          {(debouncedTerm1 || debouncedTerm2 || (searchMode === 'PRESCRIPTION' && prescriptionDrugs.length >= 2)) && (
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Type Tabs */}
              <div className={`rounded-xl shadow-md p-2 flex gap-2 overflow-x-auto transition-colors duration-300 flex-1 ${isDarkMode ? 'bg-slate-800' : 'bg-white'
                }`}>
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'ALL'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : isDarkMode
                      ? 'text-slate-300 hover:bg-slate-700'
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  الكل
                </button>

                <button
                  onClick={() => setActiveTab(InteractionType.DRUG_DRUG)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === InteractionType.DRUG_DRUG
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : isDarkMode
                      ? 'text-slate-300 hover:bg-slate-700'
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  دواء - دواء
                </button>

                <button
                  onClick={() => setActiveTab(InteractionType.DRUG_FOOD)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === InteractionType.DRUG_FOOD
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : isDarkMode
                      ? 'text-slate-300 hover:bg-slate-700'
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  دواء - غذاء
                </button>

                <button
                  onClick={() => setActiveTab(InteractionType.DRUG_DISEASE)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === InteractionType.DRUG_DISEASE
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
                    : isDarkMode
                      ? 'text-slate-300 hover:bg-slate-700'
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  دواء - مرض
                </button>

                <button
                  onClick={() => setActiveTab(InteractionType.DRUG_VACCINE)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === InteractionType.DRUG_VACCINE
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg'
                    : isDarkMode
                      ? 'text-slate-300 hover:bg-slate-700'
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 10.5L12 3m0 0l1.5 1.5L6 12m6-9l1.5 1.5M13.5 4.5L21 12m0 0l-1.5 1.5L12 6m9 6l-1.5 1.5M16.5 10.5L9 18m-4.5-4.5l-3 3 3 3 3-3-3-3z" />
                  </svg>
                  دواء - لقاح
                </button>

                <button
                  onClick={() => setActiveTab(InteractionType.DRUG_PREGNANCY_LACTATION)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === InteractionType.DRUG_PREGNANCY_LACTATION
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg'
                    : isDarkMode
                      ? 'text-slate-300 hover:bg-slate-700'
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  حمل ورضاعة
                </button>
              </div>

              {/* Severity Filter */}
              <div className={`rounded-xl shadow-md p-2 flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800' : 'bg-white'
                }`}>
                <span className={`text-sm font-semibold px-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  الخطورة:
                </span>
                <select
                  value={activeSeverity}
                  onChange={(e) => setActiveSeverity(e.target.value as InteractionSeverity | 'ALL')}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold outline-none border transition-all ${isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-blue-500'
                    }`}
                >
                  <option value="ALL">جميع المستويات</option>
                  <option value={InteractionSeverity.CONTRAINDICATED}>🚫 ممنوع (Contraindicated)</option>
                  <option value={InteractionSeverity.HIGH}>🔴 خطير (High)</option>
                  <option value={InteractionSeverity.MODERATE}>🟠 متوسط (Moderate)</option>
                  <option value={InteractionSeverity.LOW}>🟡 بسيط (Low)</option>
                  <option value={InteractionSeverity.UNKNOWN}>⚪ غير معروف (Unknown)</option>
                </select>
              </div>
            </div>
          )}

          {filteredInteractions.length === 0 ? (
            <div className={`rounded-2xl shadow-lg p-12 text-center border transition-colors duration-300 ${isDarkMode
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-100'
              }`}>
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode
                ? 'bg-slate-700'
                : 'bg-gradient-to-br from-slate-100 to-slate-200'
                }`}>
                <svg className={`w-12 h-12 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>لا توجد نتائج</h4>
              <p className={`max-w-md mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {searchMode === 'PAIR'
                  ? (!term1 && !term2 ? 'ابدأ بكتابة اسم دواء أو غذاء في الخانات أعلاه' : 'لم يتم العثور على تفاعلات مسجلة بين هذه العناصر في قاعدة البيانات.')
                  : (prescriptionDrugs.length < 2 ? 'يجب إضافة دواءين على الأقل للفحص.' : 'لم يتم العثور على تفاعلات بين الأدوية المضافة.')
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInteractions.slice(0, 50).map((interaction) => (
                <InteractionCard key={interaction.id} interaction={interaction} isDarkMode={isDarkMode} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <footer className={`py-6 border-t mt-auto transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2 font-semibold">PharmaCheck Pro © {new Date().getFullYear()}</p>
          <p className="text-xs opacity-75">
            تنبيه: هذا التطبيق أداة مساعدة ولا يغني عن الاستشارة الطبية المتخصصة.
          </p>
        </div>
      </footer>

      {/* Print Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onPrint={handlePrintConfirm}
        isDarkMode={isDarkMode}
      />

      {/* Disclaimer Modal */}
      <DisclaimerModal isDarkMode={isDarkMode} />
    </div >
  );
}

export default App;