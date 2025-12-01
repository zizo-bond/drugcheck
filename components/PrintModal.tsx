import React, { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onPrint: (patientName: string, doctorName: string) => void;
    isDarkMode: boolean;
}

const PrintModal: React.FC<Props> = ({ isOpen, onClose, onPrint, isDarkMode }) => {
    const [patientName, setPatientName] = useState('');
    const [doctorName, setDoctorName] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 transform transition-all scale-100 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'
                }`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">إعداد التقرير الطبي</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            اسم المريض (اختياري)
                        </label>
                        <input
                            type="text"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            placeholder="مثال: أحمد محمد"
                            className={`w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode
                                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                                }`}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            اسم الطبيب / الصيدلي (اختياري)
                        </label>
                        <input
                            type="text"
                            value={doctorName}
                            onChange={(e) => setDoctorName(e.target.value)}
                            placeholder="مثال: د. سارة علي"
                            className={`w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode
                                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                                }`}
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={() => onPrint(patientName, doctorName)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        طباعة التقرير
                    </button>
                    <button
                        onClick={onClose}
                        className={`flex-1 font-bold py-3 px-4 rounded-xl transition-all ${isDarkMode
                                ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrintModal;
