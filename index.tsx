import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

declare const Swal: any;
declare global {
  interface Window {
    liff: any;
  }
}

const LIFF_ID = "2008861231-EA0Hpl68";
const RESTAURANT_NAME = "薩諾瓦義式廚房";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxHOJOzIGqCnW-ttjB0_OeJ6eIz3iqF3dnYSwGeK4L2vRi6dEuWZ-i_DoM5pHjz9u7PlA/exec";

// ================= 工具與 Icon =================

const validatePhone = (phone: string) => /^09\d{8}$/.test(phone);

const runGoogleScript = async (action: string, params: object = {}) => {
  const payload = { action, ...params };
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (error) {
    console.error('GAS Error:', error);
    if (action === 'getInitialData') {
      return {
        status: 'success',
        member: null,
        faqs: [{ q: '營業時間？', a: '週二至週日 11:00-14:00, 17:00-20:30。' }],
        promotions: [{ id: 1, title: '系統維護中', desc: '目前無法取得最新優惠', image: 'https://picsum.photos/400/200', validUntil: 'N/A' }]
      };
    }
    return { status: 'error', message: '連線失敗' };
  }
};

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
    refresh: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
    alert: <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
    cake: <path d="M21 16v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2c0-.55.45-1 1-1h16c.55 0 1 .45 1 1zm-1-5a2 2 0 11-4 0 2 2 0 014 0zm-8 0a2 2 0 11-4 0 2 2 0 014 0zm8-6a2 2 0 01-2 2h-1.5a2 2 0 01-2-2V4a1 1 0 011-1h2.5a1 1 0 011 1v1zm-8 0a2 2 0 01-2 2H7.5a2 2 0 01-2-2V4a1 1 0 011-1h2.5a1 1 0 011 1v1z" />,
    plus: <path d="M12 4v16m8-8H4" />,
    minus: <path d="M20 12H4" />,
    barcode: <path d="M3 5h2v14H3V5zm4 0h1v14H7V5zm3 0h2v14h-2V5zm4 0h1v14h-1V5zm3 0h2v14h-2V5zm4 0h2v14h-2V5z" />
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name] || icons.x}
    </svg>
  );
};

// ================= 各項視圖組件 =================

