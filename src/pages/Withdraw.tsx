import Header from '../components/Header';
import { Clock3, Wallet, Coins, Clipboard, ArrowUpRight, Loader2, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useGlobalConfig } from '../contexts/GlobalConfigContext';
import { toast } from 'react-hot-toast';
import { requestWithdraw } from '../services/userService';
import { useEffect, useState } from 'react';
import { getWithdrawHistory } from '../services/userService';

// Withdraw.tsx
export default function Withdraw() {
  const { user, setUser } = useUser();
  const { config } = useGlobalConfig();
  const [amount, setAmount] = useState('');
  const balance = user?.balance || 0;

  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [showMethods, setShowMethods] = useState(false);

  const defaultWarning = 'Withdrawals are irreversible. Please double-check your details.';
  const [messageBox, setMessageBox] = useState<{ type: 'default' | 'error' | 'success'; text: string }>({
    type: 'default',
    text: defaultWarning,
  });

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (config?.payment_methods?.length > 0 && !selectedMethod) {
      setSelectedMethod(config.payment_methods[0]);
    }
  }, [config, selectedMethod]);

  const loadHistory = async () => {
    try {
      const data = await getWithdrawHistory(user?.telegramId || 0);

      setHistory(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleWithdraw = async () => {
    try {
      if (!walletAddress.trim()) {
        toast.error('Enter wallet address');
        return;
      }

      if (!amount) {
        toast.error('Enter amount');
        return;
      }

      if (!selectedMethod) {
        toast.error('Select a payment method');
        return;
      }

      if (Number(amount) < selectedMethod.min_point) {
        toast.error(`Minimum withdraw is ${selectedMethod.min_point} points`);
        return;
      }

      setLoading(true);
      const result = await requestWithdraw(user?.telegramId || 0, Number(amount), walletAddress, selectedMethod.name);

      // on success, clear backend message and show toast success as before
      setMessageBox({ type: 'default', text: defaultWarning });
      toast.success(result.message);
      await loadHistory();
      setAmount('');
      setWalletAddress('');
      setUser({
        ...user!,
        balance: result.balance,
      });
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      if (backendMessage) {
        // show backend validation/error inside the message box (do not use toast)
        setMessageBox({ type: 'error', text: backendMessage });
      } else {
        // fallback to toast for unexpected errors without backend message
        toast.error(backendMessage || 'Withdraw failed');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <Header title="Withdraw" subtitle="Funds" />
      <div className="h-dvh overflow-y-auto px-2.5 pb-20 pt-[72px] no-scrollbar sm:px-3">
        <div className="rounded-2xl border border-slate-800 bg-[#07111F] p-3 shadow-xl sm:p-4">
          {/* Compact Balance Card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#111827] to-[#07111F] border border-slate-800/50 shadow-inner overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-cyan-500/5 blur-3xl"></div>
            <div className="p-4 sm:p-5 flex items-center justify-between gap-3 relative z-10">
              <div className="min-w-0 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Available Points</p>

                <div className="flex items-baseline gap-1 mt-1">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                    {user?.balance || 0}
                  </h1>
                  <span className="text-xs font-medium text-slate-400 ml-1">PTS</span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-cyan-400"></div>
                  <p className="text-[11px] font-medium text-slate-400">
                    Min Withdraw: <span className="text-white">{selectedMethod?.min_point || 0}</span> Points
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Method selector */}
          <div className="mt-5 relative">
            <label className="mb-2 block text-left text-xs font-bold uppercase tracking-wider text-slate-500">Withdrawal Method</label>

            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowMethods(!showMethods)}
                className={`w-full flex items-center justify-between rounded-xl bg-[#0B121F] border px-4 py-3.5 text-left transition-all duration-200 ${
                  showMethods ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                    selectedMethod ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    {selectedMethod ? <Wallet size={20} /> : <Coins size={20} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white leading-tight">{selectedMethod?.name || 'Select Method'}</span>
                    <span className="text-[11px] font-medium text-slate-500">Instant Processing</span>
                  </div>
                </div>

                <div className={`transition-transform duration-200 ${showMethods ? 'rotate-180 text-cyan-400' : 'text-slate-500'}`}>
                  <ArrowUpRight size={18} className="rotate-45" />
                </div>
              </button>

              {showMethods && config?.payment_methods && (
                <div className="absolute z-50 mt-2 w-full rounded-xl bg-[#0D1525] border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-1">
                    {config.payment_methods.map((m: any) => (
                      <button
                        key={m.name}
                        onClick={() => {
                          setSelectedMethod(m);
                          setShowMethods(false);
                          setMessageBox({ type: 'default', text: defaultWarning });
                        }}
                        className={`w-full px-3 py-3 flex items-center justify-between rounded-lg transition-all duration-150 ${
                          selectedMethod?.name === m.name
                            ? 'bg-cyan-500/10 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 flex items-center justify-center rounded-md border ${
                            selectedMethod?.name === m.name ? 'border-cyan-500/30 bg-cyan-500/20' : 'border-slate-700 bg-slate-800'
                          }`}>
                            <span className="text-[10px] font-bold">{m.name.substring(0, 1)}</span>
                          </div>
                          <div>
                            <div className="text-sm font-bold">{m.name}</div>
                            <div className="text-[10px] font-medium opacity-60">{m.min_point} Pts = {m.amount} TK</div>
                          </div>
                        </div>
                        {selectedMethod?.name === m.name && (
                          <div className="h-5 w-5 flex items-center justify-center rounded-full bg-cyan-500">
                            <CheckCircle size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Wallet */}
          <div className="mt-5">
            <label className="mb-2 block text-left text-xs font-bold uppercase tracking-wider text-slate-500">{selectedMethod?.name || 'Account'} Details</label>
            <div className="group relative">
              <div className="flex items-center rounded-xl bg-[#0B121F] border border-slate-800 px-4 py-3.5 transition-all duration-200 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20">
                <Wallet size={18} className="text-slate-500 mr-3 group-focus-within:text-cyan-400" />
                <input
                  placeholder={selectedMethod?.hint || "Enter payment details"}
                  type="text"
                  value={walletAddress}
                  onChange={(e) => {
                    setWalletAddress(e.target.value);
                    setMessageBox({ type: 'default', text: defaultWarning });
                  }}
                  className="min-w-0 w-full bg-transparent text-sm font-medium text-white placeholder:text-slate-600 outline-none"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setWalletAddress(text || '');
                      setMessageBox({ type: 'default', text: defaultWarning });
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                  className="ml-2 inline-flex items-center rounded-lg px-2.5 py-1.5 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  <Clipboard size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="mt-5">
            <label className="mb-2 block text-left text-xs font-bold uppercase tracking-wider text-slate-500">Amount to Withdraw</label>

            <div className="group relative">
              <div className="w-full rounded-xl bg-[#0B121F] border border-slate-800 px-4 py-3.5 transition-all duration-200 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20">
                <div className="flex items-center gap-2">
                  <Coins size={18} className="text-slate-500 mr-1 group-focus-within:text-cyan-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setMessageBox({ type: 'default', text: defaultWarning });
                    }}
                    placeholder="Enter point amount"
                    className="min-w-0 w-full bg-transparent text-sm font-bold text-white placeholder:text-slate-600 outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setAmount(balance.toString());
                      setMessageBox({ type: 'default', text: defaultWarning });
                    }}
                    className="ml-2 inline-flex items-center rounded-lg px-3 py-1.5 bg-cyan-500/5 text-xs font-bold text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>

            {/* Computed Row - More Professional */}
            <div className="mt-4 rounded-xl bg-slate-900/50 p-3.5 border border-slate-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Conversion Rate</span>
                <span className="text-[11px] font-bold text-slate-300">
                  {selectedMethod ? `${selectedMethod.min_point} Pts = ${selectedMethod.amount} TK` : 'Select method'}
                </span>
              </div>

              <div className="h-px bg-slate-800/50 mb-2"></div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Estimated Payout</span>
                <div className="text-right">
                  <span className="text-lg font-black text-cyan-400">
                    {amount && selectedMethod ? ((Number(amount) / selectedMethod.min_point) * selectedMethod.amount).toFixed(2) : '0.00'}
                  </span>
                  <span className="text-[10px] font-bold text-cyan-500 ml-1.5">TK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning + Submit */}
          <div className="mt-6 flex flex-col gap-4">
            <div
              className={`rounded-xl border p-4 transition-all duration-300 ${
                messageBox.type === 'error'
                  ? 'bg-red-500/5 border-red-500/20 text-red-200'
                  : messageBox.type === 'success'
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200'
                  : 'bg-amber-500/5 border-amber-500/10 text-amber-200/70'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {messageBox.type === 'error' ? (
                    <AlertCircle size={18} className="text-red-400" />
                  ) : messageBox.type === 'success' ? (
                    <CheckCircle size={18} className="text-emerald-400" />
                  ) : (
                    <AlertTriangle size={18} className="text-amber-400/60" />
                  )}
                </div>
                <div className="text-[11px] font-medium leading-relaxed uppercase tracking-wide">
                  {messageBox.text}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleWithdraw}
              disabled={loading}
              className="relative overflow-hidden group h-[56px] w-full rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-white font-black uppercase tracking-tighter text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 shadow-[0_8px_25px_rgba(59,130,246,0.2)]"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-2 z-10">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Processing
                  </>
                ) : (
                  <>
                    Review & Withdraw <ArrowUpRight size={20} />
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-[#07111F] p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Clock3 size={16} className="text-cyan-400" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">History</h3>
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              Showing Recent
            </div>
          </div>

          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/20 py-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600">No Transactions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item._id}
                    className="group relative rounded-xl border border-slate-800 bg-[#0B121F] p-4 transition-all duration-200 hover:border-slate-700 active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 font-black text-xs text-white">
                          {item.method?.substring(0, 1) || 'W'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white leading-none">{item.method || 'Withdraw'}</p>
                          <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">
                            {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white leading-none">-{item.amount}</p>
                        <p className="text-[9px] font-bold text-cyan-500 mt-1 uppercase tracking-widest">PTS</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          item.status === 'pending' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]' :
                          item.status === 'paid' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'bg-red-400'
                        }`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          item.status === 'pending' ? 'text-amber-400' :
                          item.status === 'paid' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 truncate max-w-[150px] font-mono opacity-60">
                        {item.walletAddress}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
