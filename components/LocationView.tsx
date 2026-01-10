import React from 'react';

interface LocationViewProps {
  onBack: () => void;
}

const LocationView: React.FC<LocationViewProps> = ({ onBack }) => (
  <div className="flex flex-col h-full bg-white animate-fade-in">
    <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
      <button onClick={onBack} className="mr-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <h2 className="text-lg font-bold">門市資訊</h2>
    </div>
    <div className="flex-1 overflow-y-auto">
      <div className="w-full h-64 bg-gray-200">
         <iframe 
           width="100%" height="100%" frameBorder="0" style={{border:0}}
           src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.3340333316135!2d118.4140003!3d24.4444565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x346b95b3a3a3a3a3%3A0x3a3a3a3a3a3a3a3a!2zODkxIOmHkeecgOa4v-mHkea5lueinuWkqueojuibi-S6jOaute3l-i5!5e0!3m2!1szh-TW!2stw!4v1600000000000!5m2!1szh-TW!2stw" 
           allowFullScreen>
         </iframe>
      </div>
      <div className="p-6 space-y-6">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
           <h3 className="font-bold text-italian-green mb-2">關於我們</h3>
           <p className="text-sm text-gray-600 leading-relaxed">
             薩諾瓦義式廚房成立於 2014年5月6日，致力於提供金門鄉親最道地的義式家庭料理。
           </p>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-italian-green shrink-0">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">餐廳地址</h3>
            <p className="text-gray-600">金門縣金湖鎮太湖路二段3巷6號</p>
            <a href="https://www.google.com/maps/search/?api=1&query=薩諾瓦義式廚房" target="_blank" className="text-italian-green text-sm underline mt-1 block">開啟 Google Maps 導航</a>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-italian-green shrink-0">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">營業時間</h3>
            <p className="text-gray-600 font-bold">每週二至週日 (週一公休)</p>
            <p className="text-gray-600">上午 11:00 - 14:00</p>
            <p className="text-gray-600">下午 17:00 - 20:30</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-italian-green shrink-0">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">官方粉絲團</h3>
            <a href="https://www.facebook.com/sa520/?locale=zh_TW" target="_blank" className="text-italian-green text-sm underline mt-1 block">Facebook 粉絲專頁</a>
          </div>
        </div>

        <a href="tel:082332530" className="flex items-center justify-center gap-2 w-full bg-italian-dark text-white py-4 rounded-xl font-bold shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          撥打電話 082-332530
        </a>
      </div>
    </div>
  </div>
);

export default LocationView;
