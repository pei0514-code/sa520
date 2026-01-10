import React, { useState, useEffect } from 'react';
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

// ================= 通訊工具 =================

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
        promotions: [{ id: 1, title: '連線較慢', desc: '目前無法取得最新活動，請參考現場公告。', image: 'https://picsum.photos/400/200', validUntil: 'N/A' }]
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
    chevronLeft: <path d="M15 19l-7-7 7-7" />,
    phone: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.12 2h3a2 2 0 012 1.72 12.05 12.05 0 00.57 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.05 12.05 0 002.81.57A2 2 0 0122 16.92z" />,
    refresh: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
    shopping: <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name] || <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
    </svg>
  );
};

// ================= 視圖組件 =================

const MenuView = ({ onBack }: { onBack: () => void }) => (
  <div className="flex flex-col h-full bg-white animate-fade-in">
    <div className="bg-italian-green text-white p-4 flex items-center shadow-md">
      <button onClick={onBack} className="mr-3 p-1"><Icon name="chevronLeft" className="w-6 h-6" /></button>
      <h2 className="text-lg font-bold">精選菜單</h2>
    </div>
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <img src="https://i.ibb.co/QFTKgJ1B/2023-03-25.webp" className="w-full rounded-xl shadow-lg border" />
      <img src="https://i.ibb.co/hJ6cfgjM/2025-12-28.webp" className="w-full rounded-xl shadow-lg border" />
      <div className="h-10"></div>
    </div>
  </div>
);

const LocationView = ({ onBack }: { onBack: () => void }) => (
  <div className="flex flex-col h-full bg-white animate-fade-in">
    <div className="bg-italian-green text-white p-4 flex items-center shadow-md">
      <button onClick={onBack} className="mr-3 p-1"><Icon name="chevronLeft" className="w-6 h-6" /></button>
      <h2 className="text-lg font-bold">門市資訊</h2>
    </div>
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="w-full h-48 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-bold">MAP PLACEHOLDER</div>
      <div className="space-y-4">
        <div className="flex gap-4"><Icon name="map" className="w-6 h-6 text-italian-green shrink-0" /><div><h4 className="font-bold">地址</h4><p className="text-gray-600">金門縣金湖鎮太湖路二段3巷6號</p></div></div>
        <div className="flex gap-4"><Icon name="calendar" className="w-6 h-6 text-italian-green shrink-0" /><div><h4 className="font-bold">營業時間</h4><p className="text-gray-600">週二至週日 11:00-14:00 / 17:00-20:30</p></div></div>
      </div>
      <a href="tel:082332530" className="w-full bg-italian-dark text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg"><Icon name="phone" className="w-5 h-5" /> 撥打電話</a>
    </div>
  </div>
);

const NewsView = ({ onBack, promotions }: { onBack: () => void, promotions: any[] }) => (
  <div className="flex flex-col h-full bg-white animate-fade-in">
    <div className="bg-italian-green text-white p-4 flex items-center shadow-md">
      <button onClick={onBack} className="mr-3 p-1"><Icon name="chevronLeft" className="w-6 h-6" /></button>
      <h2 className="text-lg font-bold">最新優惠</h2>
    </div>
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {promotions.map((p, i) => (
        <div key={i} className="bg-white rounded-xl shadow-md border overflow-hidden">
          <img src={p.image} className="w-full h-40 object-cover" />
          <div className="p-4"><h3 className="font-bold text-italian-dark">{p.title}</h3><p className="text-sm text-gray-500 mt-1">{p.desc}</p></div>
        </div>
      ))}
    </div>
  </div>
);

