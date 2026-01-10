import React from 'react';
import ReactDOM from 'react-dom/client';

// 一個絕對不會出錯的超簡單元件
const App = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#2c5e50', color: 'white', fontSize: '24px', textAlign: 'center' }}>
      測試成功！
      <p style={{ fontSize: '16px', marginTop: '10px' }}>React 渲染正常。</p>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);