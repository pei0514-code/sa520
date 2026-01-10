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
          chat: "M21 11.5a8.38 8.38