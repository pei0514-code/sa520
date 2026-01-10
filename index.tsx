
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

// 讓 TypeScript 知道這些是從 index.html 的 <script> 標籤載入的全域變數
declare const Swal: any;
declare global {
  interface Window {
    liff: any;
  }
}

const LIFF_ID = "2008861231-EA0Hpl68";
const RESTAURANT_NAME = "薩諾瓦義式廚房";

// 正式環境的 GAS URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxHOJOzIGqCnW-ttjB0_OeJ6eIz3iqF3dnYSwGeK4L2vRi6dEuWZ-i_DoM5pHjz9u7PlA/exec";

// ================= 通訊與工具函式 =================

const validatePhone = (phone: string) => /^09\d{8}$/.test(phone);

const showAlert = (title: string, text: string, icon: any = 'info') => {
  return Swal.fire({ title, text, icon, confirmButtonText: '確定', confirmButtonColor: '#2c5e50' });
};

const showConfirm = (title: string, text: string) => {
  return Swal.fire({ title, text, icon: 'question', showCancelButton: true, confirmButtonText: '確定', cancelButtonText: '取消', confirmButtonColor: '#2c5e50' });
};

// 呼叫 Google Apps Script
const runGoogleScript = async (action: string, params: object = {}) => {
  const payload = { action, ...params };
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('GAS Error:', error);
    if (action === 'getInitialData') {
       return {
          status: 'success', 
          member: null, 
          faqs: [{q:'營業時間？', a:'週二至週日 11:00-14:00, 17:00-20:30。'}],
          promotions: [{id:1, title:'新會員禮', desc:'註冊送100點', image:'https://picsum.photos/400/200'}]
       };
    }
    return { status: 'error', message: '連線失敗' };
  }
};

// Icon 元件
const Icon = ({ name, className }: { name: string; className: string }) => {
  const icons: { [key: string]: React.ReactElement } = {
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    calendar: <path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 0V2m-14 2V2" />,
    map: <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />,
    user: <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z" />,
    gift: <path d="M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />,
    chat: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />,
    x: <path d="M18 6L6 18M6 6l12 12" />,
    chevronLeft: <path d="M15 19l-7-7 7-7" />,
    phone: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.12 2h3a2 2 0 012 1.72 12.05 12.05 0 00.57 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.05 12.05 0 002.81.57A2 2 0 0122 16.92z" />,
    facebook: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />,
    barcode: <path d="M3 5h2v14H3V5zm4 0h1v14H7V5zm3 0h2v14h-2V5zm4 0h1v14h-1V5zm3 0h2v14h-2V5zm4 0h2v14h-2V5z" />,
    download: <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
    plus: <path d="M12 4v16m8-8H4" />,
    minus: <path d="M20 12H4" />,
    cake: <path d="M21 16v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2c0-.55.45-1 1-1h16c.55 0 1 .45 1 1zm-1-5a2 2 0 11-4 0 2 2 0 014 0zm-8 0a2 2 0 11-4 0 2 2 0 014 0zm8-6a2 2 0 01-2 2h-1.5a2 2 0 01-2-2V4a1 1 0 011-1h2.5a1 1 0 011 1v1zm-8 0a2 2 0 01-2 2H7.5a2 2 0 01-2-2V4a1 1 0 011-1h2.5a1 1 0 011 1v1z" />
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name] || icons.x}
    </svg>
  );
};

// ================= 元件區 =================

const MenuView = ({ onBack }: { onBack: () => void }) => {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const images = [
    { src: "https://i.ibb.co/QFTKgJ1B/2023-03-25.webp", title: "菜單正面", color: "bg-italian-red" },
    { src: "https://i.ibb.co/hJ6cfgjM/2025-12-28.webp", title: "菜單背面", color: "bg-italian-green" }
  ];

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in relative">
      <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
        <button onClick={onBack} className="mr-3"><Icon name="chevronLeft" className="w-6 h-6" /></button>
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
      {selectedImg && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-center items-center p-2 animate-fade-in" onClick={() => setSelectedImg(null)}>
           <div className="absolute top-4 right-4 z-50 flex gap-4">
              <a href={selectedImg} target="_blank" download className="text-white bg-gray-700/50 p-2 rounded-full hover:bg-gray-600 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                <Icon name="download" className="w-6 h-6" />
              </a>
              <button onClick={() => setSelectedImg(null)} className="text-white bg-gray-700/50 p-2 rounded-full hover:bg-gray-600 backdrop-blur-sm">
                <Icon name="x" className="w-6 h-6" />
              </button>
           </div>
           <img src={selectedImg} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
           <p className="text-white/70 text-sm mt-4">點擊背景關閉 / 右上角下載</p>
        </div>
      )}
    </div>
  );
};

