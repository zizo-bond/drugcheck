import React from 'react';

interface Props {
    isDarkMode: boolean;
}

const DisclaimerModal: React.FC<Props> = ({ isDarkMode }) => {
    return (
        <div className="max-w-7xl mx-auto px-4 mt-16 mb-8">
            <div className={`rounded-3xl border overflow-hidden ${isDarkMode
                    ? 'bg-slate-800/50 border-slate-700'
                    : 'bg-amber-50 border-amber-100'
                }`}>
                <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
                    <div className={`p-3 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-amber-100 text-amber-600'
                        }`}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <div className="flex-1">
                        <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            إخلاء مسؤولية طبي هام
                        </h3>
                        <div className={`prose max-w-none text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            <p className="mb-2">
                                هذا التطبيق مخصص <strong>للاستخدام التعليمي والمهني فقط</strong>. المعلومات الواردة هنا هي للمساعدة في اتخاذ القرار وليست بديلاً عن الحكم الطبي المهني.
                            </p>
                            <p className="opacity-75">
                                رغم حرصنا على دقة البيانات، إلا أن الطب علم متجدد. لا نتحمل أي مسؤولية عن أي قرارات طبية يتم اتخاذها بناءً على هذه المعلومات.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisclaimerModal;
