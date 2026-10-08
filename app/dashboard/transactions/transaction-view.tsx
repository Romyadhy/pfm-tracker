'use client';

import { useState, useMemo } from 'react';
import { addTransaction, updateTransaction, deleteTransaction } from './actions';

export interface Category {
  id: number;
  name: string;
}

export interface Transaction {
  id: number;
  amount: number;
  type: string;
  category_id: number;
  note?: string | null;
  created_at: string;
  categories?: { name: string } | null;
}

interface TransactionViewProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function TransactionView({
  transactions,
  categories,
}: TransactionViewProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pemasukan' | 'pengeluaran'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingTrx, setEditingTrx] = useState<Transaction | null>(null);

  // ponytail: today date string YYYY-MM-DD
  const todayDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  // ponytail: instant in-memory filtering for zero-latency UI
  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      const matchType = filterType === 'all' || trx.type === filterType;
      const matchCategory =
        selectedCategory === 'all' || String(trx.category_id) === selectedCategory;
      const matchSearch =
        search.trim() === '' ||
        (trx.note?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (trx.categories?.name?.toLowerCase().includes(search.toLowerCase()) ?? false);

      return matchType && matchCategory && matchSearch;
    });
  }, [transactions, filterType, selectedCategory, search]);

  return (
    <div className="space-y-6">
      {/* Header Page */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">Transaksi</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Pencatatan, riwayat, dan pengelolaan transaksi keuangan Anda secara lengkap.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Tambah Transaksi (Left / Top Panel) */}
        <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800/90 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-5">
            <div className="w-2 h-6 bg-indigo-500 rounded-full" />
            <h3 className="text-lg font-bold text-zinc-100">Tambah Transaksi</h3>
          </div>

          <form action={addTransaction} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                name="date"
                defaultValue={todayDate}
                required
                className="w-full bg-zinc-950/70 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Jenis
                </label>
                <select
                  name="type"
                  required
                  className="w-full bg-zinc-950/70 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                >
                  <option value="pengeluaran">Pengeluaran</option>
                  <option value="pemasukan">Pemasukan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Kategori
                </label>
                <select
                  name="category_id"
                  required
                  className="w-full bg-zinc-950/70 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                >
                  <option value="">Pilih...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Nominal (Rp)
              </label>
              <input
                type="number"
                name="amount"
                min="1"
                required
                placeholder="Contoh: 75000"
                className="w-full bg-zinc-950/70 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Catatan / Keterangan
              </label>
              <input
                type="text"
                name="note"
                placeholder="Contoh: Beli kopi, Gaji bulanan"
                className="w-full bg-zinc-950/70 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder:text-zinc-500"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/25 active:scale-[0.99]"
            >
              Simpan Transaksi
            </button>
          </form>
        </div>

        {/* Tabel Riwayat & Filter (Right / Bottom Panel) */}
        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-zinc-100">Riwayat Transaksi</h3>
              <p className="text-xs text-zinc-400">Total {filteredTransactions.length} data ditemukan</p>
            </div>

            {/* Quick Type Filter Tabs */}
            <div className="inline-flex bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterType === 'all'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterType('pemasukan')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterType === 'pemasukan'
                    ? 'bg-emerald-500/20 text-emerald-400 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => setFilterType('pengeluaran')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterType === 'pengeluaran'
                    ? 'bg-rose-500/20 text-rose-400 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Pengeluaran
              </button>
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari catatan atau kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-zinc-950/70 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 transition placeholder:text-zinc-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950/70 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-800/80">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] uppercase tracking-wider text-zinc-400 bg-zinc-950/90 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Catatan</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-zinc-500">
                      Tidak ada transaksi yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((trx) => {
                    const isExpense = trx.type === 'pengeluaran';
                    const dateFormatted = new Date(trx.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });

                    return (
                      <tr key={trx.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">
                          {dateFormatted}
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-zinc-200">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                            {trx.categories?.name || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-300 max-w-[200px] truncate" title={trx.note || ''}>
                          {trx.note || '-'}
                        </td>
                        <td className={`px-4 py-3 text-xs sm:text-sm font-bold text-right whitespace-nowrap ${
                          isExpense ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {isExpense ? '- ' : '+ '}
                          Rp {Number(trx.amount).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Tombol Edit */}
                            <button
                              type="button"
                              onClick={() => setEditingTrx(trx)}
                              aria-label="Edit Transaksi"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 transition"
                              title="Edit Transaksi"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>

                            {/* Tombol Hapus */}
                            <form action={deleteTransaction} onSubmit={(e) => {
                              if (!confirm('Yakin ingin menghapus transaksi ini?')) {
                                e.preventDefault();
                              }
                            }}>
                              <input type="hidden" name="id" value={trx.id} />
                              <button
                                type="submit"
                                aria-label="Hapus Transaksi"
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Hapus Transaksi"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Edit Transaksi */}
      {editingTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
              <h3 className="text-lg font-bold text-zinc-100">Edit Transaksi</h3>
              <button
                type="button"
                onClick={() => setEditingTrx(null)}
                className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateTransaction(formData);
                setEditingTrx(null);
              }}
              className="space-y-4"
            >
              <input type="hidden" name="id" value={editingTrx.id} />

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue={new Date(editingTrx.created_at).toISOString().split('T')[0]}
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Jenis
                  </label>
                  <select
                    name="type"
                    defaultValue={editingTrx.type}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  >
                    <option value="pengeluaran">Pengeluaran</option>
                    <option value="pemasukan">Pemasukan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Kategori
                  </label>
                  <select
                    name="category_id"
                    defaultValue={editingTrx.category_id}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  name="amount"
                  min="1"
                  defaultValue={editingTrx.amount}
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Catatan / Keterangan
                </label>
                <input
                  type="text"
                  name="note"
                  defaultValue={editingTrx.note || ''}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTrx(null)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition active:scale-[0.99]"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
