import { supabase } from "../utils/supabase";

export default async function TestConnections() {
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*");

  return (
    <div>
      <h1>Status Koneksi Suppabase</h1>
      {error ? (
        <div>
          <p>Connections Fails</p>
          <p>{error?.message}</p>
        </div>
      ) : (
        <div>
          <p>Connection Successed</p>
        </div>
      )}
	<h2>Current Database</h2>
	<pre>{JSON.stringify(transactions, null, 2)}</pre>
    </div>
  );
}
