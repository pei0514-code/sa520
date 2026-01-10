import { BookingDetails } from '../types';
import { GOOGLE_SCRIPT_URL } from '../constants';

// 通用的 Fetch 處理器
const fetchFromGAS = async (method: 'GET' | 'POST', params: any = {}) => {
  try {
    let url = GOOGLE_SCRIPT_URL;
    let options: RequestInit = {
      method: method,
    };

    if (method === 'GET') {
      const queryString = new URLSearchParams(params).toString();
      url = `${url}?${queryString}`;
    } else {
      options.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
      options.body = JSON.stringify(params);
    }

    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();

  } catch (error) {
    console.error("GAS API Error:", error);
    return { status: 'error', message: '網路連線失敗，請檢查您的網路或 API 設定。' };
  }
};

export const fetchInitialDataFromSheet = async (lineUserId: string) => {
  return await fetchFromGAS('GET', { action: 'getInitialData', lineUserId: lineUserId });
};

export const sendBookingToSheet = async (booking: BookingDetails, userProfile: any): Promise<boolean> => {
  const payload = {
    action: 'booking',
    ...booking,
    lineUserId: userProfile?.userId || 'unknown',
    lineDisplayName: userProfile?.displayName || 'Guest',
    created_at: new Date().toISOString()
  };
  const result = await fetchFromGAS('POST', payload);
  return result.status === 'success';
};

export const registerMemberToSheet = async (data: any) => {
  const payload = { action: 'register', ...data };
  return await fetchFromGAS('POST', payload);
};

export const sendPreorderToSheet = async (preorderData: any) => {
  const payload = { action: 'preorder', ...preorderData };
  return await fetchFromGAS('POST', payload);
};
