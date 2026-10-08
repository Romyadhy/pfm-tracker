import { createClient } from '../../utils/supabase/server';
import TransactionView, { Category, Transaction } from './transaction-view';

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  // ponytail: query transactions scoped to user with category join
  const { data: transactions } = await supabase
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

  // ponytail: ensure flat type safety for categories relation
  const normalizedTransactions: Transaction[] = (transactions || []).map((t) => ({
    id: t.id,
    amount: t.amount,
    type: t.type,
    category_id: t.category_id,
    note: t.note,
    created_at: t.created_at,
    categories: Array.isArray(t.categories) ? t.categories[0] : t.categories,
  }));

  return (
    <TransactionView
      transactions={normalizedTransactions}
      categories={(categories || []) as Category[]}
    />
  );
}
