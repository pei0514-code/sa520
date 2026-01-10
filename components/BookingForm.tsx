import React, { useState, useEffect } from 'react';
import { BookingDetails, Member, LineProfile } from '../types';
import { sendBookingToSheet } from '../services/googleSheetService';
import Swal from 'sweetalert2';

interface BookingFormProps {
  onSuccessWithData: (data: BookingDetails) => void; // 修改這裡
  onCancel: () => void;
  userProfile: LineProfile | null;
  member: Member | null;
}

const BookingForm: React.FC<BookingFormProps> = ({ onSuccessWithData, onCancel, userProfile, member }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<BookingDetails>({
    date: today,
    time: '18:00',
    guests: 2,
    adults: 2,
    children: 0,
    highChairs: 0,
    name: member?.name || userProfile?.displayName || '',
    phone: member?.phone || '',
    notes: ''
  });

   // 初始化：讀取 LocalStorage
   useEffect(() => {
      const saved = localStorage.getItem('booking_user_info');
      if (saved) {
         try {
            const parsed = JSON.parse(saved);
            setFormData(prev => ({
               ...prev,
               name: member?.name || parsed.name || prev.name,
               phone: member?.phone || parsed.phone || prev.phone,
               guests: (parsed.adults || 2) + (parsed.children || 0),
               adults: parsed.adults || 2,
               children: parsed.children || 0
            }));
         } catch(e) {}
      }
   }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^09\d{8}$/.test(formData.phone)) {
        return Swal.fire('格式錯誤','手機號碼需為09開頭10碼','error');
    }

    setIsLoading(true);
    const success = await sendBookingToSheet(formData, userProfile);
    setIsLoading(false);
    
    if (success) {
        // 儲存常用資訊到 LocalStorage
        localStorage.setItem('booking_user_info', JSON.stringify({
           name: formData.name,
           phone: formData.phone,
           adults: formData.adults,
           children: formData.children
        }));

        // LIFF 發訊 (如果沒有後續預點，這裡發送基本訂位通知，但因為App.tsx會處理，這裡可以先只做成功回調)
        // 為了避免重複發訊，我們將發訊邏輯統一移到 App.tsx 的最終流程，或者如果只是基本訂位就在這裡發。
        // 在目前的架構下，我們將資料傳回 App.tsx 處理
        onSuccessWithData(formData);
    }
  };

  // Helper for Counter
  const Counter = ({ label, value, onChange, min = 0, max = 20 }: any) => (
    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
       <span className="font-bold text-gray-700">{label}</span>
       <div className="flex items-center gap-4">
           <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 active:bg-gray-100 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
           </button>
           <span className="w-6 text-center font-bold text-xl text-italian-green">{value}</span>
           <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="w-9 h-9 rounded-full bg-italian-green flex items-center justify-center text-white shadow-lg shadow-green-200 active:scale-95 transition-all">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
           </button>
       </div>
    </div>
  );

  const timeSlots = [
    '11:00', '11:30', '12:00', '12:30', '13:00',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  return (
    <div className="bg-white rounded-t-3xl shadow-2xl p-6 min-h-[80vh] animate-slide-up flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-italian-dark">
          {step === 1 ? '選擇日期與時間' : '填寫訂位資訊'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
        {step === 1 && (
          <div className="space-y-6 animate-slide-up">
            <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-italian-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   日期
                </label>
                <input type="date" name="date" min={today} value={formData.date} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-italian-green" required />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-italian-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  時間
              </label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map(time => (
                  <button key={time} type="button" onClick={() => setFormData(prev => ({ ...prev, time }))} className={`py-2 px-1 text-sm rounded-lg border ${formData.time === time ? 'bg-italian-green text-white border-italian-green shadow-md transform scale-105' : 'bg-white text-gray-600 border-gray-200 hover:border-italian-green'}`}>
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-italian-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                     人數與需求
                </label>
                <Counter label="大人" value={formData.adults || 2} onChange={(v: number) => setFormData(prev => ({ ...prev, adults: v }))} min={1} />
                <Counter label="小孩" value={formData.children || 0} onChange={(v: number) => setFormData(prev => ({ ...prev, children: v }))} />
                
                {(formData.children || 0) > 0 && (
                    <div className="flex justify-between items-center bg-orange-50 p-4 rounded-xl border border-orange-100 animate-fade-in">
                        <span className="font-bold text-orange-800 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span> 需要兒童椅
                        </span>
                        <div className="flex items-center gap-3">
                           <input type="checkbox" className="w-5 h-5 accent-orange-500" checked={(formData.highChairs || 0) > 0} onChange={e => setFormData(prev => ({...prev, highChairs: e.target.checked ? 1 : 0}))} />
                           {(formData.highChairs || 0) > 0 && (
                               <select className="bg-white border border-orange-300 rounded-lg p-1 text-sm outline-none" value={formData.highChairs} onChange={e => setFormData(prev => ({...prev, highChairs: parseInt(e.target.value)}))}>
                                   {[...Array(formData.children).keys()].map(i => <option key={i+1} value={i+1}>{i+1} 張</option>)}
                               </select>
                           )}
                        </div>
                    </div>
                )}
            </div>

            <button type="button" onClick={() => setStep(2)} className="w-full mt-4 bg-italian-green text-white py-4 rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
              下一步 <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-slide-up flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl text-sm text-gray-600 space-y-2 border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-italian-green/5 rounded-full blur-xl -mr-5 -mt-5"></div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="font-bold flex items-center gap-2">時間</span>
                    <span className="text-italian-dark font-medium">{formData.date} {formData.time}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-bold flex items-center gap-2">人數</span>
                    <span className="text-italian-dark font-medium">{formData.adults}大 {formData.children}小</span>
                </div>
            </div>

            <div className="space-y-4">
                 <div className="relative">
                    <div className="absolute left-4 top-4 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="訂位大名" className="w-full pl-12 p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-italian-green" required />
                </div>
                <div className="relative">
                    <div className="absolute left-4 top-4 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="聯絡電話" className="w-full pl-12 p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-italian-green" required />
                </div>
                <div className="relative">
                    <div className="absolute left-4 top-4 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="其他備註 (例如：慶生、過敏...)" rows={3} className="w-full pl-12 p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-italian-green" />
                </div>
            </div>

            <div className="flex gap-3 mt-auto">
              <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors">重選</button>
              <button type="submit" disabled={isLoading} className="flex-[2] bg-italian-red text-white py-4 rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-colors flex justify-center items-center gap-2">
                {isLoading ? '處理中...' : '確認訂位'} <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default BookingForm;