const MemberView = ({ onBack, member, onRegister, userProfile }: { onBack: () => void, member: any, onRegister: (m: any) => void, userProfile: any }) => {
  const [formData, setFormData] = useState({ name: userProfile?.displayName || '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!/^09\d{8}$/.test(formData.phone)) return Swal.fire({ text: '手機號碼格式錯誤', icon: 'error' });
    setSubmitting(true);
    const res = await runGoogleScript('register', { ...formData, lineUserId: userProfile?.userId });
    setSubmitting(false);
    if (res.status === 'success') {
      onRegister(res.member);
      Swal.fire({ text: '註冊成功！歡迎加入薩諾瓦', icon: 'success' });
    } else {
      Swal.fire({ text: res.message, icon: 'error' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-italian-white animate-fade-in">
      <div className="bg-italian-green text-white p-4 flex items-center shadow-md">
        <button onClick={onBack} className="mr-3 p-1"><Icon name="chevronLeft" className="w-6 h-6" /></button>
        <h2 className="text-lg font-bold">會員中心</h2>
      </div>
      <div className="flex-1 p-6">
        {member ? (
          <div className="bg-gradient-to-br from-italian-green to-black p-6 rounded-2xl text-white shadow-xl">
            <div className="text-xs opacity-60 mb-1 tracking-widest uppercase">VIP Card</div>
            <div className="text-xl font-bold mb-8">{RESTAURANT_NAME}</div>
            <div className="flex justify-between items-end">
              <div><p className="text-sm opacity-80">{member.name}</p><p className="tracking-widest">{member.phone}</p></div>
              <div className="text-right"><p className="text-[10px] opacity-60 uppercase">Points</p><p className="text-2xl font-bold">{member.points}</p></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
            <h3 className="font-bold text-italian-green text-center text-xl">新會員註冊</h3>
            <input type="text" placeholder="真實姓名" className="w-full p-3 border rounded-xl" required value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} />
            <input type="tel" placeholder="手機號碼 (09xxxxxxxx)" className="w-full p-3 border rounded-xl" required value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} />
            <button type="submit" disabled={submitting} className="w-full bg-italian-green text-white py-4 rounded-xl font-bold">{submitting ? '處理中...' : '確認註冊'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

const FaqView = ({ onBack, faqs }: { onBack: () => void, faqs: any[] }) => (
  <div className="flex flex-col h-full bg-white animate-fade-in">
    <div className="bg-italian-green text-white p-4 flex items-center shadow-md">
      <button onClick={onBack} className="mr-3 p-1"><Icon name="chevronLeft" className="w-6 h-6" /></button>
      <h2 className="text-lg font-bold">常見問題</h2>
    </div>
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {faqs.map((f, i) => (
        <details key={i} className="bg-gray-50 rounded-xl border p-4 group">
          <summary className="font-bold cursor-pointer list-none flex justify-between items-center">{f.q}<Icon name="chevronLeft" className="w-4 h-4 rotate-[-90deg] group-open:rotate-90 transition-transform" /></summary>
          <p className="text-sm text-gray-600 mt-2 pt-2 border-t">{f.a}</p>
        </details>
      ))}
    </div>
  </div>
);

const BookingView = ({ onBack, member, userProfile }: { onBack: () => void, member: any, userProfile: any }) => {
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], time: '12:00', adults: 2, children: 0, name: member?.name || userProfile?.displayName || '', phone: member?.phone || '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await runGoogleScript('booking', { ...formData, lineUserId: userProfile?.userId });
    setSubmitting(false);
    if (res.status === 'success') {
      await Swal.fire({ text: '預約已送出，我們將盡快為您安排', icon: 'success' });
      onBack();
    } else {
      Swal.fire({ text: res.message, icon: 'error' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in">
      <div className="bg-italian-green text-white p-4 flex items-center shadow-md">
        <button onClick={onBack} className="mr-3 p-1"><Icon name="chevronLeft" className="w-6 h-6" /></button>
        <h2 className="text-lg font-bold">線上訂位</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
        <div><label className="text-xs font-bold text-gray-400">日期</label><input type="date" required className="w-full p-3 border rounded-xl" value={formData.date} onChange={e=>setFormData({...formData, date:e.target.value})} /></div>
        <div><label className="text-xs font-bold text-gray-400">時間</label><input type="time" required className="w-full p-3 border rounded-xl" value={formData.time} onChange={e=>setFormData({...formData, time:e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs font-bold text-gray-400">大人</label><input type="number" min="1" className="w-full p-3 border rounded-xl" value={formData.adults} onChange={e=>setFormData({...formData, adults: parseInt(e.target.value)})} /></div>
          <div><label className="text-xs font-bold text-gray-400">小孩</label><input type="number" min="0" className="w-full p-3 border rounded-xl" value={formData.children} onChange={e=>setFormData({...formData, children: parseInt(e.target.value)})} /></div>
        </div>
        <div><label className="text-xs font-bold text-gray-400">姓名</label><input type="text" required className="w-full p-3 border rounded-xl" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} /></div>
        <div><label className="text-xs font-bold text-gray-400">電話</label><input type="tel" required className="w-full p-3 border rounded-xl" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} /></div>
        <button type="submit" disabled={submitting} className="w-full bg-italian-red text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all mt-4">{submitting ? '訂位處理中...' : '確認送出訂位'}</button>
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
    
    // 初始化主邏輯
    const initApp = async () => {
      // 設置逾時鎖 (3秒)
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 3000));
      
      try {
        // LIFF 初始化
        if (window.liff) {
          try {
            await Promise.race([
              window.liff.init({ liffId: LIFF_ID }),
              timeoutPromise
            ]);
            if (window.liff.isLoggedIn()) {
              const p = await window.liff.getProfile();
              if (isMounted) setProfile(p);
            }
          } catch (e) {
            console.warn('LIFF initialization issues, continuing as guest');
          }
        }

        // 取得 Google 試算表資料
        const res = await runGoogleScript('getInitialData', { lineUserId: profile?.userId || '' });
        if (isMounted) {
          setData(res);
          setLoadingState('success');
        }
      } catch (err) {
        console.error('App init crash:', err);
        if (isMounted) setLoadingState('error');
      }
    };

    initApp();
    return () => { isMounted = false; };
  }, []);

  if (loadingState === 'loading') {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="loading-spinner mb-6"></div>
        <h2 className="text-italian-green font-bold text-xl tracking-widest">{RESTAURANT_NAME}</h2>
        <p className="text-gray-400 text-sm mt-3 animate-pulse">正在加熱美味資訊中...</p>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6"><Icon name="alert" className="w-10 h-10" /></div>
        <h2 className="text-xl font-bold text-gray-800">載入似乎卡住了</h2>
        <p className="text-gray-400 text-sm mt-2 mb-8">可能是網路連線不太穩定</p>
        <button onClick={() => window.location.reload()} className="w-full max-w-xs bg-italian-green text-white py-4 rounded-xl font-bold shadow-lg">重新嘗試載入</button>
      </div>
    );
  }

  const renderView = () => {
    switch(view) {
      case 'MENU': return <MenuView onBack={() => setView('HOME')} />;
      case 'LOCATION': return <LocationView onBack={() => setView('HOME')} />;
      case 'NEWS': return <NewsView onBack={() => setView('HOME')} promotions={data.promotions} />;
      case 'MEMBER': return <MemberView onBack={() => setView('HOME')} member={data.member} onRegister={(m) => setData({...data, member:m})} userProfile={profile} />;
      case 'FAQ': return <FaqView onBack={() => setView('HOME')} faqs={data.faqs} />;
      case 'BOOKING': return <BookingView onBack={() => setView('HOME')} member={data.member} userProfile={profile} />;
      default: return (
        <div className="flex flex-col h-full bg-gray-50">
          <div className="bg-white/80 backdrop-blur-md p-4 sticky top-0 z-10 flex justify-between items-center border-b shadow-sm h-14">
            <h1 className="font-black text-italian-green text-lg tracking-tighter">{RESTAURANT_NAME}</h1>
            {profile && <img src={profile.pictureUrl} className="w-8 h-8 rounded-full border border-italian-green shadow-sm" />}
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="relative h-44 rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
              <img src="https://i.ibb.co/qLFg7gSk/Gemini-Generated-Image-cmj4yzcmj4yzcmj4.png" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 flex items-end p-6">
                <div className="text-white"><h3 className="font-bold text-xl">Ciao! 歡迎回來</h3><p className="text-[10px] opacity-80 uppercase font-bold tracking-widest mt-1">金門道地義大利風味</p></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={()=>setView('MENU')} className="h-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 shadow-sm"><Icon name="menu" className="w-6 h-6" /></div>
                <span className="font-bold text-gray-700 text-sm">精選菜單</span>
              </button>
              <button onClick={()=>setView('BOOKING')} className="h-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 shadow-sm"><Icon name="calendar" className="w-6 h-6" /></div>
                <span className="font-bold text-gray-700 text-sm">線上訂位</span>
              </button>
              <button onClick={()=>setView('LOCATION')} className="h-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shadow-sm"><Icon name="map" className="w-6 h-6" /></div>
                <span className="font-bold text-gray-700 text-sm">門市資訊</span>
              </button>
              <button onClick={()=>setView('MEMBER')} className="h-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform relative">
                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-500 shadow-sm"><Icon name="user" className="w-6 h-6" /></div>
                <span className="font-bold text-gray-700 text-sm">會員中心</span>
                {!data.member && <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
              </button>
              <button onClick={()=>setView('NEWS')} className="h-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-sm"><Icon name="gift" className="w-6 h-6" /></div>
                <span className="font-bold text-gray-700 text-sm">最新優惠</span>
              </button>
              <button onClick={()=>setView('FAQ')} className="h-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 shadow-sm"><Icon name="chat" className="w-6 h-6" /></div>
                <span className="font-bold text-gray-700 text-sm">客服中心</span>
              </button>
            </div>
            
            <div className="p-10 text-center">
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">Sanowa Kitchen since 2014</p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative h-screen">
      {renderView()}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);