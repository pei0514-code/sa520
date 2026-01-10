import React from 'react';
import { Promotion } from '../types';

interface NewsViewProps {
  onBack: () => void;
  promotions: Promotion[];
}

const NewsView: React.FC<NewsViewProps> = ({ onBack, promotions }) => (
  <div className="flex flex-col h-full bg-white animate-fade-in">
    <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
      <button onClick={onBack} className="mr-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <h2 className="text-lg font-bold">最新優惠</h2>
    </div>
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
       {promotions && promotions.length > 0 ? promotions.map((promo, i) => (
         <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="h-40 bg-gray-200 relative">
               <img src={promo.image} alt={promo.title} className="w-full h-full object-cover" />
               <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow">{promo.validUntil}</div>
            </div>
            <div className="p-4">
               <h3 className="font-bold text-lg text-italian-dark">{promo.title}</h3>
               <p className="text-gray-600 mt-2 text-sm leading-relaxed">{promo.desc}</p>
            </div>
         </div>
       )) : (
         <div className="text-center text-gray-400 mt-10">目前沒有進行中的活動</div>
       )}
    </div>
  </div>
);

export default NewsView;