const LocationView = ({ onBack }: { onBack: () => void }) => (
  <div className="flex flex-col h-full bg-white animate-fade-in">
    <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
      <button onClick={onBack} className="mr-3"><Icon name="chevronLeft" className="w-6 h-6" /></button>
      <h2 className="text-lg font-bold">門市資訊</h2>
    </div>
    <div className="flex-1 overflow-y-auto">
      <div className="w-full h-64 bg-gray-200">
         <iframe width="100%" height="100%" frameBorder="0" style={{border:0}} src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.3340333316135!2d118.4140003!3d24.4444565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x346b95b3a3a3a3a3%3A0x3a3a3a3a3a3a3a3a!2zODkxIOmHkeecgOa4v-mHkea5lueinuWkqueojuibi-S6jOaute3l-i5!5e0!3m2!1szh-TW!2stw!4v1600000000000!5m2!1szh-TW!2stw" allowFullScreen></iframe>
      </div>
      <div className="p-6 space-y-6">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100"><h3 className="font-bold text-italian-green mb-2">關於我們</h3><p className="text-sm text-gray-600 leading-relaxed">薩諾瓦義式廚房成立於 2014年5月6日，致力於提供金門鄉親最道地的義式家庭料理。</p></div>
        <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-italian-green shrink-0"><Icon name="map" className="w-6 h-6" /></div><div><h3 className="font-bold text-gray-800">餐廳地址</h3><p className="text-gray-600">金門縣金湖鎮太湖路二段3巷6號</p><a href="https://www.google.com/maps/search/?api=1&query=薩諾瓦義式廚房" target="_blank" className="text-italian-green text-sm underline mt-1 block">開啟 Google Maps 導航</a></div></div>
        <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-italian-green shrink-0"><Icon name="calendar" className="w-6 h-6" /></div><div><h3 className="font-bold text-gray-800">營業時間</h3><p className="text-gray-600 font-bold">每週二至週日 (週一公休)</p><p className="text-gray-600">上午 11:00 - 14:00</p><p className="text-gray-600">下午 17:00 - 20:30</p></div></div>
        <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-italian-green shrink-0"><Icon name="facebook" className="w-6 h-6" /></div><div><h3 className="font-bold text-gray-800">官方粉絲團</h3><a href="https://www.facebook.com/sa520/?locale=zh_TW" target="_blank" className="text-italian-green text-sm underline mt-1 block">Facebook 粉絲專頁</a></div></div>
        <a href="tel:082332530" className="flex items-center justify-center gap-2 w-full bg-italian-dark text-white py-4 rounded-xl font-bold shadow-lg"><Icon name="phone" className="w-5 h-5" />撥打電話 082-332530</a>
      </div>
    </div>
  </div>
);

const NewsView = ({ onBack, promotions }: { onBack: () => void, promotions: any[] }) => (
  <div className="flex flex-col h-full bg-white animate-fade-in">
    <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
      <button onClick={onBack} className="mr-3"><Icon name="chevronLeft" className="w-6 h-6" /></button>
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
       )) : <div className="text-center text-gray-400 mt-10">目前沒有進行中的活動</div>}
    </div>
  </div>
);

