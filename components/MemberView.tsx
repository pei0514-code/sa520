import React, { useState } from 'react';
import { Member, LineProfile } from '../types';
import Swal from 'sweetalert2';

interface MemberViewProps {
  onBack: () => void;
  member: Member | null;
  onRegister: (data: any) => void;
  userProfile: LineProfile | null;
}

const MemberView: React.FC<MemberViewProps> = ({ onBack, member, onRegister, userProfile }) => {
  const [regData, setRegData] = useState({ 
    name: userProfile?.displayName || '', 
    phone: '', 
    birthday: '', 
    gender: 'male', 
    email: '', 
    address: '',
    source: '',
    dietary: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^09\d{8}$/.test(regData.phone)) {
       Swal.fire('格式錯誤', '手機號碼必須是 09 開頭的 10 位數字', 'error');
       return;
    }
    setLoading(true);
    await onRegister(regData);
    setLoading(false);
  };
  
  const showPOSBarcode = () => {
     Swal.fire({
        title: '會員條碼',
        html: '<div class="flex justify-center p-4 bg-white"><svg class="w-48 h-20" viewBox="0 0 100 50"><rect x="0" y="0" width="100" height="50" fill="white"/><path d="M5 5h2v40H5zm4 0h1v40H9zm3 0h2v40h-2zm4 0h1v40h-1zm3 0h2v40h-2zm4 0h2v40h-2zm5 0h1v40h-1zm3 0h2v40h-2zm4 0h1v40h-1zm3 0h3v40h-3zm5 0h1v40h-1zm3 0h2v40h-2z" fill="#000"/></svg></div><p class="mt-2 text-sm text-gray-500">請向櫃檯人員出示此條碼</p>',
        confirmButtonColor: '#2c5e50',
        confirmButtonText: '關閉'
     });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 animate-fade-in">
      <div className="bg-italian-green text-white p-4 flex items-center sticky top-0 z-10 shadow-md">
        <button onClick={onBack} className="mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
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
                     <div>
                        <div className="text-xs text-green-200 tracking-widest mb-1">MEMBER CARD</div>
                        <div className="font-bold text-xl">薩諾瓦義式廚房</div>
                     </div>
                  </div>
                  <div>
                     <div className="text-sm opacity-90 mb-1">{member.phone}</div>
                     <div className="text-lg font-medium tracking-wide">{member.name}</div>
                  </div>
               </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-4">
                  <div className="text-gray-500 text-sm">可用點數</div>
                  <button onClick={() => Swal.fire('點數兌換','請向櫃台人員出示畫面，點數可兌換餐點或折抵消費。','info')} className="text-xs text-italian-green underline">兌換說明</button>
               </div>
               <div className="text-4xl font-bold text-italian-dark mb-6">{member.points} <span className="text-base font-normal text-gray-400">pts</span></div>
               <button onClick={showPOSBarcode} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  會員條碼 (POS)
               </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up">
             <h3 className="font-bold text-xl text-center mb-2 text-italian-green">歡迎加入會員</h3>
             <p className="text-center text-gray-500 text-sm mb-6">立即註冊送 <span className="text-italian-red font-bold">100</span> 點購物金！</p>
             <form onSubmit={handleRegSubmit} className="space-y-4">
                <input type="text" placeholder="姓名 (必填)" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-italian-green" 
                       value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} />
                <input type="tel" placeholder="手機 09xxxxxxxx (必填)" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-italian-green" 
                       value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} />
                
                <div className="pt-2 text-sm font-bold text-gray-600">詳細資料</div>
                
                <div className="grid grid-cols-2 gap-3">
                   <input type="date" className="w-full p-3 bg-gray-50 border rounded-xl text-sm text-gray-500" value={regData.birthday} onChange={e => setRegData({...regData, birthday: e.target.value})} />
                   <select className="w-full p-3 bg-gray-50 border rounded-xl text-sm text-gray-500" value={regData.gender} onChange={e => setRegData({...regData, gender: e.target.value})}>
                      <option value="male">男</option><option value="female">女</option><option value="other">其他</option>
                   </select>
                </div>
                
                <div className="space-y-3">
                    <select className="w-full p-3 bg-gray-50 border rounded-xl text-sm text-gray-500" value={regData.source} onChange={e => setRegData({...regData, source: e.target.value})}>
                      <option value="">您是如何得知我們？ (選填)</option>
                      <option value="facebook">Facebook 粉絲專頁</option>
                      <option value="google">Google 搜尋/地圖</option>
                      <option value="friend">親友推薦</option>
                      <option value="passby">路過</option>
                      <option value="other">其他</option>
                   </select>
                   
                   <input type="text" placeholder="飲食偏好 (例如：不吃牛、過敏...)" className="w-full p-3 bg-gray-50 border rounded-xl" value={regData.dietary} onChange={e => setRegData({...regData, dietary: e.target.value})} />
                </div>

                <input type="email" placeholder="電子信箱 (選填)" className="w-full p-3 bg-gray-50 border rounded-xl" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
                <input type="text" placeholder="地址 (選填)" className="w-full p-3 bg-gray-50 border rounded-xl" value={regData.address} onChange={e => setRegData({...regData, address: e.target.value})} />

                <button type="submit" disabled={loading} className="w-full bg-italian-green text-white py-4 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-colors mt-4">
                   {loading ? '註冊中...' : '立即註冊'}
                </button>
             </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberView;