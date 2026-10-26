'use client';

import { useState, useEffect } from 'react';

interface ChartDataPoint {
  month: string;
  pemasukan: number;
  pengeluaran: number;
}

interface NativeFinancialChartProps {
  data?: ChartDataPoint[];
}

export default function NativeFinancialChart({ data: dataProp }: NativeFinancialChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const getLast7MonthsConfig = () => {
    const list = [];
    const date = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      list.push({
        label: d.toLocaleString('id-ID', { month: 'short' }),
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
      });
    }
    return list;
  };

  useEffect(() => {
    if (dataProp && dataProp.length > 0) {
      setChartData(dataProp);
      setLoading(false);
      return;
    }

    const fetchRealTimeChartData = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error('Gagal memuat data grafik');
        }

        const resData = await response.json();
        const rawTransactions = resData.data || [];

        const monthsConfig = getLast7MonthsConfig();

        const compiledData: ChartDataPoint[] = monthsConfig.map((m) => {
          let totalPemasukan = 0;
          let totalPengeluaran = 0;

          rawTransactions.forEach((tx: any) => {
            const txDate = new Date(tx.tanggal);
            if (txDate.getFullYear() === m.year && txDate.getMonth() === m.monthIndex) {
              if (tx.tipe === 'pemasukan') {
                totalPemasukan += Number(tx.nominal || 0);
              } else if (tx.tipe === 'pengeluaran') {
                totalPengeluaran += Number(tx.nominal || 0);
              }
            }
          });

          return {
            month: m.label,
            pemasukan: totalPemasukan,
            pengeluaran: totalPengeluaran,
          };
        });

        setChartData(compiledData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealTimeChartData();
  }, [dataProp]);

  const width = 500;
  const height = 220;
  const paddingX = 35;
  const paddingTop = 30;
  const paddingBottom = 40;

  if (loading) {
    return (
      <div className="p-6 rounded-2xl text-white w-full h-[220px] flex items-center justify-center text-xs text-gray-500">
        Memuat grafik data keuangan...
      </div>
    );
  }

  const allValues = chartData.flatMap((d) => [d.pemasukan, d.pengeluaran]);
  const maxValue = Math.max(...allValues, 100000);

  const getX = (index: number) => paddingX + (index / (chartData.length - 1 || 1)) * (width - paddingX * 2);
  const getY = (value: number) => {
    const usableHeight = height - paddingTop - paddingBottom;
    return height - paddingBottom - (value / maxValue) * usableHeight;
  };

  const incomePath = `M ${chartData.map((d, i) => `${getX(i)},${getY(d.pemasukan)}`).join(' L ')}`;
  const expensePath = `M ${chartData.map((d, i) => `${getX(i)},${getY(d.pengeluaran)}`).join(' L ')}`;

  return (
    <div className="p-2 sm:p-4 rounded-2xl text-white w-full">
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          {[0, 0.5, 1].map((ratio, idx) => {
            const yPos = height - paddingBottom - ratio * (height - paddingTop - paddingBottom);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={yPos}
                x2={width - paddingX}
                y2={yPos}
                stroke="#ffffff"
                strokeOpacity="0.06"
                strokeDasharray="4 4"
              />
            );
          })}

          <path d={incomePath} fill="none" stroke="#2EC4B6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={expensePath} fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {chartData.map((item, idx) => {
            const cx = getX(idx);
            const cyIncome = getY(item.pemasukan);
            const cyExpense = getY(item.pengeluaran);
            const isHovered = hoveredIndex === idx;

            return (
              <g key={idx}>
                <rect
                  x={cx - 15}
                  y={0}
                  width="30"
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {isHovered && (
                  <line
                    x1={cx}
                    y1={paddingTop}
                    x2={cx}
                    y2={height - paddingBottom}
                    stroke="#ffffff"
                    strokeOpacity="0.2"
                    strokeDasharray="2 2"
                  />
                )}

                <circle cx={cx} cy={cyIncome} r={isHovered ? '6' : '4'} fill="#2EC4B6" stroke="#2EC4B6" strokeWidth="2.5" className="transition-all duration-200 pointer-events-none" />
                <circle cx={cx} cy={cyExpense} r={isHovered ? '6' : '4'} fill="#EF4444" stroke="#EF4444" strokeWidth="2.5" className="transition-all duration-200 pointer-events-none" />
              </g>
            );
          })}
        </svg>

        {hoveredIndex !== null && chartData[hoveredIndex] && (
          <div
            className="absolute -top-12 bg-[#121824] border border-gray-700 text-xs p-2.5 rounded-xl shadow-2xl pointer-events-none transform -translate-x-1/2 transition-all duration-150 z-10 min-w-36"
            style={{ left: `${(hoveredIndex / (chartData.length - 1 || 1)) * 100}%` }}
          >
            <div className="font-semibold text-gray-300 border-b border-gray-700/60 pb-1 mb-1.5">
              Bulan {chartData[hoveredIndex].month}
            </div>
            <div className="flex items-center justify-between gap-3 text-[#2EC4B6]">
              <span>Masuk:</span>
              <span className="font-bold">Rp {chartData[hoveredIndex].pemasukan.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[#EF4444]">
              <span>Keluar:</span>
              <span className="font-bold">Rp {chartData[hoveredIndex].pengeluaran.toLocaleString('id-ID')}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-400 px-1 font-medium">
        {chartData.map((item, idx) => (
          <span key={idx} className={hoveredIndex === idx ? 'text-white font-bold' : ''}>
            {item.month}
          </span>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2EC4B6]"></span>
            <span className="text-gray-300">Pemasukan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
            <span className="text-gray-300">Pengeluaran</span>
          </div>
        </div>
      </div>
    </div>
  );
}