const MemberView = ({ onBack, member, onRegister, userProfile }: { onBack: () => void, member: any, onRegister: (member: any) => void, userProfile: any }) => {
  const [regData, setRegData] = useState({ 
    name: userProfile?.displayName || '', phone: '', birthday: '', gender: 'male', email: '', address: '',
    source: '', dietary: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(regData.phone)) {
       return showAlert('格式錯誤', '手機號碼必須是 09 開頭的 10 位數字', 'error');
    }
    setLoading(true);
    const res = await runGoogleScript('register', { ...regData, lineUserId: userProfile?.userId });
    setLoading(false);
    if(res.status === 'success') {
       onRegister(res.member);
    } else {
       showAlert('錯誤', res.message, 'error');
    }
  };
  
  const showPOSBarcode = () => {
     Swal.fire({
        title: '會員條碼', html: '<div class="flex justify-center p-4 bg-white"><svg class="w-48 h-20" viewBox="0 0 100 50"><rect x="0" y="0" width="100" height="50" fill="white"/><path d="M5 5h2v40H5zm4 0h1v40H9zm3 0h2v40h-2zm4 0h1v40h-1zm3 0h2v40h-2zm4 0h2v40h-2zm5 0h1v40h-1zm3 0h2v40h-2zm4 0h1v40h-1zm3 0h3v40h-3zm5 0h1v40h-1zm3 0h2v40h-2z" fill="#000"/></svg></div><p class="mt-2 text-sm text-gray-500">POS 整合測試中</p>', confirmButtonColor: '#2c5e50', confirmButtonText: '關閉'
     });
  };

  return (
    <div className="flex flex-col h-full bg-italian-white animate-fade-in">
      <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
        <button onClick={onBack} className="mr-3"><Icon name="chevronLeft" className="w-6 h-6" /></button>
        <h2 className="text-lg font-bold">會員中心</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {member ? (
          <div className="animate-slide-up space-y-6">
            <div className="bg-gradient-to-br from-italian-green to-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden aspect-[1.58/1]">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
               <div className="absolute left-0 bottom-0 w-full h-1/2 bg-gradient-to-t from-black/30 to-transparent"></div>
               <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                     <div><div className="text-xs text-green-200 tracking-widest mb-1">MEMBER CARD</div><div className="font-bold text-xl">{RESTAURANT_NAME}</div></div>
                     <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30"><Icon name="user" className="w-5 h-5" /></div>
                  </div>
                  <div><div className="text-sm opacity-90 mb-1">{member.phone}</div><div className="text-lg font-medium tracking-wide">{member.name}</div></div>
               </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-4"><div className="text-gray-500 text-sm">可用點數</div><button onClick={() => showAlert('點數兌換','請向櫃台人員出示畫面，點數可兌換餐點或折抵消費。','info')} className="text-xs text-italian-green underline">兌換說明</button></div>
               <div className="text-4xl font-bold text-italian-dark mb-6">{member.points} <span className="text-base font-normal text-gray-400">pts</span></div>
               <button onClick={showPOSBarcode} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"><Icon name="barcode" className="w-5 h-5" /> 會員條碼 (POS)</button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up">
             <h3 className="font-bold text-xl text-center mb-2 text-italian-green">歡迎加入會員</h3>
             <p className="text-center text-gray-500 text-sm mb-6">立即註冊送 <span className="text-italian-red font-bold">100</span> 點購物金！</p>
             <form onSubmit={handleRegSubmit} className="space-y-4">
                <input type="text" placeholder="姓名 (必填)" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} />
                <input type="tel" placeholder="手機 09xxxxxxxx (必填)" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} />
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600"><Icon name="cake" className="w-5 h-5" /></div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-yellow-800 mb-1">填寫生日，壽星獨享好禮</label>
                        <input type="date" className="w-full bg-white border border-yellow-300 rounded-lg p-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-yellow-400" value={regData.birthday} onChange={e => setRegData({...regData, birthday: e.target.value})} />
                    </div>
                </div>
                
                <div className="pt-2 text-sm font-bold text-gray-600">其他資訊</div>
                <div className="grid grid-cols-2 gap-3">
                   <select className="w-full p-3 bg-gray-50 border rounded-xl text-sm text-gray-500" value={regData.gender} onChange={e => setRegData({...regData, gender: e.target.value})}>
                      <option value="male">男</option><option value="female">女</option><option value="other">其他</option>
                   </select>
                   <select className="w-full p-3 bg-gray-50 border rounded-xl text-sm text-gray-500" value={regData.source} onChange={e => setRegData({...regData, source: e.target.value})}>
                      <option value="">得知管道 (選填)</option>
                      <option value="facebook">Facebook</option>
                      <option value="google">Google</option>
                      <option value="friend">親友推薦</option>
                      <option value="passby">路過</option>
                   </select>
                </div>
                
                <input type="text" placeholder="飲食偏好 (如：不吃牛、過敏...)" className="w-full p-3 bg-gray-50 border rounded-xl" value={regData.dietary} onChange={e => setRegData({...regData, dietary: e.target.value})} />
                <input type="email" placeholder="電子信箱 (選填)" className="w-full p-3 bg-gray-50 border rounded-xl" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
                <input type="text" placeholder="地址 (選填)" className="w-full p-3 bg-gray-50 border rounded-xl" value={regData.address} onChange={e => setRegData({...regData, address: e.target.value})} />

                <button type="submit" disabled={loading} className="w-full bg-italian-green text-white py-4 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-colors">
                   {loading ? '註冊中...' : '立即註冊'}
                </button>
             </form>
          </div>
        )}
      </div>
    </div>
  );
};

