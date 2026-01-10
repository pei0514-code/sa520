import React, { useEffect, useState } from 'react';
import { ViewState, LineProfile, Member, Promotion, FaqItem, BookingDetails, OrderItem } from './types';
import { initLiff, closeLiff } from './services/liffService';
import { fetchInitialDataFromSheet, registerMemberToSheet, sendPreorderToSheet } from './services/googleSheetService';
import BookingForm from './components/BookingForm';
import ChefChat from './components/ChefChat';
import MenuView from './components/MenuView';
import LocationView from './components/LocationView';
import MemberView from './components/MemberView';
import NewsView from './components/NewsView';
import FaqView from './components/FaqView';
import PreorderView from './components/PreorderView';
import { RESTAURANT_NAME } from './constants';
import Swal from 'sweetalert2';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [profile, setProfile] = useState<LineProfile | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  
  // 暫存訂位人資訊，用於預點餐
  const [tempBookingInfo, setTempBookingInfo] = useState<BookingDetails | null>(null);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const p = await initLiff();
      setProfile(p);

      const uid = p?.userId || 'GUEST_USER'; 
      const data = await fetchInitialDataFromSheet(uid);
      
      if (data.member) setMember(data.member);
      if (data.faqs) setFaqs(data.faqs);
      if (data.promotions) setPromotions(data.promotions);
      
      setLoading(false);
    };

    initialize();
  }, []);

  const handleRegister = async (regData: any) => {
    setLoading(true);
    const result = await registerMemberToSheet({
      ...regData,
      lineUserId: profile?.userId
    });
    
    if (result.status === 'success') {
      setMember(result.member);
      setView(ViewState.HOME);
      Swal.fire({
         title: '註冊成功',
         text: '恭喜加入！已獲得 100 點購物金。',
         icon: 'success',
         confirmButtonColor: '#2c5e50'
      });
    } else {
      Swal.fire('註冊失敗', result.message, 'error');
    }
    setLoading(false);
  };

  const handleBookingSuccess = (bookingDetails: BookingDetails) => {
    setTempBookingInfo(bookingDetails);
    
    Swal.fire({
      title: '訂位成功！',
      text: '是否要現在預先點餐？這能大幅減少您的等候時間。',
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: '是，我要預點',
      cancelButtonText: '不用了，謝謝',
      confirmButtonColor: '#2c5e50',
      cancelButtonColor: '#718096'
    }).then((result) => {
      if (result.isConfirmed) {
        setView(ViewState.PREORDER);
      } else {
        setView(ViewState.SUCCESS);
      }
    });
  };

  const handlePreorderSuccess = async (orderItems: OrderItem[]) => {
    setLoading(true);
    
    // 準備預點資料
    const preorderPayload = {
      name: tempBookingInfo?.name,
      phone: tempBookingInfo?.phone,
      bookingDate: tempBookingInfo?.date,
      bookingTime: tempBookingInfo?.time,
      lineUserId: profile?.userId,
      items: orderItems,
      totalAmount: orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
    };

    const result = await sendPreorderToSheet(preorderPayload);
    setLoading(false);

    if (result.status === 'success') {
       // 發送 LIFF 訊息
       try {
           if ((window as any).liff && (window as any).liff.isInClient()) {
               const itemText = orderItems.map(i => `- ${i.name} ${i.noodleType ? `[${i.noodleType}]` : ''} x${i.quantity}`).join('\n');
               const msgText = `【預點餐單確認】\n訂位人：${tempBookingInfo?.name}\n日期：${tempBookingInfo?.date} ${tempBookingInfo?.time}\n\n${itemText}\n\n總金額：$${preorderPayload.totalAmount}\n餐點將於入座後為您準備。`;
               await (window as any).liff.sendMessages([{ type: 'text', text: msgText }]);
           }
       } catch (e) { console.error(e); }

       setView(ViewState.SUCCESS);
    } else {
       Swal.fire('預點失敗', result.message || '請稍後再試', 'error');
    }
  };

  const checkMemberAndRedirect = (targetView: ViewState) => {
    if (member) {
      setView(targetView);
    } else {
      Swal.fire({
        title: '會員限定',
        text: '線上訂位僅開放給會員使用，是否立即免費註冊？',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '去註冊',
        cancelButtonText: '取消',
        confirmButtonColor: '#2c5e50'
      }).then((result) => {
        if (result.isConfirmed) {
          setView(ViewState.MEMBER);
        }
      });
    }
  };

  // Helper for Icon rendering
  const Icon = ({ name, className }: { name: string, className?: string }) => {
      const paths: any = {
          menu: "M4 6h16M4 12h16M4 18h16",
          calendar: "M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 0V2m-14 2V2",
          map: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
          user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
          gift: "M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
          chat: "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z",
          faq: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      };

      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={paths[name] || ''} />
        </svg>
      );
  };
  