const MenuView = ({ onBack }: { onBack: () => void }) => {
  const images = [
    { src: "https://i.ibb.co/QFTKgJ1B/2023-03-25.webp", title: "菜單正面" },
    { src: "https://i.ibb.co/hJ6cfgjM/2025-12-28.webp", title: "菜單背面" }
  ];
  return (
    <div className="flex flex-col h-full bg-white animate-fade-in">
      <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
        <button onClick={onBack} className="mr-3"><Icon name="chevronLeft" className="w-6 h-6" /></button>
        <h2 className="text-lg font-bold">精選菜單</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {images.map((img, i) => (
          <div key={i} className="rounded-xl overflow-hidden shadow-lg border border-gray-100">
            <div className="p-3 bg-white font-bold text-italian-dark">{img.title}</div>
            <img src={img.src} alt={img.title} className="w-full h-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

const LocationView = ({ onBack }: { onBack: () => void }) => (
  <div className="flex flex-col h-full bg-white animate-fade-in">
    <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
      <button onClick={onBack} className="mr-3"><Icon name="chevronLeft" className="w-6 h-6" /></button>
      <h2 className="text-lg font-bold">門市資訊</h2>
    </div>
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="bg-gray-100 h-48 rounded-2xl flex items-center justify-center text-gray-400">地圖載入中...</div>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-italian-green shrink-0"><Icon name="map" className="w-6 h-6" /></div>
        <div>
          <h3 className="font-bold text-gray-800">餐廳地址</h3>
          <p className="text-gray-600">金門縣金湖鎮太湖路二段3巷6號</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-italian-green shrink-0"><Icon name="calendar" className="w-6 h-6" /></div>
        <div>
          <h3 className="font-bold text-gray-800">營業時間</h3>
          <p className="text-gray-600 font-bold">每週二至週日 (週一公休)</p>
          <p className="text-gray-600 text-sm">11:00-14:00 / 17:00-20:30</p>
        </div>
      </div>
      <a href="tel:082332530" className="flex items-center justify-center gap-2 w-full bg-italian-dark text-white py-4 rounded-xl font-bold shadow-lg"><Icon name="phone" className="w-5 h-5" /> 撥打電話 082-332530</a>
    </div>
  </div>
);

const NewsView = ({ onBack, promotions }: { onBack: () => void, promotions: any[] }) => (
  <div className="flex flex-col h-full bg-white animate-fade-in">
    <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
      <button onClick={onBack} className="mr-3"><Icon name="chevronLeft" className="w-6 h-6" /></button>
      <h2 className="text-lg font-bold">最新優惠</h2>
    </div>
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {promotions && promotions.length > 0 ? promotions.map((promo, i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <img src={promo.image} className="w-full h-40 object-cover" />
          <div className="p-4">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-lg text-italian-dark">{promo.title}</h3>
              <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{promo.validUntil}</span>
            </div>
            <p className="text-gray-600 text-sm">{promo.desc}</p>
          </div>
        </div>
      )) : <div className="text-center py-20 text-gray-400">目前暫無活動</div>}
    </div>
  </div>
);

const MemberView = ({ onBack, member, onRegister, userProfile }: { onBack: () => void, member: any, onRegister: (member: any) => void, userProfile: any }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: userProfile?.displayName || '', phone: '', birthday: '', gender: 'male' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(formData.phone)) {
      return Swal.fire({ text: '手機號碼格式錯誤', icon: 'error' });
    }
    setLoading(true);
    const res = await runGoogleScript('register', { ...formData, lineUserId: userProfile?.userId });
    setLoading(false);
    if (res.status === 'success') {
      onRegister(res.member);
    } else {
      Swal.fire({ text: res.message, icon: 'error' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-italian-white animate-fade-in">
      <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
        <button onClick={onBack} className="mr-3"><Icon name="chevronLeft" className="w-6 h-6" /></button>
        <h2 className="text-lg font-bold">會員中心</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {member ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-italian-green to-black p-6 rounded-2xl text-white shadow-xl aspect-[1.58/1] flex flex-col justify-between">
              <div><div className="text-xs opacity-60">CARD MEMBER</div><div className="font-bold text-xl">{RESTAURANT_NAME}</div></div>
              <div><div className="text-lg font-medium tracking-widest">{member.phone}</div><div className="text-sm opacity-80">{member.name}</div></div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <div className="text-gray-500 text-sm mb-1">可用點數</div>
               <div className="text-4xl font-bold text-italian-dark">{member.points} <span className="text-sm font-normal text-gray-400">pts</span></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
            <h3 className="font-bold text-xl text-center text-italian-green mb-4">加入會員享好禮</h3>
            <input type="text" placeholder="姓名" required className="w-full p-3 border rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="tel" placeholder="手機號碼 (09xxxxxxxx)" required className="w-full p-3 border rounded-xl" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <input type="date" className="w-full p-3 border rounded-xl" value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})} />
            <button type="submit" disabled={loading} className="w-full bg-italian-green text-white py-4 rounded-xl font-bold">{loading ? '註冊中...' : '立即註冊'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

const FaqView = ({ onBack, faqs }: { onBack: () => void, faqs: any[] }) => (
  <div className="flex flex-col h-full bg-white animate-fade-in">
    <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
      <button onClick={onBack} className="mr-3"><Icon name="chevronLeft" className="w-6 h-6" /></button>
      <h2 className="text-lg font-bold">客服中心</h2>
    </div>
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {faqs && faqs.length > 0 ? faqs.map((f, i) => (
        <details key={i} className="group bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
          <summary className="p-4 font-bold flex justify-between items-center cursor-pointer">{f.q}<Icon name="chevronLeft" className="w-4 h-4 rotate-[-90deg] transition group-open:rotate-90" /></summary>
          <div className="p-4 pt-0 text-sm text-gray-600 border-t border-gray-100 bg-white">{f.a}</div>
        </details>
      )) : <div className="text-center py-20 text-gray-400">暫無常見問題</div>}
    </div>
  </div>
);

const BookingForm = ({ onBack, member, userProfile }: { onBack: () => void, member: any, userProfile: any }) => {
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], time: '12:00', adults: 2, children: 0, name: member?.name || '', phone: member?.phone || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await runGoogleScript('booking', { ...formData, lineUserId: userProfile?.userId });
    setLoading(false);
    if (res.status === 'success') {
      await Swal.fire({ text: '訂位成功！', icon: 'success' });
      onBack();
    } else {
      Swal.fire({ text: res.message, icon: 'error' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in">
      <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
        <button onClick={onBack} className="mr-3"><Icon name="chevronLeft" className="w-6 h-6" /></button>
        <h2 className="text-lg font-bold">立即訂位</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
        <div><label className="text-sm font-bold text-gray-700">預約日期</label><input type="date" required className="w-full p-3 border rounded-xl" value={formData.date} onChange={e=>setFormData({...formData, date:e.target.value})} /></div>
        <div><label className="text-sm font-bold text-gray-700">預約時間</label><input type="time" required className="w-full p-3 border rounded-xl" value={formData.time} onChange={e=>setFormData({...formData, time:e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-bold text-gray-700">大人</label><input type="number" min="1" className="w-full p-3 border rounded-xl" value={formData.adults} onChange={e=>setFormData({...formData, adults: parseInt(e.target.value)})} /></div>
          <div><label className="text-sm font-bold text-gray-700">小孩</label><input type="number" min="0" className="w-full p-3 border rounded-xl" value={formData.children} onChange={e=>setFormData({...formData, children: parseInt(e.target.value)})} /></div>
        </div>
        <div><label className="text-sm font-bold text-gray-700">大名</label><input type="text" required className="w-full p-3 border rounded-xl" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} /></div>
        <div><label className="text-sm font-bold text-gray-700">電話</label><input type="tel" required className="w-full p-3 border rounded-xl" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} /></div>
        <button type="submit" disabled={loading} className="w-full bg-italian-red text-white py-4 rounded-xl font-bold shadow-lg">{loading ? '處理中...' : '送出訂位'}</button>
      </form>
    </div>
  );
};

// ================= 主 App =================

const App = () => {
  const [view, setView] = useState('HOME');
  const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error'>('loading');
  const [profile, setProfile] = useState<any>(null);
  const [data, setData] = useState<any>({ member: null, faqs: [], promotions: [] });

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted && loadingState === 'loading') setLoadingState('error');
    }, 5000);

    const initialize = async () => {
      try {
        let liffProfile = null;
        if (window.liff) {
          await window.liff.init({ liffId: LIFF_ID });
          if (window.liff.isLoggedIn()) liffProfile = await window.liff.getProfile();
        }
        if (!isMounted) return;
        setProfile(liffProfile);
        const res = await runGoogleScript('getInitialData', { lineUserId: liffProfile?.userId || '' });
        if (!isMounted) return;
        if (res.status === 'success') {
          setData(res);
          setLoadingState('success');
          clearTimeout(timer);
        } else {
          setLoadingState('error');
        }
      } catch (err) {
        if (isMounted) setLoadingState('error');
      }
    };
    initialize();
    return () => { isMounted = false; clearTimeout(timer); };
  }, []);

  if (loadingState === 'loading') {
    return (
      <div className="fixed inset-0 bg-italian-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="loading-spinner mb-6"></div>
        <h2 className="text-italian-green font-bold text-lg tracking-widest">{RESTAURANT_NAME}</h2>
        <p className="text-gray-400 text-sm mt-2">正在為您準備美味資訊...</p>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6"><Icon name="alert" className="w-10 h-10" /></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">哎呀！連線超時</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">網路不穩或系統忙碌，請點擊下方重試。</p>
        <button onClick={() => window.location.reload()} className="w-full max-w-xs bg-italian-green text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3"><Icon name="refresh" className="w-5 h-5" /> 重新整理</button>
      </div>
    );
  }

  const renderView = () => {
    switch(view) {
      case 'MENU': return <MenuView onBack={() => setView('HOME')} />;
      case 'LOCATION': return <LocationView onBack={() => setView('HOME')} />;
      case 'NEWS': return <NewsView onBack={() => setView('HOME')} promotions={data.promotions} />;
      case 'MEMBER': return <MemberView onBack={() => setView('HOME')} member={data.member} onRegister={(m) => {setData({...data, member:m}); setView('HOME');}} userProfile={profile} />;
      case 'FAQ': return <FaqView onBack={() => setView('HOME')} faqs={data.faqs} />;
      case 'BOOKING': return <BookingForm onBack={() => setView('HOME')} member={data.member} userProfile={profile} />;
      default: return (
        <div className="h-full flex flex-col bg-gray-50 animate-fade-in">
          <div className="fixed top-0 w-full max-w-md bg-white/90 backdrop-blur-sm shadow-sm z-40 h-14 flex items-center justify-between px-4">
            <div className="font-bold text-xl text-italian-green">{RESTAURANT_NAME}</div>
            <div className="text-xs text-gray-500">{profile?.displayName ? `Hi, ${profile.displayName}` : 'Guest'}</div>
          </div>
          <div className="flex-1 overflow-y-auto mt-14 p-6 space-y-6">
            <div className="relative h-48 rounded-3xl overflow-hidden shadow-xl">
               <img src="https://i.ibb.co/qLFg7gSk/Gemini-Generated-Image-cmj4yzcmj4yzcmj4.png" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6"><div className="text-white"><h3 className="font-bold text-xl">歡迎光臨</h3><p className="text-sm opacity-80">金門道地義大利風味</p></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <button onClick={()=>setView('MENU')} className="h-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 shadow-sm"><Icon name="menu" className="w-6 h-6" /></div>
                  <span className="font-bold text-gray-700">精選菜單</span>
               </button>
               <button onClick={()=>setView('BOOKING')} className="h-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 shadow-sm"><Icon name="calendar" className="w-6 h-6" /></div>
                  <span className="font-bold text-gray-700">立即訂位</span>
               </button>
               <button onClick={()=>setView('LOCATION')} className="h-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shadow-sm"><Icon name="map" className="w-6 h-6" /></div>
                  <span className="font-bold text-gray-700">門市資訊</span>
               </button>
               <button onClick={()=>setView('MEMBER')} className="h-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-500 shadow-sm"><Icon name="user" className="w-6 h-6" /></div>
                  <span className="font-bold text-gray-700">會員中心</span>
               </button>
               <button onClick={()=>setView('NEWS')} className="h-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-sm"><Icon name="gift" className="w-6 h-6" /></div>
                  <span className="font-bold text-gray-700">最新優惠</span>
               </button>
               <button onClick={()=>setView('FAQ')} className="h-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 shadow-sm"><Icon name="chat" className="w-6 h-6" /></div>
                  <span className="font-bold text-gray-700">客服中心</span>
               </button>
            </div>
          </div>
          <div className="p-4 text-center text-[10px] text-gray-300">POWERED BY LINE LIFF & GOOGLE APPS SCRIPT</div>
        </div>
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-white max-w-md mx-auto shadow-2xl overflow-hidden h-screen flex flex-col">
      <div className="flex-1 overflow-hidden relative">{renderView()}</div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);