const FaqView = ({ onBack, faqs, onOpenChat }: { onBack: () => void, faqs: any[], onOpenChat: () => void }) => (
  <div className="flex flex-col h-full bg-white animate-fade-in">
     <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
      <button onClick={onBack} className="mr-3"><Icon name="chevronLeft" className="w-6 h-6" /></button>
      <h2 className="text-lg font-bold">客服中心</h2>
    </div>
    <div className="flex-1 overflow-y-auto p-4">
       <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg mb-8 flex items-center justify-between">
          <div><h3 className="font-bold text-lg mb-1">有其他問題嗎？</h3><p className="text-sm text-gray-300">AI 主廚 Luigi 線上為您服務</p></div>
          <button onClick={onOpenChat} className="bg-white text-gray-900 px-4 py-3 rounded-xl font-bold text-sm shadow flex items-center gap-2"><Icon name="chat" className="w-4 h-4" /> 詢問主廚</button>
       </div>
       <h3 className="font-bold text-gray-700 mb-4 px-1 border-l-4 border-italian-green pl-2">常見問題</h3>
       <div className="space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
               <summary className="flex justify-between items-center p-4 font-medium text-gray-800 cursor-pointer bg-gray-50 group-open:bg-white transition-colors">{f.q}<span className="transition group-open:rotate-180"><Icon name="chevronLeft" className="w-4 h-4 rotate-[-90deg]" /></span></summary>
               <div className="p-4 text-sm text-gray-600 border-t border-gray-100 bg-white leading-relaxed">{f.a}</div>
            </details>
          ))}
       </div>
    </div>
  </div>
);

