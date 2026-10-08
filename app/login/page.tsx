import { login, signup } from "./actions";

export default async function LoginPage(props: {
  searchParams: Promise<{ message: string }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900 p-8 shadow-2xl border border-zinc-800">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl mb-4 shadow-lg shadow-indigo-600/30">
            P
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
            PFM Tracker
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400">
            Kelola dan pantau keuangan personal Anda dengan mudah
          </p>
        </div>

        <form className="mt-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700/80 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                placeholder="nama@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700/80 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          {searchParams?.message && (
            <div className="text-xs sm:text-sm font-medium text-rose-400 bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20">
              {searchParams.message}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <button
              formAction={login}
              className="w-full flex justify-center rounded-xl bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-md shadow-indigo-600/25 active:scale-[0.99]"
            >
              Masuk (Sign In)
            </button>
            <button
              formAction={signup}
              className="w-full flex justify-center rounded-xl border border-zinc-700 bg-zinc-950/60 py-2.5 px-4 text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition active:scale-[0.99]"
            >
              Daftar Akun Baru
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
