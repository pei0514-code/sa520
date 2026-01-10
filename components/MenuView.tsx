import React, { useState } from 'react';

interface MenuViewProps {
  onBack: () => void;
}

const MenuView: React.FC<MenuViewProps> = ({ onBack }) => {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const images = [
    { src: "https://i.ibb.co/QFTKgJ1B/2023-03-25.webp", title: "菜單正面", color: "bg-italian-red" },
    { src: "https://i.ibb.co/hJ6cfgjM/2025-12-28.webp", title: "菜單背面", color: "bg-italian-green" }
  ];

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in relative">
      <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
        <button onClick={onBack} className="mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-lg font-bold">精選菜單</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {images.map((img, idx) => (
          <div key={idx} className="rounded-xl overflow-hidden shadow-lg border border-gray-100 group cursor-pointer" onClick={() => setSelectedImg(img.src)}>
            <div className="p-3 bg-white border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-italian-dark flex items-center gap-2">
                <span className={`w-2 h-6 ${img.color} rounded`}></span> {img.title}
              </h3>
              <span className="text-xs text-gray-400">點擊放大</span>
            </div>
            <div className="relative">
              <img src={img.src} alt={img.title} className="w-full h-auto transition duration-300 group-hover:opacity-90" />
            </div>
          </div>
        ))}
        <div className="text-center text-gray-400 text-sm mt-4 pb-8">-- 季節菜單以現場為主 --</div>
      </div>

      {/* 燈箱 Modal */}
      {selectedImg && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-center items-center p-2 animate-fade-in" onClick={() => setSelectedImg(null)}>
           <div className="absolute top-4 right-4 z-50 flex gap-4">
              <a href={selectedImg} target="_blank" download className="text-white bg-gray-700/50 p-2 rounded-full hover:bg-gray-600 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </a>
              <button onClick={() => setSelectedImg(null)} className="text-white bg-gray-700/50 p-2 rounded-full hover:bg-gray-600 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
           <img src={selectedImg} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
           <p className="text-white/70 text-sm mt-4">點擊背景關閉 / 右上角下載</p>
        </div>
      )}
    </div>
  );
};

export default MenuView;
