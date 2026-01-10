import React from 'react';
import { FaqItem } from '../types';

interface FaqViewProps {
  onBack: () => void;
  faqs: FaqItem[];
  onOpenChat: () => void;
}

const FaqView: React.FC<FaqViewProps> = ({ onBack, faqs, onOpenChat }) => (
  <div className="flex flex-col h-full bg-white animate-fade-in">
     <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
      <button onClick={onBack} className="mr-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <h2 className="text-lg font-bold">客服中心</h2>
    </div>
    <div className="flex-1 overflow-y-auto p-4">
       <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg mb-8 flex items-center justify-between">
          <div>
             <h3 className="font-bold text-lg mb-1">有其他問題嗎？</h3>
             <p className="text-sm text-gray-300">AI 主廚 Luigi 線上為您服務</p>
          </div>
          <button onClick={onOpenChat} className="bg-white text-gray-900 px-4 py-3 rounded-xl font-bold text-sm shadow flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
             詢問主廚
          </button>
       </div>

       <h3 className="font-bold text-gray-700 mb-4 px-1 border-l-4 border-italian-green pl-2">常見問題</h3>
       <div className="space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
               <summary className="flex justify-between items-center p-4 font-medium text-gray-800 cursor-pointer bg-gray-50 group-open:bg-white transition-colors">
                  {f.q}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
               </summary>
               <div className="p-4 text-sm text-gray-600 border-t border-gray-100 bg-white leading-relaxed">
                  {f.a}
               </div>
            </details>
          ))}
       </div>
    </div>
  </div>
);

export default FaqView;
