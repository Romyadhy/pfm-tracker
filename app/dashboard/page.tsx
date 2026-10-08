import Link from 'next/link';
import { createClient } from '../utils/supabase/server';

interface TransactionRecord {
  id: number;
  amount: number;
  type: string;
  category_id: number;
  note?: string | null;
  created_at: string;
  categories?: { name: string } | { name: string }[] | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ponytail: query transactions with category join scoped to user
  const { data: rawTransactions } = await supabase
    .from('transactions')
    .select(`
      id,
      amount,
      type,
      category_id,
      note,
      created_at,
      categories ( name )
    `)
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  const transactions = (rawTransactions || []) as TransactionRecord[];

  const income = transactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const expense = transactions
    .filter((t) => t.type?.startsWith('pengeluaran'))
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalBalance = income - expense;

  // ponytail: calculate last 7 days expense breakdown
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const last7Days = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - index));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
    const dayNumber = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    const total = transactions
      .filter((t) => t.type === 'pengeluaran' && t.created_at?.startsWith(dateStr))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    return {
      dateStr,
      dayName,
      dayNumber,
      total,
      isToday: dateStr === todayStr,
    };
  });

  const maxDailyExpense = Math.max(...last7Days.map((d) => d.total), 1);
  const todayExpense = last7Days.find((d) => d.isToday)?.total || 0;

  // ponytail: calculate category breakdown ("Kemana saja uang saya")
  const categoryMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'pengeluaran')
    .forEach((t) => {
      const catName = Array.isArray(t.categories)
        ? t.categories[0]?.name
        : t.categories?.name || 'Tanpa Kategori';
      categoryMap[catName] = (categoryMap[catName] || 0) + Number(t.amount || 0);
    });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([name, total]) => ({
      name,
      total,
      percentage: expense > 0 ? Math.round((total / expense) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Selamat datang kembali, <span className="font-semibold text-zinc-200">{user?.email}</span>
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/transactions"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition active:scale-[0.99]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Kelola Transaksi
          </Link>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Saldo */}
        <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Saldo</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mt-3 tracking-tight">
            Rp {totalBalance.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-zinc-500 mt-2">Saldo bersih akumulasi</p>
        </div>

        {/* Pemasukan */}
        <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pemasukan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-3 tracking-tight">
            + Rp {income.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-zinc-500 mt-2">Total pendapatan tercatat</p>
        </div>

        {/* Pengeluaran */}
        <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pengeluaran</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-3 tracking-tight">
            - Rp {expense.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-zinc-500 mt-2">Total pengeluaran tercatat</p>
        </div>
      </div>

      {/* Visual Analytics Grid: 2 Kolom Interaktif */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Bar Chart Pengeluaran 7 Hari Terakhir */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Pengeluaran 7 Hari Terakhir
              </h3>
              <span className="text-xs text-zinc-400">
                Hari ini:{' '}
                <strong className="text-rose-400">Rp {todayExpense.toLocaleString('id-ID')}</strong>
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-6">
              Tren pengeluaran harian Anda untuk mengontrol budget secara berkala.
            </p>
          </div>

          {/* Bar Chart Container */}
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-zinc-800">
            {last7Days.map((day) => {
              const heightPercent =
                day.total > 0
                  ? Math.max(12, Math.round((day.total / maxDailyExpense) * 100))
                  : 4;

              return (
                <div
                  key={day.dateStr}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                >
                  {/* Floating Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-zinc-950 border border-zinc-700 text-zinc-100 text-[11px] font-medium py-1 px-2 rounded-lg whitespace-nowrap shadow-xl z-20">
                    {day.dayNumber}: Rp {day.total.toLocaleString('id-ID')}
                  </div>

                  {/* Vertical Bar */}
                  <div className="w-full max-w-[36px] bg-zinc-800/80 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        day.isToday
                          ? 'bg-rose-500 group-hover:bg-rose-400'
                          : day.total > 0
                          ? 'bg-zinc-600 group-hover:bg-zinc-500'
                          : 'bg-zinc-800'
                      }`}
                    />
                  </div>

                  {/* Day Label */}
                  <div className="mt-3 text-center">
                    <span
                      className={`block text-[11px] font-semibold ${
                        day.isToday ? 'text-rose-400' : 'text-zinc-400'
                      }`}
                    >
                      {day.dayName}
                    </span>
                    <span className="block text-[10px] text-zinc-500">
                      {day.dayNumber.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Breakdown Kategori: "Kemana Saja Uang Saya" */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800/90 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Kemana Saja Uang Anda?
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Distribusi porsi pengeluaran berdasarkan kategori.
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {categoryBreakdown.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                Belum ada data pengeluaran yang tercatat.
              </div>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown.slice(0, 5).map((cat, idx) => {
                  const colors = [
                    'bg-rose-500',
                    'bg-amber-500',
                    'bg-indigo-500',
                    'bg-emerald-500',
                    'bg-sky-500',
                  ];
                  const barColor = colors[idx % colors.length];

                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-200 truncate pr-2">
                          {cat.name}
                        </span>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span className="text-zinc-400 font-medium">
                            Rp {cat.total.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[11px] font-bold text-zinc-300 w-8 text-right">
                            {cat.percentage}%
                          </span>
                        </div>
                      </div>
                      {/* Progress Bar Track */}
                      <div className="w-full bg-zinc-800/90 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${cat.percentage}%` }}
                          className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        />
                      </div>
                    </div>
                  );
                })}

                {categoryBreakdown.length > 5 && (
                  <p className="text-[11px] text-zinc-500 text-center pt-1">
                    +{categoryBreakdown.length - 5} kategori lainnya
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
