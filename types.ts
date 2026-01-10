export interface BookingDetails {
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  notes: string;
  adults?: number;
  children?: number;
  highChairs?: number;
}

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

export enum ViewState {
  HOME = 'HOME',
  BOOKING = 'BOOKING',
  CHAT = 'CHAT',
  SUCCESS = 'SUCCESS',
  MENU = 'MENU',
  LOCATION = 'LOCATION',
  NEWS = 'NEWS',
  MEMBER = 'MEMBER',
  FAQ = 'FAQ',
  PREORDER = 'PREORDER'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Promotion {
  id: number;
  title: string;
  desc: string;
  image: string;
  validUntil: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Member {
  name: string;
  phone: string;
  birthday?: string;
  points: number;
  email?: string;
  gender?: string;
  address?: string;
}

export interface OrderItem {
  id: string;
  category: string;
  name: string;
  price: number;
  quantity: number;
  noodleType?: string;
  setOption?: string;
  totalPrice: number;
}