import { LineProfile } from '../types';

// 模擬 LINE LIFF SDK 邏輯 (用於瀏覽器開發環境)
// 在正式環境中，這會與 window.liff 互動

export const initLiff = async (): Promise<LineProfile | null> => {
  try {
    // 檢查是否在真實的 LIFF 環境中運行
    // @ts-ignore
    if (window.liff) {
      // @ts-ignore
      await window.liff.init({ liffId: "YOUR_LIFF_ID_HERE" }); // 請在此填入您的 LIFF ID
      
      // @ts-ignore
      if (!window.liff.isLoggedIn()) {
        // @ts-ignore
        // window.liff.login(); // 真實 App 中通常會強制登入
        console.log("Mock: Not logged in (Simulating login for demo)");
      }
      
      // @ts-ignore
      if (window.liff.isInClient()) {
         // @ts-ignore
         const profile = await window.liff.getProfile();
         return profile as LineProfile;
      }
    }
  } catch (error) {
    console.warn("LIFF init failed (expected in local dev):", error);
  }

  // 返回用於開發/預覽的模擬個人資料
  return {
    userId: 'mock_user_123',
    displayName: '王小明',
    pictureUrl: 'https://picsum.photos/200'
  };
};

export const closeLiff = () => {
  // @ts-ignore
  if (window.liff && window.liff.isInClient()) {
    // @ts-ignore
    window.liff.closeWindow();
  } else {
    console.log("Mock: Closing LIFF window");
  }
};