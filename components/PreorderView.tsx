import React, { useState } from 'react';
import { OrderItem } from '../types';
import Swal from 'sweetalert2';

interface PreorderViewProps {
  onSuccess: (orderItems: OrderItem[]) => void;
  onCancel: () => void;
}

// 菜單資料結構
const menuData = {
  "PIZZA (7吋)": [
    { name: "蕃茄田園時蔬披薩 (蛋奶素)", price: 170 },
    { name: "南瓜田園時蔬披薩 (蛋奶素)", price: 160 },
    { name: "義式肉醬野菇披薩 (含牛肉)", price: 160 },
    { name: "燻雞綜合菌菇披薩", price: 160 },
    { name: "(辣)墨西哥辣味香腸披薩", price: 180 },
    { name: "夏威夷蝦仁披薩", price: 200 },
    { name: "煙燻鴨胸肉披薩", price: 200 },
    { name: "B.B.Q海鮮披薩", price: 200 },
    { name: "法式醬海鮮披薩", price: 200 },
    { name: "黑松露野菇披薩", price: 240 }
  ],
  "白醬義大利麵": [
    { name: "奶油培根義大利麵", price: 170 },
    { name: "奶油時蔬義大利麵 (蛋奶素)", price: 170 },
    { name: "西西里奶油嫩雞義大利麵", price: 170 },
    { name: "(辣)墨西哥辣味嫩雞義大利麵", price: 180 },
    { name: "黃芥末鄉村嫩雞義大利麵", price: 180 },
    { name: "(辣)奶油香辣燻鴨義大利麵", price: 190 },
    { name: "奶油蛤蜊義大利麵", price: 220 },
    { name: "奶油海鮮總匯義大利麵", price: 220 },
    { name: "(辣)奶油辣味花枝墨魚麵", price: 260 },
    { name: "奶油香燻鮭魚義大利麵", price: 270 },
    { name: "奶油香烤雞腿排義大利麵", price: 280 }
  ],
  "茄汁義大利麵": [
    { name: "波隆那肉醬義大利麵 (含牛肉)", price: 170 },
    { name: "(辣)茄汁辣味培根義大利麵", price: 170 },
    { name: "茄汁鄉村嫩雞義大利麵", price: 170 },
    { name: "(辣)茄汁辣味德式香腸義大利麵", price: 190 },
    { name: "(辣)茄汁辣味雪花牛義大利麵", price: 220 },
    { name: "粉紅漁沃海鮮義大利麵", price: 220 },
    { name: "茄汁香烤雞腿排義大利麵", price: 280 }
  ],
  "青醬義大利麵": [
    { name: "羅勒野菇義大利麵", price: 180 },
    { name: "羅勒鄉村嫩雞義大利麵", price: 190 },
    { name: "羅勒雪花牛義大利麵", price: 220 },
    { name: "羅勒唐揚炸雞義大利麵", price: 230 },
    { name: "羅勒多利魚義大利麵", price: 240 },
    { name: "羅勒海鮮總匯義大利麵", price: 240 },
    { name: "羅勒香燻鮭魚義大利麵", price: 270 },
    { name: "(辣)羅勒辣味鮮蝦墨魚麵", price: 280 }
  ],
  "南瓜義大利麵": [
    { name: "南瓜培根義大利麵", price: 170 },
    { name: "南瓜時蔬義大利麵 (蛋奶素)", price: 170 },
    { name: "南瓜鄉村嫩雞義大利麵", price: 170 },
    { name: "南瓜辣味香腸義大利麵", price: 190 },
    { name: "南瓜花枝蝦仁義大利麵", price: 200 },
    { name: "南瓜海鮮總匯義大利麵", price: 220 }
  ],
  "咖哩義大利麵": [
    { name: "咖哩鄉村嫩雞義大利麵", price: 170 },
    { name: "咖哩雪花牛義大利麵", price: 200 },
    { name: "咖哩唐揚雞義大利麵", price: 210 },
    { name: "(辣)(辣)紅or綠咖哩嫩雞義大利麵", price: 190 },
    { name: "(辣)(辣)紅or綠咖哩梅花豬義大利麵", price: 220 },
    { name: "(辣)(辣)紅or綠咖哩雪花牛義大利麵", price: 220 },
    { name: "(辣)(辣)紅or綠咖哩多利魚義大利麵", price: 240 }
  ],
  "主廚推薦": [
    { name: "(辣)(辣)宮保辣味雞丁義大利麵", price: 200 },
    { name: "(辣)(辣)宮保辣味花枝義大利麵", price: 220 },
    { name: "蒜香白酒蛤蠣義大利麵", price: 240 },
    { name: "極品X.O醬海鮮義大利麵", price: 250 },
    { name: "墨魚汁海鮮墨魚麵", price: 260 }
  ],
  "義式燉飯": [
    { name: "波隆那肉醬燉飯", price: 160 },
    { name: "奶油燻雞燉飯", price: 160 },
    { name: "奶油培根燉飯", price: 170 },
    { name: "咖哩鄉村嫩雞燉飯", price: 170 },
    { name: "南瓜時蔬燉飯 (蛋奶素)", price: 170 },
    { name: "南瓜德式香腸燉飯", price: 190 },
    { name: "(辣)(辣)紅咖哩or綠咖哩鄉村嫩雞燉飯", price: 180 },
    { name: "(辣)茄汁辣味香腸燉飯", price: 190 },
    { name: "(辣)奶油香辣燻鴨燉飯", price: 190 },
    { name: "奶油西班牙紅椒嫩雞燉飯", price: 190 },
    { name: "奶油西班牙紅椒雪花牛燉飯", price: 220 },
    { name: "粉紅漁沃海鮮燉飯", price: 220 },
    { name: "羅勒唐揚炸雞燉飯", price: 230 },
    { name: "墨魚汁花枝燉飯", price: 230 },
    { name: "墨魚汁海鮮燉飯", price: 240 },
    { name: "羅勒香燻鮭魚燉飯", price: 270 },
    { name: "奶油香烤雞腿排燉飯", price: 280 },
    { name: "咖哩香烤雞腿排燉飯", price: 280 },
    { name: "夏季黑松露野菇燉飯", price: 290 }
  ],
  "焗烤 (筆尖麵)": [
    { name: "焗烤波隆那肉醬筆尖麵", price: 200 },
    { name: "焗烤青醬嫩雞筆尖麵", price: 210 },
    { name: "焗烤奶油嫩雞筆尖麵", price: 210 },
    { name: "焗烤咖哩嫩雞筆尖麵", price: 210 },
    { name: "(辣)(辣)焗烤紅咖哩鄉村嫩雞筆尖麵", price: 220 },
    { name: "(辣)(辣)焗烤綠咖哩鄉村嫩雞筆尖麵", price: 220 },
    { name: "(辣)焗烤茄汁辣味香腸筆尖麵", price: 230 },
    { name: "焗烤咖哩雪花牛筆尖麵", price: 240 },
    { name: "焗烤奶油海鮮筆尖麵", price: 260 },
    { name: "焗烤黑松露野菇筆尖麵", price: 330 },
    { name: "焗烤奶油香烤雞腿排筆尖麵", price: 340 },
    { name: "焗烤咖哩香烤雞腿排筆尖麵", price: 340 }
  ],
  "單點小品": [
    { name: "麥克雞塊", price: 80 },
    { name: "美式脆薯", price: 90 },
    { name: "洋蔥圈", price: 80 },
    { name: "義式焗烤杏鮑菇", price: 100 },
    { name: "紐澳良香辣烤雞翅", price: 140 },
    { name: "麵包 (2個)", price: 30 },
    { name: "主廚濃湯", price: 50 },
    { name: "酥皮濃湯", price: 100 },
    { name: "加麵 or 加飯", price: 30 },
    { name: "加焗烤", price: 40 }
  ],
  "飲品": [
    { name: "可樂", price: 50 },
    { name: "雪碧", price: 50 },
    { name: "蘋果西打", price: 50 },
    { name: "可爾必思", price: 60 },
    { name: "紅茶 (冰/熱)", price: 60 },
    { name: "綠茶 (熱)", price: 60 },
    { name: "奶茶 (冰/熱)", price: 60 },
    { name: "奶綠 (熱)", price: 60 },
    { name: "桂花蜜茶 (冰)", price: 60 }
  ]
};