const BookingForm = ({ onBack, member, userProfile }: { onBack: () => void, member: any, userProfile: any }) => {
   const [step, setStep] = useState(1);
   const [loading, setLoading] = useState(false);
   const today = new Date().toISOString().split('T')[0];
   
   const [formData, setFormData] = useState({ 
       date: today, time: '18:00', 
       adults: 2, children: 0, highChairs: 0,
       name: member?.name || userProfile?.displayName || '', phone: member?.phone || '', notes: '', lineUserId: userProfile?.userId || '' 
   });

   const Counter = ({ label, value, onChange, min = 0, max = 20 }: { label: string, value: number, onChange: (value: number) => void, min?: number, max?: number }) => (
     <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
        <span className="font-bold text-gray-700">{label}</span>
        <div className="flex items-center gap-4">
            <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 active:bg-gray-100"><Icon name="minus" className="w-4 h-4" /></button>
            <span className="w-6 text-center font-bold text-lg">{value}</span>
            <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="w-8 h-8 rounded-full bg-italian-green flex items-center justify-center text-white shadow active:opacity-90"><Icon name="plus" className="w-4 h-4" /></button>
        </div>
     </div>
   );

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!validatePhone(formData.phone)) return showAlert('格式錯誤','手機號碼需為09開頭10碼','error');
     
     setLoading(true);
     const res = await runGoogleScript('booking', formData);
     setLoading(false);
     
     if(res.status === 'success') {
        try {
            if (window.liff && window.liff.isInClient()) {
                const msgText = `【新訂位通知】\n日期：${formData.date} ${formData.time}\n姓名：${formData.name}\n人數：${formData.adults}大 ${formData.children}小\n兒童椅：${formData.highChairs}張\n電話：${formData.phone}\n備註：${formData.notes || '無'}`;
                await window.liff.sendMessages([{ type: 'text', text: msgText }]);
            }
        } catch (err) {
            console.error("LIFF send message failed", err);
        }

        await Swal.fire({title:'預約成功', text:'期待您的光臨！', icon:'success', confirmButtonColor: '#2c5e50'});
        onBack();
     } else {
        showAlert('失敗', res.message, 'error');
     }
   };

   const timeSlots = ['11:00', '11:30', '12:00', '12:30', '13:00', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];
   
   return (
     <div className="flex flex-col h-full bg-white animate-fade-in">
       <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
         <button onClick={onBack} className="mr-3"><Icon name="chevronLeft" className="w-6 h-6" /></button>
         <h2 className="text-lg font-bold">立即訂位</h2>
       </div>
       <div className="flex-1 overflow-y-auto p-6">
         <form onSubmit={handleSubmit} className="space-y-6">
           {step === 1 ? (
             <div className="space-y-5 animate-slide-up">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">日期</label><input type="date" min={today} className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 outline-none" value={formData.date} onChange={e=>setFormData({...formData, date:e.target.value})} required /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-2">時間</label><div className="grid grid-cols-3 gap-2">{timeSlots.map(t => (<button type="button" key={t} onClick={()=>setFormData({...formData, time:t})} className={`py-3 rounded-xl text-sm font-medium border ${formData.time===t ? 'bg-italian-green text-white border-italian-green' : 'bg-white text-gray-600 border-gray-200'}`}>{t}</button>))}</div></div>
                
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">人數與需求</label>
                    <Counter label="大人" value={formData.adults} onChange={v => setFormData({...formData, adults: v})} min={1} />
                    <Counter label="小孩" value={formData.children} onChange={v => setFormData({...formData, children: v})} />
                    
                    {formData.children > 0 && (
                        <div className="flex justify-between items-center bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <span className="font-bold text-orange-800 text-sm">需要兒童椅</span>
                            <div className="flex items-center gap-3">
                               <input type="checkbox" className="w-5 h-5 accent-orange-500" checked={formData.highChairs > 0} onChange={e => setFormData({...formData, highChairs: e.target.checked ? 1 : 0})} />
                               {formData.highChairs > 0 && (
                                   <select className="bg-white border border-orange-300 rounded-lg p-1 text-sm outline-none" value={formData.highChairs} onChange={e => setFormData({...formData, highChairs: parseInt(e.target.value)})}>
                                       {[...Array(formData.children).keys()].map(i => <option key={i+1} value={i+1}>{i+1} 張</option>)}
                                   </select>
                               )}
                            </div>
                        </div>
                    )}
                </div>

                <button type="button" onClick={()=>setStep(2)} className="w-full bg-italian-green text-white py-4 rounded-xl font-bold shadow-lg mt-4">下一步</button>
             </div>
           ) : (
             <div className="space-y-5 animate-slide-up">
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between"><span className="font-bold">日期</span><span>{formData.date} {formData.time}</span></div>
                    <div className="flex justify-between"><span className="font-bold">人數</span><span>{formData.adults}大 {formData.children}小</span></div>
                    {formData.highChairs > 0 && <div className="flex justify-between text-orange-600"><span className="font-bold">兒童椅</span><span>{formData.highChairs} 張</span></div>}
                </div>

                <input type="text" placeholder="訂位大名" required className="w-full p-4 border border-gray-200 rounded-xl outline-none" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} />
                <input type="tel" placeholder="聯絡電話" required className="w-full p-4 border border-gray-200 rounded-xl outline-none" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} />
                <textarea placeholder="其他備註 (例如：慶生、過敏...)" rows={3} className="w-full p-4 border border-gray-200 rounded-xl outline-none" value={formData.notes} onChange={e=>setFormData({...formData, notes:e.target.value})} />
                
                <div className="flex gap-3"><button type="button" onClick={()=>setStep(1)} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold">重選</button><button type="submit" disabled={loading} className="flex-[2] bg-italian-red text-white py-4 rounded-xl font-bold shadow-lg">{loading ? '處理中...' : '確認預約'}</button></div>
             </div>
           )}
         </form>
       </div>
     </div>
   );
};

