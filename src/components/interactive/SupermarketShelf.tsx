import { useState } from "react";

interface ShelfItem {
  name: string;
  price: number;
  barcode: string;
  emoji: string;
  stock: number;
}

const SHELF_ITEMS: ShelfItem[] = [
  { name: "牛奶", price: 6.5, barcode: "6901234567890", emoji: "🥛", stock: 45 },
  { name: "面包", price: 4.0, barcode: "6901234567891", emoji: "🍞", stock: 32 },
  { name: "苹果", price: 3.0, barcode: "6901234567892", emoji: "🍎", stock: 8 },
  { name: "铅笔", price: 2.0, barcode: "6901234567893", emoji: "✏️", stock: 60 },
  { name: "薯片", price: 5.5, barcode: "6901234567894", emoji: "🍪", stock: 20 },
  { name: "矿泉水", price: 1.5, barcode: "6901234567895", emoji: "💧", stock: 15 },
];

export default function SupermarketShelf() {
  const [scanned, setScanned] = useState<ShelfItem | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = (item: ShelfItem) => {
    setScanning(true);
    setScanned(null);
    setTimeout(() => {
      setScanned(item);
      setScanning(false);
    }, 600);
  };

  return (
    <div className="bg-gradient-to-b from-slate-100 to-slate-200 rounded-xl p-4 border-2 border-slate-300">
      {/* Shelf header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏪</span>
          <span className="text-sm font-bold text-slate-700">超市货架</span>
        </div>
        <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-full">
          点击商品查看条形码信息
        </span>
      </div>

      {/* Shelf */}
      <div className="bg-amber-100 rounded-lg p-2 border-b-4 border-amber-700 mb-2">
        <div className="grid grid-cols-3 gap-2">
          {SHELF_ITEMS.map((item) => (
            <button
              key={item.barcode}
              onClick={() => handleScan(item)}
              className="bg-white rounded-lg p-2 text-center hover:shadow-md hover:scale-105 transition-all cursor-pointer border border-slate-200"
            >
              <div className="text-2xl mb-0.5">{item.emoji}</div>
              <div className="text-[11px] font-semibold text-slate-700 truncate">{item.name}</div>
              <div className="text-[10px] text-amber-600 font-bold">¥{item.price}</div>
              <div className="mt-1 mx-auto h-3 w-12 bg-[repeating-linear-gradient(90deg,#000,#000_1px,#fff_1px,#fff_2px)] rounded-sm" />
            </button>
          ))}
        </div>
      </div>

      {/* Scanner display */}
      <div className="bg-slate-800 rounded-lg p-3 min-h-[80px] flex items-center justify-center">
        {scanning ? (
          <div className="text-center">
            <div className="text-red-500 text-sm animate-pulse">🔴 扫描中...</div>
            <div className="w-32 h-1 bg-red-500/30 rounded-full mt-1 mx-auto overflow-hidden">
              <div className="h-full bg-red-500 animate-[scan_0.6s_ease-in-out]" 
                style={{ width: "30%", animation: "scan 0.6s ease-in-out infinite" }} />
            </div>
          </div>
        ) : scanned ? (
          <div className="text-green-400 text-center w-full">
            <div className="flex items-center gap-2 justify-center mb-1">
              <span className="text-lg">{scanned.emoji}</span>
              <span className="text-sm font-bold">{scanned.name}</span>
              <span className="text-xs text-green-300">¥{scanned.price}</span>
            </div>
            <div className="text-[10px] text-green-300/70">
              条形码: {scanned.barcode}
            </div>
            <div className="text-[10px] text-green-300/70">
              库存: {scanned.stock}件 | 产地: 深圳
            </div>
          </div>
        ) : (
          <div className="text-slate-500 text-xs flex items-center gap-2">
            <span>📷</span> 点击货架上的商品进行扫码
          </div>
        )}
      </div>
    </div>
  );
}