const PreorderView: React.FC<PreorderViewProps> = ({ onSuccess, onCancel }) => {
  const [activeCategory, setActiveCategory] = useState("PIZZA (7吋)");
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // Modal 狀態
  const [qty, setQty] = useState(1);
  const [noodle, setNoodle] = useState("正常");
  const [setOption, setSetOption] = useState("無");

  // Helper: 判斷是否可以選麵條
  const canChooseNoodle = (category: string, name: string) => {
    return category.includes("義大利麵") || category.includes("主廚推薦");
  };

  // Helper: 判斷是否可以升級套餐 (主餐類)
  const canUpgradeSet = (category: string) => {
    return !["單點小品", "飲品"].includes(category);
  };

  // 處理加入購物車
  const openItemModal = (item: any) => {
    setSelectedItem(item);
    setQty(1);
    setNoodle("正常 (直麵)");
    setSetOption("無");
  };

  const addToCart = () => {
    if (!selectedItem) return;
    
    let itemPrice = selectedItem.price;
    let extras = 0;

    // 計算加價
    if (noodle === "天使細麵 (+10)" || noodle === "通心麵 (+10)") extras += 10;
    if (noodle === "墨魚麵 (+40)") extras += 40;
    
    if (setOption === "+79 超值套餐") extras += 79;
    if (setOption === "+129 酥皮套餐") extras += 129;

    const newItem: OrderItem = {
      id: Date.now().toString(),
      category: activeCategory,
      name: selectedItem.name,
      price: itemPrice,
      quantity: qty,
      noodleType: canChooseNoodle(activeCategory, selectedItem.name) ? noodle : undefined,
      setOption: canUpgradeSet(activeCategory) ? setOption : undefined,
      totalPrice: (itemPrice + extras) * qty
    };

    setCart(prev => [...prev, newItem]);
    setSelectedItem(null);
    const toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    toast.fire({ icon: 'success', title: '已加入購物車' });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const confirmOrder = () => {
    if (cart.length === 0) return Swal.fire('購物車是空的', '請先選擇餐點', 'warning');
    Swal.fire({
      title: '確認送出訂單？',
      text: `總金額: $${calculateTotal()}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '送出',
      confirmButtonColor: '#2c5e50'
    }).then((res) => {
      if (res.isConfirmed) {
        onSuccess(cart);
      }
    });
  };

  const renderTags = (name: string) => {
     let tags = [];
     if (name.includes("(辣)")) {
        const count = (name.match(/\(辣\)/g) || []).length;
        tags.push(<span key="spicy" className="text-red-500 text-xs flex items-center">{Array(count).fill("🌶️").join("")}</span>);
     }
     if (name.includes("(蛋奶素)")) tags.push(<span key="veg" className="bg-green-100 text-green-700 px-1 text-[10px] rounded border border-green-200">蛋奶素</span>);
     if (name.includes("(含牛肉)")) tags.push(<span key="beef" className="bg-red-50 text-red-700 px-1 text-[10px] rounded border border-red-200">含牛肉</span>);
     return <div className="flex gap-1 mt-1">{tags}</div>;
  };

  const cleanName = (name: string) => name.replace(/\(辣\)/g, '').replace(/\(蛋奶素\)/g, '').replace(/\(含牛肉\)/g, '').trim();

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-slide-up">
      {/* Header */}
      <div className="bg-italian-green text-white p-4 flex items-center justify-between shadow-md shrink-0">
        <h2 className="text-lg font-bold">預先點餐</h2>
        <button onClick={onCancel} className="text-sm bg-white/20 px-3 py-1 rounded-full">跳過點餐</button>
      </div>

      {/* Categories Scroll */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto whitespace-nowrap p-2 shadow-sm shrink-0 no-scrollbar">
        {Object.keys(menuData).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 mx-1 rounded-full text-sm font-bold transition-colors ${
              activeCategory === cat ? 'bg-italian-green text-white shadow-md' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="grid gap-4">
           {/* @ts-ignore */}
           {menuData[activeCategory].map((item: any, idx: number) => (
             <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center" onClick={() => openItemModal(item)}>
                <div>
                   <div className="font-bold text-gray-800">{cleanName(item.name)}</div>
                   {renderTags(item.name)}
                   <div className="text-italian-red font-bold mt-1">${item.price}</div>
                </div>
                <button className="w-8 h-8 bg-italian-green text-white rounded-full flex items-center justify-center shadow hover:bg-green-700">+</button>
             </div>
           ))}
        </div>
      </div>

      {/* Cart Summary (Floating) */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-4 pb-8 z-50">
        {cart.length > 0 ? (
          <div className="max-w-md mx-auto">
             <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 text-sm">已選 {cart.reduce((s, i) => s + i.quantity, 0)} 份餐點</span>
                <span className="text-xl font-bold text-italian-dark">${calculateTotal()}</span>
             </div>
             
             {/* Cart Items Preview (Scrollable horizontal) */}
             <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
                {cart.map((item, i) => (
                  <div key={i} className="flex-shrink-0 bg-gray-50 p-2 rounded-lg border border-gray-200 text-xs w-32 relative">
                     <button onClick={(e) => {e.stopPropagation(); removeFromCart(i)}} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center">×</button>
                     <div className="font-bold truncate">{cleanName(item.name)}</div>
                     <div className="text-gray-500">x{item.quantity}</div>
                  </div>
                ))}
             </div>

             <button onClick={confirmOrder} className="w-full bg-italian-dark text-white py-3 rounded-xl font-bold shadow-lg flex justify-center items-center gap-2">
                確認點餐 <span className="bg-white/20 px-2 py-0.5 rounded text-xs">${calculateTotal()}</span>
             </button>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-2">尚未選擇餐點</div>
        )}
      </div>

      {/* Item Customization Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end justify-center sm:items-center p-4">
           <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-1">{cleanName(selectedItem.name)}</h3>
              <div className="text-italian-red font-bold text-lg mb-4">${selectedItem.price}</div>
              
              <div className="space-y-6">
                  {/* Quantity */}
                  <div className="flex items-center justify-between">
                     <span className="font-bold text-gray-700">數量</span>
                     <div className="flex items-center gap-4">
                        <button onClick={() => setQty(Math.max(1, qty-1))} className="w-8 h-8 border rounded-full">-</button>
                        <span className="w-8 text-center font-bold">{qty}</span>
                        <button onClick={() => setQty(Math.min(20, qty+1))} className="w-8 h-8 bg-gray-100 rounded-full">+</button>
                     </div>
                  </div>

                  {/* Noodle Options */}
                  {canChooseNoodle(activeCategory, selectedItem.name) && (
                    <div>
                        <div className="font-bold text-gray-700 mb-2">選擇麵條</div>
                        <div className="grid grid-cols-2 gap-2">
                           {["正常 (直麵)", "筆尖麵", "燉飯", "天使細麵 (+10)", "通心麵 (+10)", "墨魚麵 (+40)"].map(opt => (
                              <button key={opt} onClick={() => setNoodle(opt)}
                                className={`py-2 px-3 text-sm rounded-lg border text-left ${noodle === opt ? 'border-italian-green bg-green-50 text-italian-green font-bold' : 'border-gray-200'}`}>
                                {opt}
                              </button>
                           ))}
                        </div>
                    </div>
                  )}

                  {/* Set Options */}
                  {canUpgradeSet(activeCategory) && (
                    <div>
                        <div className="font-bold text-gray-700 mb-2">升級套餐</div>
                        <div className="space-y-2">
                           <div className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer ${setOption === '無' ? 'border-italian-green bg-green-50' : 'border-gray-200'}`} onClick={() => setSetOption('無')}>
                              <div className={`w-4 h-4 rounded-full border ${setOption === '無' ? 'bg-italian-green border-italian-green' : 'border-gray-400'}`}></div>
                              <span>單點</span>
                           </div>
                           <div className={`p-3 rounded-xl border cursor-pointer ${setOption === '+79 超值套餐' ? 'border-italian-green bg-green-50' : 'border-gray-200'}`} onClick={() => setSetOption('+79 超值套餐')}>
                              <div className="flex items-center gap-3 mb-2">
                                 <div className={`w-4 h-4 rounded-full border ${setOption === '+79 超值套餐' ? 'bg-italian-green border-italian-green' : 'border-gray-400'}`}></div>
                                 <span className="font-bold">+79 超值套餐</span>
                              </div>
                              <div className="flex gap-2 pl-7">
                                 <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">麵包</div>
                                 <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">巧達濃湯</div>
                                 <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">飲品</div>
                              </div>
                           </div>
                           <div className={`p-3 rounded-xl border cursor-pointer ${setOption === '+129 酥皮套餐' ? 'border-italian-green bg-green-50' : 'border-gray-200'}`} onClick={() => setSetOption('+129 酥皮套餐')}>
                              <div className="flex items-center gap-3 mb-2">
                                 <div className={`w-4 h-4 rounded-full border ${setOption === '+129 酥皮套餐' ? 'bg-italian-green border-italian-green' : 'border-gray-400'}`}></div>
                                 <span className="font-bold">+129 酥皮套餐</span>
                              </div>
                              <div className="flex gap-2 pl-7">
                                 <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">麵包</div>
                                 <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">酥皮濃湯</div>
                                 <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">飲品</div>
                              </div>
                           </div>
                        </div>
                    </div>
                  )}
              </div>

              <div className="flex gap-3 mt-8">
                 <button onClick={() => setSelectedItem(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600">取消</button>
                 <button onClick={addToCart} className="flex-[2] py-3 bg-italian-green text-white rounded-xl font-bold shadow-lg">加入購物車</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PreorderView;