const ChatOverlay = ({ onClose }: { onClose: () => void }) => {
  const [msgs, setMsgs] = useState([{role:'model', text:'Ciao! 我是主廚 Luigi。有什麼我可以幫您的嗎？'}]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  useEffect(() => {
      endRef.current?.scrollIntoView({behavior:'smooth'})
  }, [msgs]);

  const send = async () => {
    if(!input.trim()) return;
    const txt = input;
    setMsgs(prev => [...prev, {role:'user', text:txt}]);
    setInput('');
    setTyping(true);
    const res = await runGoogleScript('chat', { message: txt });
    setMsgs(prev => [...prev, {role:'model', text: res.reply || '系統忙線中'}]);
    setTyping(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-slide-up">
       <div className="bg-italian-green text-white p-4 flex justify-between items-center shadow">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-white p-0.5"><img src="https://ui-avatars.com/api/?name=Luigi&background=random" className="rounded-full w-full h-full" /></div><div><div className="font-bold">主廚 Luigi</div><div className="text-xs text-green-200">● 線上</div></div></div>
          <button onClick={onClose}><Icon name="x" className="w-6 h-6" /></button>
       </div>
       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {msgs.map((m,i) => (<div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}><div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${m.role==='user'?'bg-italian-green text-white rounded-tr-none':'bg-white text-gray-800 border rounded-tl-none'}`}>{m.text}</div></div>))}
          {typing && <div className="text-xs text-gray-400 pl-2">主廚正在思考...</div>}<div ref={endRef} />
       </div>
       {/* FIX: The shorthand `&&` expression in onKeyDown can cause type inference issues. Replaced with an explicit if-statement to ensure the handler's return type is void. */}
       <div className="p-3 bg-white border-t flex gap-2"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send() }} className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none" placeholder="輸入訊息..." /><button onClick={send} className="w-10 h-10 bg-italian-red text-white rounded-full flex items-center justify-center shadow"><Icon name="chevronLeft" className="w-5 h-5 rotate-180" /></button></div>
    </div>
  );
};

// ================= 主 App =================

const App = () => {
  const [view, setView] = useState('HOME');
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [data, setData] = useState({ member: null, faqs: [], promotions: [] });

  useEffect(() => {
    const init = async () => {
       setLoading(true);
       let p = null;
       if (window.liff) {
         try {
           await window.liff.init({ liffId: LIFF_ID });
           if (window.liff.isLoggedIn()) p = await window.liff.getProfile();
         } catch(e) { 
           console.error('LIFF Error', e); 
         }
       }
       setProfile(p);
       const initialData = await runGoogleScript('getInitialData', { lineUserId: p?.userId || '' });
       if(initialData.status === 'success') setData(initialData);
       setLoading(false);
    };
    init();
  }, []);

  const handleRegisterSuccess = (newMember: any) => {
     setData(prev => ({...prev, member: newMember}));
     setView('HOME');
     Swal.fire({ title: '註冊成功', text: '恭喜加入！已獲得 100 點購物金。', icon: 'success', confirmButtonColor: '#2c5e50' });
  };

  const checkMemberAndBook = async () => {
     if (data.member) {
        setView('BOOKING');
     } else {
        const result = await showConfirm('會員限定功能', '線上訂位僅開放給會員使用，是否立即免費註冊？');
        if (result.isConfirmed) setView('MEMBER');
     }
  };

  if (loading) return (<div className="fixed inset-0 bg-white flex flex-col items-center justify-center"><div className="w-10 h-10 border-4 border-gray-200 border-t-italian-green rounded-full animate-spin mb-4"></div><div className="text-gray-400 font-bold">載入餐廳資訊...</div></div>);

  const renderView = () => {
    switch(view) {
      case 'MENU': return <MenuView onBack={() => setView('HOME')} />;
      case 'LOCATION': return <LocationView onBack={() => setView('HOME')} />;
      case 'NEWS': return <NewsView onBack={() => setView('HOME')} promotions={data.promotions} />;
      case 'MEMBER': return <MemberView onBack={() => setView('HOME')} member={data.member} onRegister={handleRegisterSuccess} userProfile={profile} />;
      case 'FAQ': return <FaqView onBack={() => setView('HOME')} faqs={data.faqs} onOpenChat={() => setShowChat(true)} />;
      case 'BOOKING': return <BookingForm onBack={() => setView('HOME')} member={data.member} userProfile={profile} />;
      default: return (
        <div className="h-full flex flex-col bg-gray-50 animate-fade-in">
          <div className="fixed top-0 w-full max-w-md bg-white/90 backdrop-blur-sm shadow-sm z-40 h-14 flex items-center justify-between px-4">
            <div className="font-bold text-xl text-italian-green cursor-pointer" onClick={() => setView('HOME')}>{RESTAURANT_NAME}</div>
            <div className={`text-xs px-2 py-1 rounded ${data.member ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
               {profile?.displayName ? `Hi, ${profile.displayName} 歡迎光臨` : '歡迎光臨'}
            </div>
          </div>
          
          <div className="relative h-60 bg-gray-800 shrink-0 mt-14">
            <img src="https://i.ibb.co/qLFg7gSk/Gemini-Generated-Image-cmj4yzcmj4yzcmj4.png" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-6 text-white"><h1 className="text-3xl font-bold tracking-wide drop-shadow-lg">{RESTAURANT_NAME}</h1><p className="text-sm text-gray-200 mt-1 opacity-90">金門最道地的義式家庭料理</p></div>
          </div>

          <div className="flex-1 -mt-6 rounded-t-3xl bg-white p-6 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] relative z-10 flex flex-col">
             <div className="grid grid-cols-2 gap-4 flex-1 content-start">
                <button onClick={() => setView('MENU')} className="bg-orange-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-orange-100 transition shadow-sm border border-orange-100 h-32"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-sm"><Icon name="menu" className="w-6 h-6" /></div><span className="font-bold text-gray-700">線上菜單</span></button>
                <button onClick={checkMemberAndBook} className="bg-green-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-green-100 transition shadow-sm border border-green-100 h-32"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm"><Icon name="calendar" className="w-6 h-6" /></div><span className="font-bold text-gray-700">立即訂位</span></button>
                <button onClick={() => setView('LOCATION')} className="bg-blue-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-blue-100 transition shadow-sm border border-blue-100 h-32"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm"><Icon name="map" className="w-6 h-6" /></div><span className="font-bold text-gray-700">門市資訊</span></button>
                <button onClick={() => setView('MEMBER')} className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-purple-100 transition shadow-sm border border-purple-100 h-32 relative overflow-hidden"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-500 shadow-sm z-10"><Icon name="user" className="w-6 h-6" /></div><span className="font-bold text-gray-700 z-10">會員中心</span>{!data.member && <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse z-20"></div>}</button>
                <button onClick={() => setView('NEWS')} className="bg-red-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-red-100 transition shadow-sm border border-red-100 h-32"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm"><Icon name="gift" className="w-6 h-6" /></div><span className="font-bold text-gray-700">最新優惠</span></button>
                <button onClick={() => setView('FAQ')} className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition shadow-sm border border-gray-100 h-32"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm"><Icon name="chat" className="w-6 h-6" /></div><span className="font-bold text-gray-700">客服中心</span></button>
             </div>
             <div className="text-center mt-6 text-xs text-gray-400">© 2014-2024 {RESTAURANT_NAME} All Rights Reserved.</div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-white max-w-md mx-auto shadow-2xl overflow-hidden h-screen flex flex-col">
      <div className="flex-1 overflow-hidden relative">{renderView()}</div>
      {showChat && <ChatOverlay onClose={() => setShowChat(false)} />}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