// Fix: Added return statement with JSX to render the component UI.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-italian-green border-dashed rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">載入中...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case ViewState.MENU:
        return <MenuView onBack={() => setView(ViewState.HOME)} />;
      case ViewState.LOCATION:
        return <LocationView onBack={() => setView(ViewState.HOME)} />;
      case ViewState.NEWS:
        return <NewsView onBack={() => setView(ViewState.HOME)} promotions={promotions} />;
      case ViewState.MEMBER:
        return <MemberView onBack={() => setView(ViewState.HOME)} member={member} onRegister={handleRegister} userProfile={profile} />;
      case ViewState.FAQ:
        return <FaqView onBack={() => setView(ViewState.HOME)} faqs={faqs} onOpenChat={() => setView(ViewState.CHAT)} />;
      default:
        return null; // The home screen is rendered below, this is for full-screen views
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-italian-white font-sans flex flex-col relative overflow-hidden">
      {/* Main Home Screen */}
      <div className={`flex flex-col flex-1 h-full ${view !== ViewState.HOME && view !== ViewState.SUCCESS ? 'hidden' : ''}`}>
        {/* Header */}
        <header className="p-4 pt-8 bg-white flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400">歡迎光臨</p>
            <h1 className="text-2xl font-bold text-italian-dark">{RESTAURANT_NAME}</h1>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-italian-green overflow-hidden">
            <img src={profile?.pictureUrl || 'https://picsum.photos/100'} alt="User" className="w-full h-full object-cover" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Booking Button */}
          <button onClick={() => checkMemberAndRedirect(ViewState.BOOKING)} className="w-full bg-gradient-to-r from-italian-red to-red-700 text-white rounded-2xl p-6 text-left shadow-lg shadow-red-200 hover:scale-105 transition-transform">
            <h2 className="text-2xl font-bold mb-1">立即訂位</h2>
            <p className="text-red-100">線上預訂，享受美味無需等待</p>
          </button>
          
          {/* Promotions */}
          {promotions.length > 0 && (
            <div onClick={() => setView(ViewState.NEWS)} className="cursor-pointer">
              <h3 className="font-bold text-gray-700 mb-2">最新優惠</h3>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                 <img src={promotions[0].image} className="w-20 h-20 object-cover rounded-lg" alt={promotions[0].title} />
                 <div>
                    <h4 className="font-bold text-italian-dark">{promotions[0].title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{promotions[0].desc.substring(0, 30)}...</p>
                 </div>
              </div>
            </div>
          )}

          {/* Grid Menu */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <button onClick={() => setView(ViewState.MENU)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center aspect-square space-y-2">
              <Icon name="menu" className="w-8 h-8 text-italian-green"/>
              <span className="text-xs font-bold text-gray-600">看菜單</span>
            </button>
             <button onClick={() => setView(ViewState.LOCATION)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center aspect-square space-y-2">
              <Icon name="map" className="w-8 h-8 text-italian-green"/>
              <span className="text-xs font-bold text-gray-600">門市資訊</span>
            </button>
             <button onClick={() => setView(ViewState.MEMBER)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center aspect-square space-y-2">
              <Icon name="user" className="w-8 h-8 text-italian-green"/>
              <span className="text-xs font-bold text-gray-600">會員中心</span>
            </button>
             <button onClick={() => setView(ViewState.NEWS)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center aspect-square space-y-2">
              <Icon name="gift" className="w-8 h-8 text-italian-green"/>
              <span className="text-xs font-bold text-gray-600">最新優惠</span>
            </button>
            <button onClick={() => setView(ViewState.CHAT)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center aspect-square space-y-2">
              <Icon name="chat" className="w-8 h-8 text-italian-green"/>
              <span className="text-xs font-bold text-gray-600">AI主廚</span>
            </button>
            <button onClick={() => setView(ViewState.FAQ)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center aspect-square space-y-2">
              <Icon name="faq" className="w-8 h-8 text-italian-green"/>
              <span className="text-xs font-bold text-gray-600">客服中心</span>
            </button>
          </div>
        </main>
      </div>

      {/* Render Full-screen Views */}
      {renderContent()}

      {/* Overlays */}
      {view === ViewState.BOOKING && (
        <BookingForm 
          onSuccessWithData={handleBookingSuccess} 
          onCancel={() => setView(ViewState.HOME)} 
          userProfile={profile}
          member={member}
        />
      )}
      {view === ViewState.CHAT && <ChefChat onClose={() => setView(ViewState.HOME)} />}
      {view === ViewState.PREORDER && tempBookingInfo && (
        <PreorderView 
          onSuccess={handlePreorderSuccess} 
          onCancel={() => setView(ViewState.SUCCESS)} 
        />
      )}
      
      {/* Success View */}
      {view === ViewState.SUCCESS && (
        <div className="absolute inset-0 z-40 bg-white flex flex-col items-center justify-center text-center p-8 animate-fade-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
             <svg className="w-12 h-12 text-italian-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-italian-dark mb-2">作業完成！</h2>
          <p className="text-gray-500 mb-8">感謝您的使用，期待您的光臨。</p>
          <button onClick={closeLiff} className="w-full bg-italian-green text-white py-4 rounded-xl font-bold">關閉視窗</button>
        </div>
      )}
    </div>
  );
};

// Fix: Added default export for the component.
export default App;
