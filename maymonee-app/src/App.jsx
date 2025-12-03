import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // PASTIKAN INSTALL: npm install axios
import { 
  LayoutDashboard, 
  Table, 
  PieChart, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  Plus, 
  Trash2, 
  Save, 
  Filter,
  Wallet,
  Landmark,
  ArrowRight,
  ChevronDown,
  Sparkles,
  MessageSquare,
  Loader2,
  Pencil,
  ArrowUpCircle,
  ArrowDownCircle,
  X,
  Check,
  Coins,
  ArrowRightLeft,
  RefreshCw,
  ShoppingCart,
  Calendar,
  SortAsc,
  SortDesc,
  Search,
  History,
  Globe,
  Repeat, 
  CalendarClock,
  Info,
  DollarSign,
  LogOut,
  User,
  Lock,
  Mail,
  TrendingDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell 
} from 'recharts';

// --- CONFIGURATION ---
const API_BASE_URL = "http://localhost:5000/api";

axios.defaults.baseURL = API_BASE_URL;

// --- Gemini API Configuration (FIXED: Reset to empty string to avoid compilation error) ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const callGemini = async (prompt) => {
  if (!apiKey) return "API Key belum diset. Silakan masukkan API Key di dalam kode.";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!response.ok) { throw new Error(`API Error: ${response.statusText}`); }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, AI sedang sibuk mengatur cashflow. Coba lagi nanti ya!";
  } catch (error) {
    console.error("Gemini API Call Failed:", error);
    return null;
  }
};

// --- UTILS & CONSTANTS ---
const CURRENCIES = {
  IDR: { label: "Rupiah (IDR)", locale: "id-ID", symbol: "Rp" },
  USD: { label: "US Dollar (USD)", locale: "en-US", symbol: "$" },
  AUD: { label: "Australian Dollar (AUD)", locale: "en-AU", symbol: "A$" },
  SGD: { label: "Singapore Dollar (SGD)", locale: "en-SG", symbol: "S$" },
  JPY: { label: "Japanese Yen (JPY)", locale: "ja-JP", symbol: "¥" },
  CNY: { label: "Chinese Yuan (CNY)", locale: "zh-CN", symbol: "¥" },
};

const formatCurrency = (number, currencyCode = 'IDR') => {
  const config = CURRENCIES[currencyCode] || CURRENCIES.IDR;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

const parseCurrency = (stringVal) => {
  if (typeof stringVal === 'number') return stringVal;
  return parseInt(stringVal.toString().replace(/[^0-9]/g, '') || 0);
};

const calculateTotal = (dataObj) => Object.values(dataObj || {}).reduce((a, b) => a + b, 0);

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// --- FALLBACK DATA PENTING (Untuk mencegah crash saat data API kosong) ---
const DEFAULT_CATEGORIES = {
    income: ["Gaji Bulanan", "Lainnya"],
    savings: ["Tabungan Umum"], 
    expenses: ["Makan & Minum", "Lainnya"]
};
// ID 99 digunakan sebagai fallback ID yang akan difilter jika ada akun asli.
const DEFAULT_ACCOUNTS = [{ id: 99, name: "Default Cash (Setup Dulu!)", type: "Cash", balance: 0 }];

const ASSET_TYPES = ["Saham", "Obligasi", "Crypto", "Emas", "Property", "Reksa Dana", "Kendaraan", "Lainnya"];
const LIQUIDITY_TYPES = ["Liquid", "Non-Liquid"];
const COLORS = ['#6EE7B7', '#34D399', '#60A5FA', '#818CF8', '#FBBF24', '#F472B6']; 
const DONUT_COLORS = ['#34D399', '#10B981', '#6EE7B7', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#14B8A6', '#06B6D4', '#EAB308'];
const DAYS_OF_WEEK = [{ id: 0, label: 'Min' }, { id: 1, label: 'Sen' }, { id: 2, label: 'Sel' }, { id: 3, label: 'Rab' }, { id: 4, label: 'Kam' }, { id: 5, label: 'Jum' }, { id: 6, label: 'Sab' }];

// --- SUB COMPONENTS ---

const AuthPage = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const response = await axios.post(endpoint, formData);
      
      const { token, user } = response.data;
      localStorage.setItem('maymonee_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      onLogin(user);
    } catch (error) {
      alert(error.response?.data?.message || "Terjadi kesalahan saat autentikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-8 text-center">
          <div className="bg-white/20 p-3 rounded-2xl w-fit mx-auto mb-4 backdrop-blur-sm">
            <DollarSign className="w-8 h-8 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome to Maymonee.</h1>
          <p className="text-emerald-50 text-sm">Make Your Money Easy</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
            {isRegister ? 'Create Account' : 'Sign In'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="Full Name" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 outline-none text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input type="email" placeholder="Email Address" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 outline-none text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input type="password" placeholder="Password" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 outline-none text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 flex justify-center items-center gap-2">
              {isLoading ? <Loader2 className="animate-spin" size={20}/> : (isRegister ? 'Register' : 'Login')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <button onClick={() => setIsRegister(!isRegister)} className="text-emerald-600 font-bold hover:underline">
              {isRegister ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const InfoBlock = ({ title, children }) => (
  <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-4 mb-6 flex gap-4 items-start text-sm text-emerald-900 shadow-sm backdrop-blur-sm">
    <div className="bg-emerald-100 p-2 rounded-full text-emerald-600"> <Info className="w-5 h-5 flex-shrink-0" /> </div>
    <div className="py-1">
      {title && <p className="font-bold mb-1 text-emerald-800">{title}</p>}
      <div className="text-emerald-700/90 leading-relaxed text-sm">{children}</div>
    </div>
  </div>
);

const BufferedInput = ({ value, onCommit, placeholder, currency }) => {
  const [localValue, setLocalValue] = useState(value === 0 ? "" : formatCurrency(value, currency));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value === 0 ? "" : formatCurrency(value, currency));
    }
  }, [value, isEditing, currency]);

  const handleFocus = () => {
    setIsEditing(true);
    setLocalValue(value === 0 ? "" : value.toString());
  };

  const handleBlur = () => {
    setIsEditing(false);
    const numericVal = parseCurrency(localValue);
    onCommit(numericVal);
    setLocalValue(numericVal === 0 ? "" : formatCurrency(numericVal, currency));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <input 
      type="text" 
      className={`w-full text-right p-2 rounded-lg text-sm bg-transparent outline-none transition-all duration-200 ${isEditing ? 'bg-white ring-2 ring-emerald-300 text-emerald-900 shadow-lg z-10 relative' : 'font-medium text-slate-600 hover:bg-slate-50 focus:bg-white'}`}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder || "0"}
    />
  );
};

const CardStat = ({ title, value, previousValue = 0, color, isSpending = false, currency }) => {
  const diff = value - previousValue;
  const percentage = previousValue !== 0 ? (diff / previousValue) * 100 : (value > 0 ? 100 : 0);
   
  let isPositiveChangeGood = true;
  if (isSpending) isPositiveChangeGood = false;

  const isIncrease = diff >= 0;
  const isGood = isIncrease === isPositiveChangeGood;

  const textColor = isGood ? 'text-emerald-600' : 'text-rose-500';
  const badgeColor = isGood ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100/50 flex flex-col hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${isSpending ? 'text-rose-500' : 'text-emerald-500'}`}>
         {isSpending ? <CreditCard size={60} /> : <Wallet size={60} />}
      </div>
      
      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 z-10">
        <span className={`p-1.5 rounded-lg ${isSpending ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-500'}`}>
            {isSpending ? <CreditCard size={14}/> : <Wallet size={14}/>}
        </span>
        {title}
      </span>
      
      <span className="text-2xl font-bold text-slate-800 mb-2 tracking-tight z-10">{formatCurrency(value, currency)}</span>
      
      <div className={`text-xs font-bold flex items-center gap-2 z-10`}>
         <span className={`px-2 py-0.5 rounded-full ${badgeColor} flex items-center`}>
            {percentage !== 0 ? (<>{percentage > 0 ? <TrendingUp size={10} className="mr-1"/> : <TrendingDown size={10} className="mr-1"/>} {Math.abs(percentage).toFixed(1)}%</>) : '-'}
         </span>
         <span className="text-slate-400 font-medium">vs period lalu</span>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, color }) => (<tr className={color}><td colSpan={13} className="p-3 font-bold text-xs uppercase tracking-wider border-b border-white/20 text-slate-700">{title}</td></tr>);

const BudgetRow = ({ category, type, data, onChange, activeMonth, activeYear, currency }) => (
  <tr className="hover:bg-emerald-50/40 group transition-colors duration-150">
    <td className="p-3 border-b border-slate-100 font-medium text-slate-700 sticky left-0 bg-white group-hover:bg-emerald-50/60 shadow-[4px_0_10px_-3px_rgba(0,0,0,0.05)]">{category}</td>
    {MONTHS.map((_, i) => (<td key={i} className={`p-1 border-b border-slate-100 ${i === activeMonth ? 'bg-emerald-50/60' : ''}`}><BufferedInput value={data[i]?.[type]?.[category] || 0} onCommit={(val) => onChange(activeYear, i, type, category, val)} currency={currency} /></td>))}
  </tr>
);

const TotalRow = ({ label, type, data, color, currency }) => (
  <tr className={color}>
    <td className="p-3 border-b border-slate-200 sticky left-0 bg-inherit shadow-[4px_0_10px_-3px_rgba(0,0,0,0.05)] font-bold text-slate-700">{label}</td>
    {MONTHS.map((_, i) => { const total = Object.values(data[i]?.[type] || {}).reduce((a, b) => a + b, 0); return <td key={i} className="p-3 text-right border-b border-slate-200 text-sm font-bold text-slate-800">{formatCurrency(total, currency)}</td> })}
  </tr>
);

const ProgressBar = ({ label, value, total, color }) => (
  <div className="mb-2">
      <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-600 font-semibold">{label}</span>
          <span className="text-slate-700 font-bold">{total > 0 ? ((value/total)*100).toFixed(1) : 0}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
          <div className={`h-2.5 rounded-full ${color} transition-all duration-700 ease-out`} style={{ width: `${total > 0 ? (value/total)*100 : 0}%` }}></div>
      </div>
  </div>
);

// --- VIEW COMPONENTS ---

const SpendingView = ({ 
    categories: propCategories, 
    accounts: propAccounts, 
    transactions, 
    setTransactions, 
    setAccounts, 
    realizedIncome, 
    realizedSpending,
    filters,
    setFilters,
    currency,
    recurringTransactions,
    setRecurringTransactions
}) => {
    // --- SAFEGUARDS ---
    const categories = propCategories.income && propCategories.income.length > 0 ? propCategories : DEFAULT_CATEGORIES;
    const accounts = propAccounts && propAccounts.length > 0 ? propAccounts : DEFAULT_ACCOUNTS;
    
    // Fallback logic check if categories/accounts exist before indexing
    const safeCategoriesExpense = categories.expenses && categories.expenses.length > 0 ? categories.expenses : ['Lainnya'];
    const safeAccountsList = accounts && accounts.length > 0 ? accounts : DEFAULT_ACCOUNTS;

    const initialCategory = safeCategoriesExpense[0] || 'Lainnya';
    const initialAccountId = safeAccountsList[0].id; // Guaranteed to exist (id: 99 or real ID)


    // State & Handlers
    const [isInputOpen, setIsInputOpen] = useState(false);
    const [isRecurringManagerOpen, setIsRecurringManagerOpen] = useState(false);
    const [editingTx, setEditingTx] = useState(null); 
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [aiInput, setAiInput] = useState("");
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const [transactionType, setTransactionType] = useState('expense');
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurFrequency, setRecurFrequency] = useState('daily'); 
    const [recurDays, setRecurDays] = useState([]); 
    const [recurDates, setRecurDates] = useState([]); 

    const [formData, setFormData] = useState({ 
        date: new Date().toISOString().split('T')[0], 
        description: "", 
        category: initialCategory, 
        accountId: initialAccountId, 
        amount: "" 
    });

    const activeCategories = transactionType === 'expense' ? categories.expenses : categories.income;

    // IMPORTANT FIX: Ensure form category updates safely when type changes
    useEffect(() => { 
       const newDefaultCategory = activeCategories[0] || 'Lainnya';
       // Only update if not editing to prevent overwriting saved data
       if (!editingTx) {
          setFormData(prev => ({ ...prev, category: newDefaultCategory })); 
       }
    }, [transactionType, categories, editingTx]);


    const resetForm = () => {
        setFormData({ 
            date: new Date().toISOString().split('T')[0], 
            description: "", 
            category: initialCategory, 
            accountId: initialAccountId, 
            amount: "" 
        });
        setAiInput("");
        setTransactionType('expense');
        setIsRecurring(false);
        setRecurFrequency('daily');
        setRecurDays([]);
        setRecurDates([]);
    };

    const handleCloseModal = () => {
        setIsInputOpen(false);
        setEditingTx(null);
        setDeleteConfirmOpen(false);
        resetForm();
    };

    const openEditModal = (tx) => {
       setEditingTx(tx);
       setTransactionType(tx.type);
       setFormData({
          date: tx.date,
          description: tx.description,
          category: tx.category,
          accountId: tx.accountId,
          amount: tx.amount
       });
       setAiInput(""); 
       setIsInputOpen(true);
    };

    const handleAIParse = async () => {
       if(!aiInput.trim()) return;
       setIsProcessingAI(true);
       const prompt = `Extract transaction details from Indonesian text: "${aiInput}". Context: Income Cats: ${categories.income.join(', ')}, Expense Cats: ${categories.expenses.join(', ')}, Accounts: ${accounts.map(a => a.name).join(', ')}. Return JSON only (no markdown): { "date": "YYYY-MM-DD", "description": "string", "type": "income"|"expense", "category": "string", "amount": number, "accountName": "string" }`;
       try {
         let resultText = await callGemini(prompt);
         if (!resultText) throw new Error("No response from AI");
         resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
         const parsed = JSON.parse(resultText);
         const matchedAccount = accounts.find(a => a.name.toLowerCase().includes(parsed.accountName?.toLowerCase()) || parsed.accountName?.toLowerCase().includes(a.name.toLowerCase())) || safeAccountsList.find(a => a.id !== 99) || safeAccountsList[0];
         
         setTransactionType(parsed.type === 'income' ? 'income' : 'expense');
         setFormData({ 
             date: parsed.date || new Date().toISOString().split('T')[0], 
             description: parsed.description || aiInput, 
             category: parsed.category || (parsed.type === 'income' ? categories.income[0] : categories.expenses[0]), 
             amount: parsed.amount || 0, 
             accountId: matchedAccount.id 
         });
         setAiInput("");
       } catch (e) { 
           console.error(e); 
           alert("Gagal memproses AI. Pastikan API Key valid atau coba kalimat lain.");
       } finally { 
           setIsProcessingAI(false); 
       }
    };

    const handleFormSubmit = (e) => {
      e.preventDefault();
      const amountVal = parseCurrency(formData.amount);

      // GUARD: Prevent transaction input if user hasn't set up real accounts/categories
      if (propAccounts.length === 0 || propCategories.income.length === 0) {
          alert("Harap buat minimal satu Akun dan Kategori di tab Setup sebelum mencatat transaksi!");
          return;
      }

      if (isRecurring) {
          const newRule = {
              id: Date.now(),
              ...formData,
              amount: amountVal,
              type: transactionType,
              accountId: parseInt(formData.accountId),
              recurFrequency,
              recurDays,
              recurDates,
              active: true,
              isRecurringRule: true
          };
          setRecurringTransactions(prev => [...prev, newRule]);
          alert("Transaksi rutin berhasil dijadwalkan!");
      } else if (editingTx) {
         setAccounts(prev => prev.map(acc => { 
             if(acc.id === editingTx.accountId) { 
                 return { ...acc, balance: editingTx.type === 'income' ? acc.balance - editingTx.amount : acc.balance + editingTx.amount }; 
             } 
             return acc; 
         }));
         setTransactions(prev => prev.map(t => t.id === editingTx.id ? { ...t, ...formData, type: transactionType, accountId: parseInt(formData.accountId), amount: amountVal } : t));
         setAccounts(prev => prev.map(acc => { 
             if(acc.id === parseInt(formData.accountId)) { 
                 return { ...acc, balance: transactionType === 'income' ? acc.balance + amountVal : acc.balance - amountVal }; 
             } 
             return acc; 
         }));
      } else {
         const newTx = { id: Date.now(), date: formData.date, description: formData.description, category: formData.category, amount: amountVal, accountId: parseInt(formData.accountId), type: transactionType };
         setTransactions([...transactions, newTx]);
         setAccounts(prev => prev.map(acc => { if(acc.id === newTx.accountId) { return { ...acc, balance: transactionType === 'income' ? acc.balance + newTx.amount : acc.balance - newTx.amount }; } return acc; }));
      }
      handleCloseModal();
    };

    const handleDeleteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (!editingTx) return;
        setAccounts(prev => prev.map(acc => { 
             if(acc.id === editingTx.accountId) { 
                 return { ...acc, balance: editingTx.type === 'income' ? acc.balance - editingTx.amount : acc.balance + editingTx.amount }; 
             } 
             return acc; 
        }));
        setTransactions(prev => prev.filter(t => t.id !== editingTx.id));
        handleCloseModal();
    };

    const cancelDelete = (e) => {
        e.preventDefault();
        setDeleteConfirmOpen(false);
    }

    const deleteRecurringRule = (id) => {
        if(window.confirm("Hentikan dan hapus transaksi rutin ini?")) {
            setRecurringTransactions(prev => prev.filter(r => r.id !== id));
        }
    };

    const toggleRecurDay = (dayId) => {
        setRecurDays(prev => prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]);
    };

    const toggleRecurDate = (date) => {
        setRecurDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
    };

    const getFilteredTransactions = () => {
        let filtered = [...transactions];
        const now = new Date();
        if (filters.dateRange !== 'all') {
            filtered = filtered.filter(t => {
                const d = new Date(t.date);
                if (filters.dateRange === 'today') return d.toDateString() === now.toDateString();
                if (filters.dateRange === '7days') { const s = new Date(); s.setDate(now.getDate() - 7); return d >= s; }
                if (filters.dateRange === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                if (filters.dateRange === 'year') return d.getFullYear() === now.getFullYear();
                return true;
            });
        }
        if (filters.category !== 'all') filtered = filtered.filter(t => t.category === filters.category);
        if (filters.account !== 'all') filtered = filtered.filter(t => t.accountId === parseInt(filters.account));
        filtered.sort((a, b) => filters.sort === 'asc' ? a.amount - b.amount : b.amount - a.amount);
        return filtered;
    };

    const filteredTx = getFilteredTransactions();
    const allCategories = [...new Set([...categories.income, ...categories.expenses])];

    return (
      <div className="space-y-6 relative animate-fadeIn">
        <div className="bg-gradient-to-r from-emerald-100 to-teal-50 p-6 rounded-3xl border border-emerald-100 flex justify-between items-center shadow-sm backdrop-blur-sm">
          <div><h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2"><CreditCard className="w-7 h-7 text-emerald-600" /> Money Moves Tracker</h2></div>
          <div className="text-right hidden md:block"><p className="text-xs font-bold text-emerald-800/60 uppercase tracking-widest">Saldo Bulan Ini</p><div className="flex gap-4"><span className="text-emerald-700 font-bold tracking-tight">+ {formatCurrency(realizedIncome, currency)}</span><span className="text-rose-600 font-bold tracking-tight">- {formatCurrency(realizedSpending, currency)}</span></div></div>
        </div>

        {propAccounts.length === 0 && (
            <InfoBlock title="SETUP DULU, BESTIE!">
                Anda belum memiliki Akun atau Kategori. Silakan pergi ke tab **Setup** untuk menambahkan akun Bank/Dompet dan Kategori Pemasukan/Pengeluaran agar bisa mencatat transaksi!
            </InfoBlock>
        )}

        <InfoBlock title="💡 Quick Tip">
           Gunakan tombol <b>"Input Jajan"</b> untuk pencatatan manual, atau <b>"Auto-Pay"</b> untuk tagihan bulanan (Netflix, Kost, dll) biar otomatis. Semua data tersimpan aman di database server Anda.
        </InfoBlock>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-white shadow-sm sticky top-20 z-20">
            <div className="flex gap-3 w-full md:w-auto">
                <button onClick={() => { setEditingTx(null); setIsInputOpen(true); }} className="flex-1 md:flex-none bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 hover:scale-105 transition-all flex items-center justify-center gap-2"><Plus size={20} /> Input Jajan</button>
                <button onClick={() => setIsRecurringManagerOpen(true)} className="flex-none bg-white text-emerald-700 px-5 py-3 rounded-2xl font-bold border border-emerald-100 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow-sm" title="Atur Transaksi Rutin"><CalendarClock size={20} /> Auto-Pay</button>
            </div>
            <div className="flex flex-wrap gap-2 items-center w-full md:w-auto justify-end">
                <div className="relative group">
                    <select value={filters.dateRange} onChange={(e) => setFilters({...filters, dateRange: e.target.value})} className="appearance-none bg-white border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-emerald-400 outline-none cursor-pointer hover:bg-slate-50 transition-all shadow-sm"><option value="all">Semua Waktu</option><option value="today">Hari Ini</option><option value="7days">7 Hari Terakhir</option><option value="month">Bulan Ini</option><option value="year">Tahun Ini</option></select>
                    <Calendar className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={16} />
                </div>
                <div className="relative">
                    <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})} className="appearance-none bg-white border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-emerald-400 outline-none cursor-pointer hover:bg-slate-50 max-w-[160px] transition-all shadow-sm"><option value="all">Semua Kategori</option>{allCategories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    <Filter className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={16} />
                </div>
                <div className="relative">
                    <select value={filters.account} onChange={(e) => setFilters({...filters, account: e.target.value})} className="appearance-none bg-white border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-emerald-400 outline-none cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                        <option value="all">Semua Akun</option>
                        {accounts.filter(a => a.id !== 99).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <Wallet className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={16} />
                </div>
            </div>
        </div>

        {/* Recurring Manager Modal */}
        {isRecurringManagerOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fadeIn">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] scale-100 transition-transform">
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
                         <h3 className="font-bold text-emerald-900 text-lg flex items-center gap-2"><Repeat size={20} className="text-emerald-600"/> Auto-Pay Manager</h3>
                         <button onClick={() => setIsRecurringManagerOpen(false)} className="bg-white p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm"><X size={20} /></button>
                      </div>
                      <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
                         {recurringTransactions.length > 0 ? (
                            <div className="space-y-3">
                                {recurringTransactions.map(rule => (
                                    <div key={rule.id} className="border border-emerald-100 rounded-2xl p-4 flex justify-between items-center bg-white shadow-sm hover:shadow-md transition-all hover:border-emerald-300">
                                        <div>
                                            <p className="font-bold text-slate-800">{rule.description}</p>
                                            <p className="text-xs text-slate-500 capitalize font-medium mt-0.5">{rule.type} • {rule.category} • {formatCurrency(rule.amount, currency)}</p>
                                            <div className="mt-2 flex gap-1 flex-wrap">
                                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold capitalize tracking-wide">{rule.recurFrequency === 'daily' ? 'Setiap Hari' : rule.recurFrequency === 'weekly' ? 'Mingguan' : 'Bulanan'}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteRecurringRule(rule.id)} className="bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 p-2.5 rounded-xl transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                                <div className="bg-white p-6 rounded-full mb-4 shadow-sm border border-slate-100"><CalendarClock size={40} className="text-emerald-200"/></div>
                                <p className="font-medium text-slate-600">Belum ada transaksi rutin.</p>
                                <p className="text-xs mt-2 text-slate-400 max-w-[200px]">Tambahkan lewat menu "Input Jajan" & centang opsi rutin.</p>
                            </div>
                        )}
                      </div>
                </div>
            </div>
        )}

        {/* Input/Edit Modal */}
        {isInputOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fadeIn">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
                        <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                            {editingTx ? <Pencil size={20} className="text-emerald-500"/> : <Plus size={20} className="text-emerald-500"/>}
                            {editingTx ? 'Edit Data' : 'Catat Pengeluaran'}
                        </h3>
                        <button onClick={handleCloseModal} className="bg-white p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all shadow-sm"><X size={20} /></button>
                    </div>
                    
                    {deleteConfirmOpen ? (
                         <div className="p-10 flex flex-col items-center text-center justify-center h-full animate-fadeIn">
                            <div className="bg-rose-50 p-6 rounded-full text-rose-500 mb-6 ring-8 ring-rose-50/50">
                                <Trash2 size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Hapus Transaksi?</h3>
                            <p className="text-slate-500 mb-8 text-sm">Tindakan ini gabisa dibatalin. Saldo akun bakal balik kayak semula.</p>
                            <div className="flex gap-4 w-full">
                                <button onClick={cancelDelete} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors">Gajadi</button>
                                <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-rose-500 font-bold text-white hover:bg-rose-600 shadow-lg shadow-rose-200 transition-colors">Ya, Hapus</button>
                            </div>
                         </div>
                    ) : (
                        <div className="p-6 overflow-y-auto bg-white">
                            {/* AI Input moved here, only visible if NOT editing */}
                            {!editingTx && (
                                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-5 rounded-2xl border border-indigo-100 mb-6 relative overflow-hidden group">
                                    <div className="absolute -right-6 -top-6 bg-white/40 w-32 h-32 rounded-full blur-2xl group-hover:bg-white/60 transition-all"></div>
                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2"><Sparkles size={16} className="text-amber-400 fill-amber-400" /> AI Magic Input</h4>
                                    </div>
                                    <p className="text-xs text-indigo-800/70 mb-4 relative z-10 leading-relaxed">
                                        Males ngetik form? Ketik aja kayak curhat. <br/>
                                        Contoh: <span className="italic font-medium">"Tadi beli kopi kenangan 25rb pake gopay"</span>
                                    </p>
                                    <div className="flex gap-2 relative z-10">
                                        <input type="text" value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAIParse()} placeholder="Ketik di sini..." className="flex-1 text-sm p-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-300 outline-none bg-white/90 shadow-sm" />
                                        <button onClick={handleAIParse} disabled={isProcessingAI || !aiInput} className="bg-indigo-600 text-white px-5 rounded-xl font-bold text-xs hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-200">
                                            {isProcessingAI ? <Loader2 size={16} className="animate-spin" /> : 'Proses'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleFormSubmit} className="space-y-5">
                                {/* Type Toggle */}
                                {!editingTx && (
                                    <div className="flex rounded-2xl bg-slate-100 p-1.5 mb-6">
                                        <button type="button" onClick={() => setTransactionType('expense')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${transactionType === 'expense' ? 'bg-white text-rose-500 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}><ArrowUpCircle size={18} /> Pengeluaran</button>
                                        <button type="button" onClick={() => setTransactionType('income')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${transactionType === 'income' ? 'bg-white text-emerald-500 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}><ArrowDownCircle size={18} /> Pemasukan</button>
                                    </div>
                                )}
                                
                                {editingTx ? (
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm text-slate-600 grid grid-cols-2 gap-y-3 gap-x-4">
                                            <div><span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5 tracking-wider">Tanggal</span><p className="font-bold text-slate-800">{formData.date}</p></div>
                                            <div><span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5 tracking-wider">Tipe</span><p className="capitalize font-bold text-slate-800">{transactionType}</p></div>
                                            <div><span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5 tracking-wider">Kategori</span><p className="font-bold text-slate-800">{formData.category}</p></div>
                                            <div><span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5 tracking-wider">Akun</span><p className="font-bold text-slate-800">{accounts.find(a => a.id === parseInt(formData.accountId))?.name}</p></div>
                                        </div>
                                        <div><label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Nominal ({CURRENCIES[currency].symbol})</label><input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-emerald-200 outline-none bg-slate-50 focus:bg-white transition-colors font-bold text-slate-700" /></div>
                                        <div><label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Deskripsi</label><input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-emerald-200 outline-none bg-slate-50 focus:bg-white transition-colors" /></div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Input Fields */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div><label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Tanggal</label><input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-200 outline-none bg-slate-50 focus:bg-white transition-colors" /></div>
                                            <div><label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Nominal</label><input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-200 outline-none bg-slate-50 focus:bg-white transition-colors font-bold text-slate-700" /></div>
                                        </div>
                                        <div><label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Deskripsi</label><input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Cth: Makan Siang" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-200 outline-none bg-slate-50 focus:bg-white transition-colors" /></div>
                                        
                                        {/* Selectors with Guards */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Kategori</label>
                                                <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none cursor-pointer">
                                                    {activeCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Akun</label>
                                                <select required value={formData.accountId} onChange={e => setFormData({...formData, accountId: parseInt(e.target.value)})} className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none cursor-pointer">
                                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Recurring Options */}
                                        <div className="pt-6 border-t border-slate-100">
                                            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer" onClick={() => setIsRecurring(!isRecurring)}>
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isRecurring ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
                                                    {isRecurring && <Check size={14} className="text-white" />}
                                                </div>
                                                <label className="text-sm font-bold text-slate-600 flex items-center gap-2 cursor-pointer select-none"><Repeat size={16} className="text-emerald-500"/> Bikin jadi rutin (Auto-input)</label>
                                            </div>
                                            
                                            {isRecurring && (
                                                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-4 animate-fadeIn">
                                                    <div>
                                                        <label className="block text-xs font-bold text-emerald-800 mb-2">Seberapa sering?</label>
                                                        <div className="flex gap-2">
                                                            {['daily', 'weekly', 'monthly'].map(freq => (
                                                                <button key={freq} type="button" onClick={() => setRecurFrequency(freq)} className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all duration-200 ${recurFrequency === freq ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>{freq === 'daily' ? 'Tiap Hari' : freq === 'weekly' ? 'Mingguan' : 'Bulanan'}</button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {recurFrequency === 'weekly' && (
                                                        <div>
                                                            <label className="block text-xs font-bold text-emerald-800 mb-2">Pilih Hari</label>
                                                            <div className="flex gap-2 flex-wrap">
                                                                {DAYS_OF_WEEK.map(day => (
                                                                    <button key={day.id} type="button" onClick={() => toggleRecurDay(day.id)} className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center transition-all ${recurDays.includes(day.id) ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 transform scale-105' : 'bg-white text-emerald-600 border border-emerald-200 hover:border-emerald-400'}`}>{day.label[0]}</button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {recurFrequency === 'monthly' && (
                                                        <div>
                                                            <label className="block text-xs font-bold text-emerald-800 mb-2">Pilih Tanggal</label>
                                                            <div className="flex gap-1.5 flex-wrap max-h-32 overflow-y-auto">
                                                                {Array.from({length: 31}, (_, i) => i + 1).map(date => (
                                                                    <button key={date} type="button" onClick={() => toggleRecurDate(date)} className={`w-8 h-8 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${recurDates.includes(date) ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white text-emerald-600 border border-emerald-200 hover:border-emerald-400'}`}>{date}</button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
                                    {editingTx && (
                                        <button type="button" onClick={handleDeleteClick} className="bg-rose-50 text-rose-500 px-5 py-3.5 rounded-xl font-bold hover:bg-rose-100 hover:text-rose-600 transition-all flex items-center justify-center" title="Hapus Transaksi"><Trash2 size={20} /></button>
                                    )}
                                    <button type="submit" className={`flex-1 font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all text-white transform active:scale-95 flex items-center justify-center gap-2 ${transactionType === 'income' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'}`}>
                                        <Check size={20}/>
                                        {editingTx ? 'Update Data' : (isRecurring ? 'Simpan Jadwal Rutin' : 'Simpan Transaksi')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                        <th className="p-5 text-left font-bold w-32 uppercase text-xs tracking-wider">Tanggal</th>
                        <th className="p-5 text-left font-bold uppercase text-xs tracking-wider">Deskripsi</th>
                        <th className="p-5 text-left font-bold w-40 uppercase text-xs tracking-wider">Kategori</th>
                        <th className="p-5 text-left font-bold w-40 uppercase text-xs tracking-wider">Akun</th>
                        <th className="p-5 text-right font-bold w-40 cursor-pointer hover:bg-slate-100 transition-colors group uppercase text-xs tracking-wider" onClick={() => setFilters({...filters, sort: filters.sort === 'asc' ? 'desc' : 'asc'})}>
                            <div className="flex items-center justify-end gap-1">
                                Total
                                {filters.sort === 'asc' ? <SortAsc size={14} className="text-emerald-500"/> : <SortDesc size={14} className="text-emerald-500"/>}
                            </div>
                        </th>
                        <th className="p-5 w-20 text-center uppercase text-xs tracking-wider">Edit</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {filteredTx.length > 0 ? (
                        filteredTx.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/80 group transition-colors duration-200">
                            <td className="p-5 text-slate-500 whitespace-nowrap text-xs font-semibold">{tx.date}</td>
                            <td className="p-5 font-bold text-slate-700 text-sm">{tx.description}</td>
                            <td className="p-5"><span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs border border-slate-200 font-bold">{tx.category}</span></td>
                            <td className="p-5 text-slate-500 text-xs font-semibold">{accounts.find(a => a.id === tx.accountId)?.name}</td>
                            <td className={`p-5 text-right font-bold text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                            </td>
                            <td className="p-5 text-center">
                                <button 
                                    onClick={() => openEditModal(tx)} 
                                    className="text-slate-400 hover:text-emerald-600 transition-colors bg-white border border-slate-200 hover:border-emerald-200 p-2 rounded-lg shadow-sm hover:shadow-md"
                                    title="Edit Transaksi"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="p-16 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="bg-slate-50 p-6 rounded-full"><Search size={40} className="text-slate-300"/></div>
                                    <div>
                                        <p className="font-bold text-slate-600 text-lg">Wah sepi nih...</p>
                                        <p className="text-sm">Belum ada transaksi yang sesuai filter kamu.</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    );
};

const BudgetingSummary = ({ monthIncomeTotal, monthSavingsTotal, monthExpenseBudgetTotal, categories, getBudgetTotal, activeBudgetYear, selectedMonth, currency }) => {
    const expenseAllocation = categories.expenses.map(cat => ({ name: cat, value: getBudgetTotal('expenses', cat, activeBudgetYear, selectedMonth), type: 'Expense' }));
    const savingsAllocation = categories.savings.map(cat => ({ name: cat, value: getBudgetTotal('savings', cat, activeBudgetYear, selectedMonth), type: 'Savings' }));
    const budgetAllocationData = [...savingsAllocation, ...expenseAllocation].filter(d => d.value > 0);
    const CustomDonutTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        const data = payload[0];
        const total = budgetAllocationData.reduce((acc, curr) => acc + curr.value, 0);
        const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
        return (<div className="bg-white p-4 border border-slate-100 shadow-xl rounded-2xl text-sm"><p className="font-bold text-slate-800 mb-1 text-base">{data.name}</p><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${data.payload.type === 'Savings' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{data.payload.type}</span><p className="text-slate-600 mt-2 font-bold">{formatCurrency(data.value, currency)} <span className="text-slate-400 font-normal ml-1">({percent}%)</span></p></div>);
      }
      return null;
    };
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="flex justify-between items-start mb-8 relative z-10">
                  <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2"><Wallet className="w-7 h-7 text-emerald-500" /> Money Goals & Allocation</h2>
                  <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-100">{activeBudgetYear}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl text-white shadow-xl shadow-emerald-200 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all duration-500"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-800/20 rounded-full blur-3xl -ml-10 -mb-10 group-hover:bg-teal-800/30 transition-all duration-500"></div>
                      
                      <h3 className="text-emerald-100 text-sm font-bold mb-2 flex items-center gap-2 uppercase tracking-wider"><ArrowUpCircle size={16}/> Total Income Plan</h3>
                      <div className="text-4xl font-bold tracking-tight mb-6">{formatCurrency(monthIncomeTotal, currency)}</div>
                      <div className="flex gap-2 text-xs font-medium">
                          <span className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">Manifesting Wealth ✨</span>
                      </div>
                  </div>
                  
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col justify-center">
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Distribusi Cuan</h3>
                      <div className="space-y-6">
                          <ProgressBar label="Future You (Tabungan)" value={monthSavingsTotal} total={monthIncomeTotal} color="bg-emerald-500" />
                          <ProgressBar label="Living Cost (Kebutuhan)" value={monthExpenseBudgetTotal} total={monthIncomeTotal} color="bg-rose-500" />
                      </div>
                  </div>
              </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
              <div className="w-full flex justify-between items-center mb-6">
                  <h3 className="text-slate-700 font-bold flex items-center gap-2 text-lg"><PieChart size={20} className="text-emerald-500" /> Allocation Breakdown</h3>
              </div>
              <div className="w-full h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                          <Pie data={budgetAllocationData} dataKey="value" innerRadius={70} outerRadius={90} paddingAngle={4} cornerRadius={6} startAngle={90} endAngle={-270}>
                              {budgetAllocationData.map((entry, index) => (<Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} stroke="none" />))}
                          </Pie>
                          <Tooltip content={<CustomDonutTooltip />} />
                      </RePieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-bold text-slate-800">{budgetAllocationData.length}</span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kategori</span>
                  </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto w-full px-2">
                  {[...budgetAllocationData].reverse().map((entry, index) => { 
                      const originalIndex = budgetAllocationData.length - 1 - index; 
                      return (
                          <div key={entry.name} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 hover:bg-slate-100 transition-colors cursor-default">
                              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: DONUT_COLORS[originalIndex % DONUT_COLORS.length] }}></div>
                              <span className="truncate max-w-[100px]">{entry.name}</span>
                          </div>
                      ); 
                  })}
              </div>
          </div>
      </div>
    );
};

const BudgetingSection = ({ categories, budgetData, handleBudgetChange, selectedMonth, budgetYear, setBudgetYear, availableYears, currency }) => {
    const scrollContainerRef = useRef(null);
    useEffect(() => { if (scrollContainerRef.current) { const activeHeader = document.getElementById(`month-col-${selectedMonth}`); if (activeHeader) { const container = scrollContainerRef.current; const offsetLeft = activeHeader.offsetLeft; container.scrollTo({ left: offsetLeft - 200, behavior: 'smooth' }); } } }, []); 
    const currentYearData = budgetData[budgetYear] || {};
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div>
                  <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-2"><Table className="w-6 h-6 text-emerald-600" /> All Year Budgeting</h2>
                  <p className="text-sm text-emerald-800/60 mt-1 font-medium">Isi rencana keuangan tahunan lo di sini biar gak boncos.</p>
              </div>
              <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-emerald-100 shadow-sm">
                  <span className="text-xs font-bold text-emerald-800 uppercase pl-2">Tahun:</span>
                  <select value={budgetYear} onChange={(e) => setBudgetYear(parseInt(e.target.value))} className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm rounded-lg px-4 py-2 font-bold focus:ring-2 focus:ring-[#A5FFD6] outline-none cursor-pointer hover:bg-emerald-100 transition-colors">{availableYears.map(y => <option key={y} value={y}>{y}</option>)}</select>
              </div>
          </div>
          
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
               <InfoBlock>
                  <b>Cara pakai:</b> Klik angka di tabel buat edit budget. Scroll ke kanan buat liat bulan-bulan selanjutnya. Pastiin "SISA (Cashflow)" di bawah tetep ijo ya!
               </InfoBlock>
          </div>

          <div ref={scrollContainerRef} className="overflow-auto flex-1">
              <table className="w-full border-collapse min-w-[1200px]">
                  <thead className="bg-slate-50 sticky top-0 z-20 shadow-sm">
                      <tr>
                          <th className="p-5 text-left border-b border-slate-200 min-w-[200px] bg-slate-50 font-bold text-slate-500 uppercase text-xs tracking-wider sticky left-0 z-30 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">Kategori</th>
                          {MONTHS.map((m, i) => (
                              <th key={i} id={`month-col-${i}`} className={`p-5 text-right border-b border-slate-200 min-w-[150px] font-bold text-xs uppercase tracking-wider ${i === selectedMonth ? 'bg-emerald-100/50 text-emerald-800 border-b-emerald-400' : 'text-slate-400'}`}>
                                  {m.substring(0, 3)}
                              </th>
                          ))}
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      <SectionHeader title="SUMBER PEMASUKAN 💰" color="bg-orange-50/50 text-orange-800" />
                      {categories.income.map(cat => <BudgetRow key={cat} category={cat} type="income" data={currentYearData} onChange={handleBudgetChange} activeMonth={selectedMonth} activeYear={budgetYear} currency={currency} />)}
                      <TotalRow label="Total Income" type="income" data={currentYearData} color="bg-orange-50/80 font-bold text-orange-900" currency={currency} />
                      
                      <SectionHeader title="TARGET TABUNGAN 🏦" color="bg-teal-50/50 text-teal-800" />
                      {categories.savings.map(cat => <BudgetRow key={cat} category={cat} type="savings" data={currentYearData} onChange={handleBudgetChange} activeMonth={selectedMonth} activeYear={budgetYear} currency={currency} />)}
                      <TotalRow label="Total Savings" type="savings" data={currentYearData} color="bg-teal-50/80 font-bold text-teal-900" currency={currency} />
                      
                      <SectionHeader title="RENCANA JAJAN & TAGIHAN 💸" color="bg-rose-50/50 text-rose-800" />
                      {categories.expenses.map(cat => <BudgetRow key={cat} category={cat} type="expenses" data={currentYearData} onChange={handleBudgetChange} activeMonth={selectedMonth} activeYear={budgetYear} currency={currency} />)}
                      <TotalRow label="Total Spending" type="expenses" data={currentYearData} color="bg-rose-50/80 font-bold text-rose-900" currency={currency} />
                      
                      <tr className="bg-slate-900 text-white font-bold sticky bottom-0 z-10 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
                          <td className="p-5 border-t border-slate-700 sticky left-0 bg-slate-900 z-30 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.5)]">SISA (Cashflow)</td>
                          {MONTHS.map((_, i) => { 
                              const income = calculateTotal(currentYearData[i]?.income); 
                              const savings = calculateTotal(currentYearData[i]?.savings); 
                              const expenses = calculateTotal(currentYearData[i]?.expenses); 
                              const bal = income - savings - expenses; 
                              return <td key={i} className={`p-5 text-right border-t border-slate-700 ${bal < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{formatCurrency(bal, currency)}</td> 
                          })}
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>
    );
};

const DashboardView = ({ showYearly, setShowYearly, selectedYear, setSelectedYear, selectedMonth, setSelectedMonth, availableYears, realizedIncome, realizedSpending, monthSavingsTotal, currentCashflow, prevPeriodData, budgetData, transactions, categories, getBudgetTotal, getCategoryRealization, currency }) => {
    const [aiInsight, setAiInsight] = useState("");
    const [loadingInsight, setLoadingInsight] = useState(false);
    const [trendView, setTrendView] = useState('monthly'); 
    useEffect(() => { setTrendView(showYearly ? 'monthly' : '30days'); }, [showYearly]);
    const generateInsight = async () => { setLoadingInsight(true); const prompt = `Berikan analisis finansial singkat, santai, dan memotivasi ala Gen Z (panggil pengguna dengan "Bestie") untuk ${showYearly ? 'Tahun' : 'Bulan'} ini. Data: Income: ${formatCurrency(realizedIncome, currency)}, Spending: ${formatCurrency(realizedSpending, currency)}, Savings: ${formatCurrency(monthSavingsTotal, currency)}, Cashflow: ${formatCurrency(currentCashflow, currency)}`; const result = await callGemini(prompt); setAiInsight(result); setLoadingInsight(false); };
    const getTrendData = () => { if (trendView === 'yearly') { const startYear = selectedYear - 4; const yearsToShow = Array.from({length: 5}, (_, i) => startYear + i); return yearsToShow.map(year => { const yearlyBudgetIncome = Object.values(budgetData[year] || {}).reduce((acc, month) => acc + calculateTotal(month.income), 0); const yearlyBudgetExpense = Object.values(budgetData[year] || {}).reduce((acc, month) => acc + calculateTotal(month.expenses), 0); const yearTx = transactions.filter(t => new Date(t.date).getFullYear() === year); const yearlyRealizedIncome = yearTx.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0); const yearlyRealizedExpense = yearTx.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0); return { name: year.toString(), BudgetIncome: yearlyBudgetIncome, RealizedIncome: yearlyRealizedIncome, BudgetExpense: yearlyBudgetExpense, RealizedExpense: yearlyRealizedExpense }; }); } else if (trendView === 'monthly') { return MONTHS.map((m, idx) => { const monthlyBudgetIncome = calculateTotal(budgetData[selectedYear]?.[idx]?.income); const monthlyBudgetExpense = calculateTotal(budgetData[selectedYear]?.[idx]?.expenses); const monthTx = transactions.filter(t => { const d = new Date(t.date); return d.getFullYear() === selectedYear && d.getMonth() === idx; }); return { name: m.substring(0, 3), BudgetIncome: monthlyBudgetIncome, RealizedIncome: monthTx.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0), BudgetExpense: monthlyBudgetExpense, RealizedExpense: monthTx.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0), }; }); } else { const days = trendView === '7days' ? 7 : 30; const data = []; for (let i = days - 1; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const dateStr = d.toISOString().split('T')[0]; const displayDate = `${d.getDate()}/${d.getMonth()+1}`; const dayTx = transactions.filter(t => t.date === dateStr); data.push({ name: displayDate, BudgetIncome: 0, RealizedIncome: dayTx.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0), BudgetExpense: 0, RealizedExpense: dayTx.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0), }); } return data; } };
    const trendData = getTrendData();
    const incomeDistributionData = categories.income.map(cat => ({ name: cat, value: getCategoryRealization(cat, 'income') })).filter(d => d.value > 0);
    const expenseDistributionData = categories.expenses.map(cat => ({ name: cat, value: getCategoryRealization(cat, 'expense') })).filter(d => d.value > 0);
    const CustomDonutTooltip = ({ active, payload }) => { if (active && payload && payload.length) { const data = payload[0]; const total = categories.income.includes(data.name) ? realizedIncome : realizedSpending; const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0; return (<div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl text-sm"><p className="font-bold text-slate-800">{data.name}</p><p className="text-slate-600 font-medium mt-1">{formatCurrency(data.value, currency)} <span className="text-slate-400 ml-1">({percent}%)</span></p></div>); } return null; };

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/50">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><LayoutDashboard className="w-7 h-7 text-emerald-500" /> {showYearly ? 'Annual Recap' : 'Monthly Vibe Check'}</h2>
          <div className="flex gap-3 items-center flex-wrap justify-end">
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#A5FFD6] cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">{availableYears.map(y => <option key={y} value={y}>{y}</option>)}</select>
            {!showYearly && (<select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 text-emerald-800 font-bold text-sm outline-none focus:ring-2 focus:ring-[#A5FFD6] cursor-pointer hover:bg-emerald-100 transition-colors shadow-sm">{MONTHS.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}</select>)}
            <button onClick={() => setShowYearly(!showYearly)} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all border shadow-sm ${showYearly ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{showYearly ? 'View Monthly' : 'View Yearly'}</button>
          </div>
        </div>
        
        {/* AI Section with Glassmorphism */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-1.5 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden backdrop-blur-sm">
            <div className="bg-white/60 p-6 rounded-[20px] relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-emerald-900 font-bold flex items-center gap-2 text-lg"><Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" /> Your Financial Bestie (AI)</h3>
                    <button onClick={generateInsight} disabled={loadingInsight} className="bg-emerald-500 text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg shadow-emerald-200 hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-70 disabled:scale-100 hover:bg-emerald-600">
                        {loadingInsight ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />} {loadingInsight ? "Thinking..." : "Spill Tea ☕"}
                    </button>
                </div>
                {aiInsight ? (
                    <div className="text-sm text-slate-700 bg-white/80 p-5 rounded-2xl border border-white/50 leading-relaxed shadow-inner">
                        {aiInsight}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-slate-400 italic bg-white/40 p-3 rounded-xl w-fit">
                        <Info size={16} />
                        <p className="text-sm">Klik "Spill Tea" buat dapet review keuangan dari AI bestie kamu...</p>
                    </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <CardStat title={`Income (${showYearly ? 'YTD' : 'MTD'})`} value={realizedIncome} previousValue={prevPeriodData.income} color="bg-emerald-500" currency={currency} />
            <CardStat title={`Savings (${showYearly ? 'YTD' : 'MTD'})`} value={monthSavingsTotal} previousValue={prevPeriodData.savings} color="bg-blue-500" currency={currency} />
            <CardStat title={`Spending (${showYearly ? 'YTD' : 'MTD'})`} value={realizedSpending} previousValue={prevPeriodData.spending} color="bg-rose-500" isSpending currency={currency} />
            <CardStat title="Cashflow (Sisa)" value={currentCashflow} previousValue={prevPeriodData.cashflow} color="bg-emerald-500" currency={currency} />
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                <h3 className="text-slate-700 font-bold flex items-center gap-2 text-lg"><TrendingUp size={24} className="text-emerald-500" /> Financial Trends</h3>
                <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1 border border-slate-100">
                    {!showYearly ? (<><button onClick={() => setTrendView('7days')} className={`px-4 py-2 text-xs rounded-xl font-bold transition-all duration-200 ${trendView === '7days' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-700'}`}>7 Hari</button><button onClick={() => setTrendView('30days')} className={`px-4 py-2 text-xs rounded-xl font-bold transition-all duration-200 ${trendView === '30days' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-700'}`}>30 Hari</button></>) : (<><button onClick={() => setTrendView('monthly')} className={`px-4 py-2 text-xs rounded-xl font-bold transition-all duration-200 ${trendView === 'monthly' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-700'}`}>Bulanan</button><button onClick={() => setTrendView('yearly')} className={`px-4 py-2 text-xs rounded-xl font-bold transition-all duration-200 ${trendView === 'yearly' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-700'}`}>5 Tahun</button></>)}
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="h-80">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 ml-2">Trend Pemasukan</h4>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} dy={10} tick={{fill: '#94a3b8', fontWeight: 500}} />
                            <YAxis fontSize={11} tickFormatter={(val) => `${(val/1000000).toFixed(1)}M`} tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontWeight: 500}} />
                            <Tooltip formatter={(val) => formatCurrency(val, currency)} contentStyle={{borderRadius: '16px', border:'none', boxShadow:'0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold', padding: '12px'}} />
                            {(trendView === 'monthly' || trendView === 'yearly') && <Line type="monotone" dataKey="BudgetIncome" name="Budget" stroke="#cbd5e1" strokeWidth={2} dot={false} strokeDasharray="5 5" animationDuration={1500} />}
                            <Line type="monotone" dataKey="RealizedIncome" name="Realisasi" stroke="#10b981" strokeWidth={4} activeDot={{ r: 8, strokeWidth: 0, fill: '#059669' }} dot={{r: 0}} isAnimationActive={true} animationDuration={1500} animationEasing="ease-in-out" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="h-80">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 ml-2">Trend Pengeluaran</h4>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} dy={10} tick={{fill: '#94a3b8', fontWeight: 500}} />
                            <YAxis fontSize={11} tickFormatter={(val) => `${(val/1000000).toFixed(1)}M`} tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontWeight: 500}} />
                            <Tooltip formatter={(val) => formatCurrency(val, currency)} contentStyle={{borderRadius: '16px', border:'none', boxShadow:'0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold', padding: '12px'}} />
                            {(trendView === 'monthly' || trendView === 'yearly') && <Line type="monotone" dataKey="BudgetExpense" name="Budget" stroke="#cbd5e1" strokeWidth={2} dot={false} strokeDasharray="5 5" animationDuration={1500} />}
                            <Line type="monotone" dataKey="RealizedExpense" name="Realisasi" stroke="#f43f5e" strokeWidth={4} activeDot={{ r: 8, strokeWidth: 0, fill: '#e11d48' }} dot={{r: 0}} isAnimationActive={true} animationDuration={1500} animationEasing="ease-in-out" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-700 font-bold mb-6 flex items-center gap-2 text-lg"><PieChart size={20} className="text-emerald-500"/> Income Sources</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie data={incomeDistributionData} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={4} cornerRadius={6}>
                                    {incomeDistributionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />))}
                                </Pie>
                                <Tooltip content={<CustomDonutTooltip />} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize:'12px', fontWeight: '600', color: '#64748b'}} iconType="circle" />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-orange-50 text-orange-900 p-5 font-bold flex justify-between border-b border-orange-100 items-center">
                        <span>Pemasukan Breakdown</span>
                        <span className="text-[10px] bg-white border border-orange-200 px-3 py-1 rounded-full text-orange-700">{showYearly ? selectedYear : `${MONTHS[selectedMonth]} ${selectedYear}`}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                                <tr><th className="p-4 text-left pl-6">Kategori</th><th className="p-4 text-right">Budget</th><th className="p-4 text-right pr-6">Realisasi</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {categories.income.map((cat, idx) => { 
                                    const budget = getBudgetTotal('income', cat); 
                                    const realized = getCategoryRealization(cat, 'income'); 
                                    if (budget === 0 && realized === 0) return null; 
                                    return (
                                        <tr key={idx} className="hover:bg-orange-50/30 transition-colors">
                                            <td className="p-4 pl-6 font-bold text-slate-700">{cat}</td>
                                            <td className="p-4 text-right text-slate-400 font-medium">{formatCurrency(budget, currency)}</td>
                                            <td className="p-4 text-right pr-6 text-emerald-600 font-bold">{formatCurrency(realized, currency)}</td>
                                        </tr>
                                    ) 
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-700 font-bold mb-6 flex items-center gap-2 text-lg"><PieChart size={20} className="text-rose-500"/> Where did money go?</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie data={expenseDistributionData} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={4} cornerRadius={6}>
                                    {expenseDistributionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} stroke="none" />))}
                                </Pie>
                                <Tooltip content={<CustomDonutTooltip />} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize:'12px', fontWeight: '600', color: '#64748b'}} iconType="circle" />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-emerald-600 text-white p-5 font-bold flex justify-between items-center shadow-md">
                        <span>Pengeluaran Breakdown</span>
                        <span className="text-[10px] bg-emerald-700 px-3 py-1 rounded-full text-emerald-100">{showYearly ? selectedYear : `${MONTHS[selectedMonth]} ${selectedYear}`}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-emerald-50 text-emerald-900 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="p-4 text-left pl-6">Kategori</th>
                                    <th className="p-4 text-right">Budget</th>
                                    <th className="p-4 text-right">Realisasi</th>
                                    <th className="p-4 text-center">Bar</th>
                                    <th className="p-4 text-right pr-6">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {categories.expenses.map((cat, idx) => { 
                                    const budget = getBudgetTotal('expenses', cat); 
                                    const realized = getCategoryRealization(cat, 'expense'); 
                                    const pct = budget > 0 ? (realized / budget) * 100 : 0; 
                                    if (budget === 0 && realized === 0) return null; 
                                    return (
                                        <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                                            <td className="p-4 pl-6 font-bold text-slate-700">{cat}</td>
                                            <td className="p-4 text-right text-slate-400 font-medium">{formatCurrency(budget, currency)}</td>
                                            <td className="p-4 text-right text-rose-600 font-bold">{formatCurrency(realized, currency)}</td>
                                            <td className="p-4 w-24 px-2">
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div className={`h-2 rounded-full ${pct>100?'bg-rose-500':'bg-emerald-400'}`} style={{width:`${Math.min(pct,100)}%`}}></div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-bold text-slate-600 text-xs pr-6">{pct.toFixed(0)}%</td>
                                        </tr>
                                    ) 
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
};

const AssetsView = ({ assets, accounts, setAssets, setAccounts, setTransactions, transactions, currency }) => {
    // FIX: Ensure safe account access
    const safeAccountsList = accounts && accounts.length > 0 ? accounts : DEFAULT_ACCOUNTS;
    const initialAccountId = safeAccountsList[0].id;
    const initialTargetId = safeAccountsList.length > 1 ? safeAccountsList[1].id : initialAccountId;


    const [isAddingAsset, setIsAddingAsset] = useState(false);
    const [newAssetForm, setNewAssetForm] = useState({ name: "", category: ASSET_TYPES[0], liquidity: LIQUIDITY_TYPES[0], currentPrice: "", quantity: "", unit: "unit" });
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [transferForm, setTransferForm] = useState({ fromId: initialAccountId, toId: initialTargetId, amount: "" });
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [buyForm, setBuyForm] = useState({ name: "", category: ASSET_TYPES[0], liquidity: LIQUIDITY_TYPES[0], price: "", qty: "", accountId: initialAccountId, unit: "lembar" });
    const [sellModalOpen, setSellModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [sellForm, setSellForm] = useState({ qty: "", targetAccountId: initialAccountId });
    const [viewMutation, setViewMutation] = useState(null);

    const accountsDisplay = accounts.filter(a => a.id !== 99); // Accounts excluding fallback
    const totalAssets = assets.reduce((acc, curr) => acc + curr.value, 0);
    const liquidAssets = assets.filter(a => a.liquidity === "Liquid").reduce((acc, curr) => acc + curr.value, 0);
    const nonLiquidAssets = assets.filter(a => a.liquidity === "Non-Liquid").reduce((acc, curr) => acc + curr.value, 0);
    const assetPieData = assets.reduce((acc, curr) => {
        const existing = acc.find(item => item.name === curr.category);
        if (existing) { existing.value += curr.value; } else { acc.push({ name: curr.category, value: curr.value }); }
        return acc;
    }, []);

    const totalCashflow = accounts.reduce((acc, curr) => acc + curr.balance, 0);
    const bankTotal = accounts.filter(a => a.type === 'Bank').reduce((acc, curr) => acc + curr.balance, 0);
    const cashTotal = accounts.filter(a => a.type === 'Cash').reduce((acc, curr) => acc + curr.balance, 0);
    const eWalletTotal = accounts.filter(a => a.type === 'E-Wallet').reduce((acc, curr) => acc + curr.balance, 0);
    const cashflowPieData = [{ name: 'Bank', value: bankTotal }, { name: 'Cash', value: cashTotal }, { name: 'E-Wallet', value: eWalletTotal }].filter(d => d.value > 0);
    const CASHFLOW_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

    // Handlers (using parseCurrency for input safety)
    const handleTransfer = () => {
      const amount = parseCurrency(transferForm.amount);
      if (!amount || amount <= 0) return alert("Jumlah transfer tidak valid");
      if (parseInt(transferForm.fromId) === parseInt(transferForm.toId)) return alert("Akun asal dan tujuan tidak boleh sama");
      const fromAccount = accounts.find(a => a.id === parseInt(transferForm.fromId));
      if (!fromAccount || fromAccount.balance < amount) return alert("Saldo tidak mencukupi atau akun tidak valid!");
       
      setAccounts(prev => prev.map(acc => {
        if (acc.id === parseInt(transferForm.fromId)) return { ...acc, balance: acc.balance - amount };
        if (acc.id === parseInt(transferForm.toId)) return { ...acc, balance: acc.balance + amount };
        return acc;
      }));
       
      const transferDate = new Date().toISOString().split('T')[0];
      const fromAccName = accounts.find(a => a.id === parseInt(transferForm.fromId))?.name;
      const toAccName = accounts.find(a => a.id === parseInt(transferForm.toId))?.name;

      const newTxOut = { id: Date.now(), date: transferDate, description: `Transfer ke ${toAccName}`, category: "Transfer Keluar", amount: amount, accountId: parseInt(transferForm.fromId), type: 'expense' };
      const newTxIn = { id: Date.now() + 1, date: transferDate, description: `Transfer dari ${fromAccName}`, category: "Transfer Masuk", amount: amount, accountId: parseInt(transferForm.toId), type: 'income' };

      setTransactions(prev => [...prev, newTxOut, newTxIn]);
      setTransferModalOpen(false); setTransferForm({ fromId: initialAccountId, toId: initialTargetId, amount: "" });
    };

    const handleAddAsset = () => {
       const qty = parseFloat(newAssetForm.quantity) || 0;
       const price = parseFloat(newAssetForm.currentPrice) || 0;
       if (!newAssetForm.name || qty <= 0) return alert("Mohon isi nama dan kuantitas.");
       setAssets([...assets, { id: Date.now(), name: newAssetForm.name, category: newAssetForm.category, liquidity: newAssetForm.liquidity, quantity: qty, unit: newAssetForm.unit, currentPrice: price, value: qty * price }]);
       setIsAddingAsset(false); setNewAssetForm({ name: "", category: ASSET_TYPES[0], liquidity: LIQUIDITY_TYPES[0], currentPrice: "", quantity: "", unit: "unit" });
    };

    const handleBuyAsset = () => {
        const price = parseFloat(buyForm.price) || 0; 
        const qty = parseFloat(buyForm.qty) || 0; 
        const totalCost = price * qty; 
        const accountId = parseInt(buyForm.accountId);

        if (!buyForm.name || totalCost <= 0 || !accountId) return alert("Mohon lengkapi data pembelian.");
        const sourceAcc = accounts.find(a => a.id === accountId);
        if (!sourceAcc || sourceAcc.balance < totalCost) return alert("Saldo tidak mencukupi!");
        
        setAccounts(prev => prev.map(acc => acc.id === accountId ? { ...acc, balance: acc.balance - totalCost } : acc));
        const existingAsset = assets.find(a => a.name.toLowerCase() === buyForm.name.toLowerCase());
        if (existingAsset) {
            setAssets(prev => prev.map(a => a.id === existingAsset.id ? { ...a, quantity: a.quantity + qty, currentPrice: price, value: (a.quantity + qty) * price } : a));
        } else {
            setAssets(prev => [...prev, { id: Date.now(), name: buyForm.name, category: buyForm.category, liquidity: buyForm.liquidity, quantity: qty, unit: buyForm.unit, currentPrice: price, value: totalCost }]);
        }
        setTransactions(prev => [...prev, { id: Date.now(), date: new Date().toISOString().split('T')[0], description: `Investasi: Beli ${buyForm.name}`, category: "Investasi", amount: totalCost, accountId: accountId, type: 'expense' }]);
        setBuyModalOpen(false); setBuyForm({ name: "", category: ASSET_TYPES[0], liquidity: LIQUIDITY_TYPES[0], price: "", qty: "", accountId: initialAccountId, unit: "lembar" });
    };

    const handleSellAsset = () => {
       if (!selectedAsset || !sellForm.qty || !sellForm.targetAccountId) return;
       const sellQty = parseFloat(sellForm.qty) || 0; 
       const targetAccId = parseInt(sellForm.targetAccountId); 
       const saleValue = sellQty * selectedAsset.currentPrice;

       if (sellQty <= 0) return alert("Jumlah jual harus lebih dari 0.");
       if (sellQty > selectedAsset.quantity) return alert("Jumlah yang dijual melebihi aset yang dimiliki!");
       
       if (sellQty === selectedAsset.quantity) { setAssets(assets.filter(a => a.id !== selectedAsset.id)); } else { setAssets(assets.map(a => a.id === selectedAsset.id ? { ...a, quantity: a.quantity - sellQty, value: (a.quantity - sellQty) * a.currentPrice } : a)); }
       setAccounts(accounts.map(a => a.id === targetAccId ? { ...a, balance: a.balance + saleValue } : a));
       setTransactions([...transactions, { id: Date.now(), date: new Date().toISOString().split('T')[0], description: `Capital Gain: Jual ${selectedAsset.name}`, category: "Investasi", amount: saleValue, accountId: targetAccId, type: 'income' }]);
       setSellModalOpen(false); setSellForm({ qty: "", targetAccountId: initialAccountId }); setSelectedAsset(null);
    };

    const openSellModal = (asset) => { setSelectedAsset(asset); setSellForm({ qty: "", targetAccountId: initialAccountId }); setSellModalOpen(true); };

    const CustomAssetTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percent = ((data.value / totalAssets) * 100).toFixed(1);
            return (
                <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl text-sm">
                    <p className="font-bold text-slate-800">{data.name}</p>
                    <p className="text-slate-600 font-medium mt-1">{formatCurrency(data.value, currency)} <span className="text-slate-400 ml-1">({percent}%)</span></p>
                </div>
            );
        }
        return null;
    };

    return (
       <div className="space-y-6 relative animate-fadeIn">
          {transferModalOpen && accountsDisplay.length >= 2 && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"><div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm animate-fadeIn border border-white/60"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6"><RefreshCw className="text-emerald-500" /> Transfer Dana</h3><div className="space-y-5"><div><label className="text-xs font-bold text-slate-500 mb-2 ml-1">Dari Akun</label><select className="w-full border border-slate-200 rounded-xl p-3.5 text-sm bg-slate-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer" value={transferForm.fromId} onChange={(e) => setTransferForm({...transferForm, fromId: e.target.value})}>{accountsDisplay.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance, currency)})</option>)}</select></div><div className="flex justify-center -my-3 relative z-10"><div className="bg-white p-1.5 rounded-full text-emerald-500 border border-slate-100 shadow-sm"><ArrowDownCircle size={24} /></div></div><div><label className="text-xs font-bold text-slate-500 mb-2 ml-1">Ke Akun</label><select className="w-full border border-slate-200 rounded-xl p-3.5 text-sm bg-slate-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer" value={transferForm.toId} onChange={(e) => setTransferForm({...transferForm, toId: e.target.value})}>{accountsDisplay.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance, currency)})</option>)}</select></div><div><label className="text-xs font-bold text-slate-500 mb-2 ml-1">Nominal</label><input type="number" placeholder="0" className="w-full border border-slate-200 rounded-xl p-3.5 text-sm bg-slate-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-emerald-200 font-bold text-slate-700" value={transferForm.amount} onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}/></div><div className="flex gap-3 pt-2"><button onClick={handleTransfer} className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-transform active:scale-95">Transfer</button><button onClick={() => setTransferModalOpen(false)} className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">Batal</button></div></div></div></div>)}
          {buyModalOpen && accountsDisplay.length > 0 && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"><div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md animate-fadeIn border border-white/60"><div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ShoppingCart className="text-emerald-500" /> Beli Investasi Baru</h3><button onClick={() => setBuyModalOpen(false)} className="bg-white p-2 rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm"><X size={20} /></button></div><div className="space-y-4"><input className="w-full border border-slate-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200" placeholder="Nama Aset (Misal: BBCA, Emas)" value={buyForm.name} onChange={e => setBuyForm({...buyForm, name: e.target.value})} /><div className="flex gap-4"><select className="w-1/2 border border-slate-200 rounded-xl p-3.5 text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer" value={buyForm.category} onChange={e => setBuyForm({...buyForm, category: e.target.value})}>{ASSET_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select><select className="w-1/2 border border-slate-200 rounded-xl p-3.5 text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer" value={buyForm.liquidity} onChange={e => setBuyForm({...buyForm, liquidity: e.target.value})}>{LIQUIDITY_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div><div className="flex gap-4"><input type="number" className="w-1/2 border border-slate-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200" placeholder="Harga/Unit" value={buyForm.price} onChange={e => setBuyForm({...buyForm, price: e.target.value})} /><div className="w-1/2 flex gap-2"><input type="number" className="w-2/3 border border-slate-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200" placeholder="Jml" value={buyForm.qty} onChange={e => setBuyForm({...buyForm, qty: e.target.value})} /><input className="w-1/3 border border-slate-200 rounded-xl p-3.5 text-sm text-center outline-none focus:ring-2 focus:ring-emerald-200" placeholder="Unit" value={buyForm.unit} onChange={e => setBuyForm({...buyForm, unit: e.target.value})} /></div></div><div><label className="text-xs font-bold text-slate-500 mb-2 ml-1">Bayar Pakai Akun</label><select className="w-full border border-slate-200 rounded-xl p-3.5 text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer" value={buyForm.accountId} onChange={e => setBuyForm({...buyForm, accountId: e.target.value})}>{accountsDisplay.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance, currency)})</option>)}</select></div><div className="bg-emerald-50 p-4 rounded-xl text-right"><span className="text-xs text-emerald-600 block font-bold uppercase mb-1">Total Pembelian</span><span className="text-2xl font-bold text-emerald-700 tracking-tight">{formatCurrency((parseFloat(buyForm.price)||0) * (parseFloat(buyForm.qty)||0), currency)}</span></div><button onClick={handleBuyAsset} className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-transform active:scale-95">Konfirmasi Pembelian</button></div></div></div>)}
          {sellModalOpen && selectedAsset && accountsDisplay.length > 0 && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"><div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md animate-fadeIn border border-white/60"><div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Coins className="text-amber-500" /> Jual Aset / Take Profit</h3><button onClick={() => setSellModalOpen(false)} className="bg-white p-2 rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm"><X size={20} /></button></div><div className="space-y-5"><div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-600 border border-slate-200"><p className="font-bold text-slate-800 text-lg mb-2">{selectedAsset.name}</p><p className="mb-1">Harga Pasar: <span className="font-mono font-bold text-slate-800">{formatCurrency(selectedAsset.currentPrice, currency)} / {selectedAsset.unit}</span></p><p>Dimiliki: <span className="font-mono font-bold text-slate-800">{selectedAsset.quantity} {selectedAsset.unit}</span></p></div><div><label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Jumlah Dijual</label><input type="number" autoFocus className="w-full border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-amber-200 outline-none font-bold text-slate-700" value={sellForm.qty} onChange={(e) => setSellForm({...sellForm, qty: e.target.value})} /></div><div className="p-4 bg-amber-50 rounded-xl text-right"><span className="text-xs text-amber-700 block font-bold uppercase mb-1">Estimasi Cuan (Masuk Rekening)</span><span className="text-2xl font-bold text-amber-700 tracking-tight">{formatCurrency((parseFloat(sellForm.qty) || 0) * selectedAsset.currentPrice, currency)}</span></div><div><label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Masuk ke Akun</label><select className="w-full border border-slate-200 rounded-xl p-3.5 text-sm bg-white focus:ring-2 focus:ring-amber-200 outline-none cursor-pointer" value={sellForm.targetAccountId} onChange={(e) => setSellForm({...sellForm, targetAccountId: e.target.value})}>{accountsDisplay.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}</select></div><button onClick={handleSellAsset} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-200 transition-transform active:scale-95">Konfirmasi Penjualan</button></div></div></div>)}

          {/* Mutation Detail Modal */}
          {viewMutation && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fadeIn">
                  <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                                  <History size={24} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-800 text-lg">Mutasi Rekening</h3>
                                  <p className="text-xs text-slate-500 font-bold mt-0.5">{viewMutation.name}</p>
                              </div>
                          </div>
                          <button onClick={() => setViewMutation(null)} className="bg-white p-2 rounded-full text-slate-400 hover:text-slate-600 shadow-sm transition-all hover:bg-slate-200"><X size={20} /></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                          {transactions.filter(t => t.accountId === viewMutation.id).length > 0 ? (
                              transactions.filter(t => t.accountId === viewMutation.id).sort((a,b) => new Date(b.date) - new Date(a.date)).map(tx => (
                                  <div key={tx.id} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                      <div>
                                          <p className="font-bold text-slate-700 text-sm mb-1">{tx.description}</p>
                                          <p className="text-xs text-slate-400 font-medium">{tx.date} • <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">{tx.category}</span></p>
                                      </div>
                                      <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                                      </span>
                                  </div>
                              ))
                          ) : (
                              <div className="text-center py-12 text-slate-400">
                                  <div className="bg-white p-4 rounded-full inline-block mb-3 shadow-sm"><History size={32} className="opacity-30"/></div>
                                  <p>Belum ada transaksi</p>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          )}

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100 flex flex-col md:flex-row justify-between items-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="flex-1 relative z-10">
                  <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2"><Wallet className="w-7 h-7 text-blue-600" /> Cashflow Tracker</h2>
                  <p className="text-blue-700/60 text-sm font-bold mb-6">Posisi uang kamu saat ini (Liquid)</p>
                  <div className="flex gap-4 mt-2 flex-wrap">
                      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm min-w-[150px] border border-white/60"><p className="text-xs text-blue-800 uppercase font-bold tracking-wider mb-1">Total Cash</p><p className="text-xl font-bold text-blue-900 tracking-tight">{formatCurrency(totalCashflow, currency)}</p></div>
                      <div className="bg-white/60 p-4 rounded-2xl shadow-sm min-w-[130px]"><p className="text-xs text-blue-600 uppercase font-bold mb-1">Bank</p><p className="text-lg font-bold text-blue-700">{formatCurrency(bankTotal, currency)}</p></div>
                      <div className="bg-white/60 p-4 rounded-2xl shadow-sm min-w-[130px]"><p className="text-xs text-emerald-600 uppercase font-bold mb-1">Cash</p><p className="text-lg font-bold text-emerald-700">{formatCurrency(cashTotal, currency)}</p></div>
                      <div className="bg-white/60 p-4 rounded-2xl shadow-sm min-w-[130px]"><p className="text-xs text-amber-600 uppercase font-bold mb-1">E-Wallet</p><p className="text-lg font-bold text-amber-700">{formatCurrency(eWalletTotal, currency)}</p></div>
                  </div>
              </div>
              <div className="mt-8 md:mt-0 w-56 h-40 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                          <Pie data={cashflowPieData} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={5} cornerRadius={6}>
                              {cashflowPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={CASHFLOW_COLORS[index % CASHFLOW_COLORS.length]} stroke="none" />))}
                          </Pie>
                          <Tooltip formatter={(value) => `${((value/totalCashflow)*100).toFixed(1)}%`} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      </RePieChart>
                  </ResponsiveContainer>
              </div>
          </div>
           
          {/* Status Akun & Rekening Section - Updated to be clickable */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                <h3 className="text-xl font-bold text-slate-800">Your Accounts</h3>
                <button onClick={() => setTransferModalOpen(true)} disabled={accountsDisplay.length < 2} className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                    <RefreshCw size={14} /> Pindahin Saldo
                </button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {accountsDisplay.map(acc => (
                 <div key={acc.id} onClick={() => setViewMutation(acc)} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex justify-between items-center hover:shadow-lg hover:shadow-slate-100 hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors mb-1">{acc.type}</p>
                      <p className="font-bold text-slate-800 text-lg">{acc.name}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-slate-700 font-bold text-lg tracking-tight">{formatCurrency(acc.balance, currency)}</p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1 group-hover:text-blue-500 font-bold transition-colors">Cek Mutasi <ArrowRight size={12}/></p>
                   </div>
                 </div>
               ))}
                {accountsDisplay.length === 0 && (
                    <div className="col-span-full p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
                        <p className="text-sm text-slate-500 font-semibold">Tidak ada akun terdaftar. Tambahkan di tab Setup.</p>
                    </div>
                )}
             </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-3xl border border-amber-100 flex flex-col md:flex-row justify-between items-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -ml-20 -mt-20"></div>
              <div className="flex-1 relative z-10">
                  <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2"><Landmark className="w-7 h-7 text-amber-600" /> Flex & Assets Tracker</h2>
                  <p className="text-amber-800/60 text-sm font-bold mb-6">Harta karun masa depan lo ✨</p>
                  <div className="flex gap-4 mt-2 flex-wrap">
                      <div className="bg-white/80 p-4 rounded-2xl shadow-sm min-w-[150px] border border-white/60 backdrop-blur-sm"><p className="text-xs text-amber-800 uppercase font-bold tracking-wider mb-1">Total Net Worth</p><p className="text-xl font-bold text-amber-900 tracking-tight">{formatCurrency(totalAssets, currency)}</p></div>
                      <div className="bg-white/60 p-4 rounded-2xl shadow-sm min-w-[130px]"><p className="text-xs text-emerald-800 uppercase font-bold mb-1">Liquid</p><p className="text-lg font-bold text-emerald-700">{formatCurrency(liquidAssets, currency)}</p></div>
                      <div className="bg-white/60 p-4 rounded-2xl shadow-sm min-w-[130px]"><p className="text-xs text-amber-700 uppercase font-bold mb-1">Non-Liquid</p><p className="text-lg font-bold text-amber-700">{formatCurrency(nonLiquidAssets, currency)}</p></div>
                  </div>
              </div>
              <div className="mt-8 md:mt-0 w-56 h-40 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                          <Pie data={assetPieData} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={5} cornerRadius={6}>
                              {assetPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} stroke="none" />))}
                          </Pie>
                          <Tooltip content={<CustomAssetTooltip />} />
                      </RePieChart>
                  </ResponsiveContainer>
              </div>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center">
                  <span className="text-lg">List Aset & Investasi</span>
                  <div className="flex gap-3">
                      {accountsDisplay.length > 0 && (<button onClick={() => setBuyModalOpen(true)} className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-600 flex items-center gap-2 shadow-lg shadow-emerald-200 transition-transform active:scale-95"><ShoppingCart size={16} /> Beli Aset</button>)}
                      <button onClick={() => setIsAddingAsset(true)} className="bg-white text-emerald-600 border border-emerald-200 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-50 flex items-center gap-2 shadow-sm transition-transform active:scale-95"><Plus size={16} /> Manual</button>
                  </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                          <tr><th className="p-5 text-left">Nama Aset</th><th className="p-5 text-left">Tipe</th><th className="p-5 text-left">Likuiditas</th><th className="p-5 text-right">Harga Pasar</th><th className="p-5 text-right">Jumlah</th><th className="p-5 text-right">Total Nilai</th><th className="p-5 text-center">Aksi</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {assets.length > 0 ? (
                            assets.map(asset => (
                              <tr key={asset.id} className="hover:bg-amber-50/40 group text-slate-700 transition-colors">
                                  <td className="p-5 font-bold">{asset.name}</td>
                                  <td className="p-5"><span className="bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">{asset.category}</span></td>
                                  <td className="p-5"><span className={`px-3 py-1 rounded-lg text-xs font-bold ${asset.liquidity === 'Liquid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{asset.liquidity}</span></td>
                                  <td className="p-5 text-right"><input type="number" className="w-32 text-right border border-slate-200 bg-slate-50 rounded-lg px-2 py-1 text-xs focus:bg-white focus:ring-2 focus:ring-amber-200 outline-none transition-colors" value={asset.currentPrice} onChange={(e) => { const price = parseFloat(e.target.value) || 0; setAssets(assets.map(a => a.id === asset.id ? { ...a, currentPrice: price, value: price * a.quantity } : a)); }} /></td>
                                  <td className="p-5 text-right font-medium">{asset.quantity} {asset.unit}</td>
                                  <td className="p-5 text-right font-bold text-slate-800">{formatCurrency(asset.value, currency)}</td>
                                  <td className="p-5 text-center">
                                      {accountsDisplay.length > 0 && (<button onClick={() => openSellModal(asset)} className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors flex items-center justify-center gap-2 mx-auto"><ArrowRightLeft size={14} /> Jual</button>)}
                                      {accountsDisplay.length === 0 && <span className='text-xs text-rose-500 font-bold'>No Account</span>}
                                  </td>
                              </tr>
                          ))) : (
                              <tr>
                                  <td colSpan="7" className="p-12 text-center text-slate-400">
                                      <Landmark size={40} className="mx-auto opacity-30 mb-3" />
                                      <p className="text-lg font-bold text-slate-600">Belum ada aset terdaftar.</p>
                                      <p className="text-sm">Ayo mulai investasi atau masukkan aset Anda secara manual!</p>
                                  </td>
                              </tr>
                          )}
                          {isAddingAsset && (
                              <tr className="bg-emerald-50/50 animate-fadeIn">
                                  <td className="p-3"><input autoFocus className="w-full border border-emerald-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-300 outline-none" placeholder="Nama Aset" value={newAssetForm.name} onChange={e => setNewAssetForm({...newAssetForm, name: e.target.value})} /></td>
                                  <td className="p-3"><select className="w-full border border-emerald-200 rounded-lg px-2 py-2 text-xs bg-white focus:ring-2 focus:ring-emerald-300 outline-none cursor-pointer" value={newAssetForm.category} onChange={e => setNewAssetForm({...newAssetForm, category: e.target.value})}>{ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></td>
                                  <td className="p-3"><select className="w-full border border-emerald-200 rounded-lg px-2 py-2 text-xs bg-white focus:ring-2 focus:ring-emerald-300 outline-none cursor-pointer" value={newAssetForm.liquidity} onChange={e => setNewAssetForm({...newAssetForm, liquidity: e.target.value})}>{LIQUIDITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></td>
                                  <td className="p-3"><input type="number" className="w-full border border-emerald-200 rounded-lg px-3 py-2 text-xs text-right focus:ring-2 focus:ring-emerald-300 outline-none" placeholder="Harga Satuan" value={newAssetForm.currentPrice} onChange={e => setNewAssetForm({...newAssetForm, currentPrice: e.target.value})} /></td>
                                  <td className="p-3 flex gap-2"><input type="number" className="w-2/3 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-right focus:ring-2 focus:ring-emerald-300 outline-none" placeholder="Jml" value={newAssetForm.quantity} onChange={e => setNewAssetForm({...newAssetForm, quantity: e.target.value})} /><input className="w-1/3 border border-emerald-200 rounded-lg px-2 py-2 text-xs text-center focus:ring-2 focus:ring-emerald-300 outline-none" placeholder="Unit" value={newAssetForm.unit} onChange={e => setNewAssetForm({...newAssetForm, unit: e.target.value})} /></td>
                                  <td className="p-3 text-right font-bold text-slate-400 text-xs">Auto</td>
                                  <td className="p-3 flex gap-2 justify-center"><button onClick={handleAddAsset} className="bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"><Check size={14} /></button><button onClick={() => setIsAddingAsset(false)} className="bg-slate-300 text-slate-600 p-2 rounded-lg hover:bg-slate-400 transition-colors shadow-sm"><X size={14} /></button></td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
       </div>
    )
};

const SetupView = ({ categories, setCategories, accounts, setAccounts, currency, setCurrency }) => {
     const [addingCategoryType, setAddingCategoryType] = useState(null);
     const [newCategoryName, setNewCategoryName] = useState("");
     const [editingId, setEditingId] = useState(null);
     const [editForm, setEditForm] = useState({ name: "", type: "", balance: 0 });
     const [isAddingAccount, setIsAddingAccount] = useState(false);
     const [newAccountForm, setNewAccountForm] = useState({ name: "", type: "Bank", balance: "" });

     const accountsDisplay = accounts.filter(a => a.id !== 99);

     const startEdit = (acc) => { setEditingId(acc.id); setEditForm({ name: acc.name, type: acc.type, balance: acc.balance }); };
     const saveEdit = (id) => { setAccounts(prev => prev.map(acc => { if(acc.id === id) return { ...acc, ...editForm, balance: parseInt(editForm.balance) || 0 }; return acc; })); setEditingId(null); };
     const handleAddAccount = () => { if (!newAccountForm.name) return; setAccounts([...accounts, { id: Date.now(), name: newAccountForm.name, type: newAccountForm.type, balance: parseInt(newAccountForm.balance) || 0 }]); setNewAccountForm({ name: "", type: "Bank", balance: "" }); setIsAddingAccount(false); };
     const handleAddCategory = () => { if (!newCategoryName || !addingCategoryType) return; if (categories[addingCategoryType].includes(newCategoryName)) return alert("Kategori sudah ada!"); setCategories(prev => ({ ...prev, [addingCategoryType]: [...prev[addingCategoryType], newCategoryName] })); setNewCategoryName(""); setAddingCategoryType(null); };
     const removeCategory = (type, name) => { setCategories(prev => ({ ...prev, [type]: prev[type].filter(c => c !== name) })); };

     const renderCategorySection = (title, type, colorClass, items) => (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-6"><h3 className={`font-bold text-lg mb-6 ${colorClass} border-b pb-3`}>{title}</h3><div className="flex flex-wrap gap-3 mb-6">{items.map(cat => (<span key={cat} className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-full text-sm text-slate-700 font-bold flex items-center gap-2 group hover:bg-slate-100 transition-colors">{cat}<button onClick={() => removeCategory(type, cat)} className="text-slate-400 hover:text-rose-500 bg-slate-200 rounded-full p-0.5 hover:bg-rose-100 transition-colors"><X size={14} /></button></span>))}</div>{addingCategoryType === type ? (<div className="flex gap-3 items-center animate-fadeIn"><input autoFocus type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nama kategori..." className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300 w-full" onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} /><button onClick={handleAddCategory} className="bg-emerald-500 text-white p-2.5 rounded-xl hover:bg-emerald-600 transition-colors"><Check size={18} /></button><button onClick={() => { setAddingCategoryType(null); setNewCategoryName(""); }} className="bg-slate-200 text-slate-600 p-2.5 rounded-xl hover:bg-slate-300 transition-colors"><X size={18} /></button></div>) : (<button onClick={() => setAddingCategoryType(type)} className={`bg-slate-50 border-2 border-dashed border-slate-300 px-5 py-3 rounded-xl text-sm text-slate-500 font-bold hover:text-slate-700 hover:border-slate-400 flex items-center gap-2 transition-all w-full justify-center group`}><Plus size={18} className="group-hover:scale-110 transition-transform"/> Tambah Kategori</button>)}</div>
     );

     return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center mb-10"><div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100"><Settings className="w-10 h-10 text-emerald-500" /></div><h2 className="text-3xl font-bold text-slate-800">Vibe Check & Setup ⚙️</h2><p className="text-slate-500 font-medium mt-2">Sesuaikan kategori dan akun biar makin klop sama gaya lo.</p></div>
            
            {/* Currency Settings */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <h3 className="font-bold text-lg mb-6 text-indigo-600 border-b border-indigo-50 pb-4 flex items-center gap-2 relative z-10"><Globe size={22}/> Mata Uang (Currency)</h3>
                <div className="flex flex-col gap-3 relative z-10">
                    <label className="text-sm font-bold text-slate-600">Pilih Mata Uang:</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                        {Object.keys(CURRENCIES).map(code => (<option key={code} value={code}>{CURRENCIES[code].label}</option>))}
                    </select>
                    <p className="text-xs text-slate-400 mt-1 font-medium bg-indigo-50 p-2 rounded-lg w-fit text-indigo-600 flex items-center gap-1"><Info size={12}/> Auto-convert symbol only. Values stay numeric.</p>
                </div>
            </div>

            {renderCategorySection("Kategori Pemasukan", "income", "text-emerald-600", categories.income)}
            {renderCategorySection("Kategori Tabungan", "savings", "text-teal-600", categories.savings)}
            {renderCategorySection("Kategori Pengeluaran", "expenses", "text-rose-600", categories.expenses)}
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200"><h3 className="font-bold text-lg mb-6 text-blue-600 border-b pb-4">Daftar Akun / Rekening</h3><div className="space-y-4">{accountsDisplay.map(acc => (<div key={acc.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all">{editingId === acc.id ? (<div className="flex-1 flex gap-3 items-center flex-wrap"><input className="border border-slate-300 rounded-xl px-3 py-2 text-sm w-full sm:w-1/3 focus:ring-2 focus:ring-blue-200 outline-none" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Nama Akun" /><select className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none cursor-pointer" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})}><option value="Bank">Bank</option><option value="E-Wallet">E-Wallet</option><option value="Cash">Cash</option></select><input type="number" className="border border-slate-300 rounded-xl px-3 py-2 text-sm w-28 focus:ring-2 focus:ring-blue-200 outline-none" value={editForm.balance} onChange={e => setEditForm({...editForm, balance: e.target.value})} placeholder="Saldo" /><div className="flex gap-2"><button onClick={() => saveEdit(acc.id)} className="bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600 transition-colors"><Save size={18} /></button><button onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300 transition-colors"><X size={18} /></button></div></div>) : (<><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shadow-sm">{acc.type === 'Bank' ? <Landmark size={20} /> : <Wallet size={20} />}</div><div><p className="font-bold text-slate-800 text-lg">{acc.name}</p><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{acc.type}</p></div></div><div className="flex items-center gap-5"><span className="font-bold text-slate-700 text-lg tracking-tight">{formatCurrency(acc.balance, currency)}</span><div className="flex gap-2"><button onClick={() => startEdit(acc)} className="text-slate-400 hover:text-emerald-500 p-2 hover:bg-emerald-50 rounded-xl transition-colors"><Pencil size={18} /></button><button onClick={() => setAccounts(prev => prev.filter(a => a.id !== acc.id))} className="text-slate-400 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 size={18} /></button></div></div></>)}</div>))}
            {isAddingAccount ? (<div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3 items-center flex-wrap animate-fadeIn shadow-inner"><input className="border border-blue-200 rounded-xl px-4 py-2.5 text-sm w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" value={newAccountForm.name} onChange={e => setNewAccountForm({...newAccountForm, name: e.target.value})} placeholder="Nama Akun Baru" /><select className="border border-blue-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer" value={newAccountForm.type} onChange={e => setNewAccountForm({...newAccountForm, type: e.target.value})}><option value="Bank">Bank</option><option value="E-Wallet">E-Wallet</option><option value="Cash">Cash</option></select><input type="number" className="border border-blue-200 rounded-xl px-4 py-2.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" value={newAccountForm.balance} onChange={e => setNewAccountForm({...newAccountForm, balance: e.target.value})} placeholder="Saldo Awal" /><div className="flex gap-2"><button onClick={handleAddAccount} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-bold shadow-md transition-colors">Simpan</button><button onClick={() => setIsAddingAccount(false)} className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-bold transition-colors">Batal</button></div></div>) : (<button onClick={() => setIsAddingAccount(true)} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-bold hover:border-emerald-400 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 group hover:bg-emerald-50/30"><Plus size={20} className="group-hover:scale-110 transition-transform"/> Tambah Akun Baru</button>)}</div></div></div>
     );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // App State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [spendingFilters, setSpendingFilters] = useState({ dateRange: 'month', category: 'all', account: 'all', sort: 'desc' });
  const [currency, setCurrency] = useState('IDR');
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear); 
  const [budgetYear, setBudgetYear] = useState(currentYear); 
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showYearly, setShowYearly] = useState(false);
  const availableYears = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // DATA STATE (Menggunakan DEFAULT_CATEGORIES & DEFAULT_ACCOUNTS sebagai fallback aman)
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES); 
  const [accounts, setAccounts] = useState(DEFAULT_ACCOUNTS); 
  const [transactions, setTransactions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [budgetData, setBudgetData] = useState({});

  // 1. Check Auth on Load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('maymonee_token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsAuthenticated(true);
        fetchUserData(); 
      }
      setIsLoadingAuth(false);
    };
    checkAuth();
  }, []);

  // 2. Data Fetching Function
  const fetchUserData = async () => {
    setIsLoadingData(true);
    try {
      const response = await axios.get('/dashboard'); 
      const { categories: apiCategories, accounts: apiAccounts, transactions, assets, budgets, recurring } = response.data;

      // FIX: Ensure state updates use safe logic if API returns empty arrays
      setCategories(apiCategories && apiCategories.income && apiCategories.income.length > 0 ? apiCategories : DEFAULT_CATEGORIES);
      
      // FIX: Filter out the default account (ID 99) if real accounts exist
      let newAccounts = apiAccounts || [];
      if (newAccounts.length === 0) {
          // If API returns no accounts, use our safe fallback
          newAccounts = DEFAULT_ACCOUNTS;
      }

      setAccounts(newAccounts);
      setTransactions(transactions || []);
      setAssets(assets || []);
      setBudgetData(budgets || {});
      setRecurringTransactions(recurring || []);

    } catch (error) {
      console.error("Gagal mengambil data:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  // 3. Login Logic
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    fetchUserData();
  };

  // 4. Logout Logic
  const handleLogout = () => {
    localStorage.removeItem('maymonee_token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setCurrentUser(null);
    // Reset to safe defaults to prevent subsequent crashes
    setCategories(DEFAULT_CATEGORIES);
    setAccounts(DEFAULT_ACCOUNTS);
    setTransactions([]);
    setAssets([]);
    setBudgetData({});
  };

  // --- CALCULATIONS (Using guarded state variables) ---
  const getBudgetTotal = (type, category, year = selectedYear, month = selectedMonth) => {
    if (showYearly && activeTab === 'dashboard') {
        return Object.values(budgetData[year] || {}).reduce((acc, monthData) => acc + (monthData[type]?.[category] || 0), 0);
    }
    return budgetData[year]?.[month]?.[type]?.[category] || 0;
  };

  const calculateAggregatedTotal = (type, year = selectedYear, month = selectedMonth, isYearly = showYearly) => {
    const yearData = budgetData[year] || {};
    if (isYearly) {
       return Object.values(yearData).reduce((total, monthData) => total + calculateTotal(monthData[type]), 0);
    }
    return calculateTotal(yearData[month]?.[type]);
  };

  const monthIncomeTotal = calculateAggregatedTotal('income');
  const monthSavingsTotal = calculateAggregatedTotal('savings');
  const monthExpenseBudgetTotal = calculateAggregatedTotal('expenses');

  const budgetTabIncomeTotal = calculateAggregatedTotal('income', budgetYear, selectedMonth, false);
  const budgetTabSavingsTotal = calculateAggregatedTotal('savings', budgetYear, selectedMonth, false);
  const budgetTabExpenseTotal = calculateAggregatedTotal('expenses', budgetYear, selectedMonth, false);

  const getRealizedTotal = (type, year, month, isYearly) => {
    return transactions
      .filter(t => {
        const d = new Date(t.date);
        if (d.getFullYear() !== year) return false;
        if (!isYearly && d.getMonth() !== month) return false;
        return t.type === type;
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const realizedSpending = getRealizedTotal('expense', selectedYear, selectedMonth, showYearly);
  const realizedIncome = getRealizedTotal('income', selectedYear, selectedMonth, showYearly);
  const currentCashflow = realizedIncome - (realizedSpending + monthSavingsTotal);

  const getPreviousPeriodData = () => {
    let prevYear = selectedYear;
    let prevMonth = selectedMonth;
     
    if (showYearly) {
      prevYear = selectedYear - 1;
    } else {
      if (selectedMonth === 0) {
        prevMonth = 11;
        prevYear = selectedYear - 1;
      } else {
        prevMonth = selectedMonth - 1;
      }
    }

    const prevRealizedIncome = getRealizedTotal('income', prevYear, prevMonth, showYearly);
    const prevRealizedSpending = getRealizedTotal('expense', prevYear, prevMonth, showYearly);
    const prevSavingsTotal = calculateAggregatedTotal('savings', prevYear, prevMonth, showYearly); 
    const prevCashflow = prevRealizedIncome - (prevRealizedSpending + prevSavingsTotal);

    return {
      income: prevRealizedIncome,
      spending: prevRealizedSpending,
      savings: prevSavingsTotal,
      cashflow: prevCashflow
    };
  };

  const prevPeriodData = getPreviousPeriodData();
   
  const getCategoryRealization = (catName, type = 'expense') => {
    return transactions
      .filter(t => {
        const d = new Date(t.date);
        if (d.getFullYear() !== selectedYear) return false;
        if (!showYearly && d.getMonth() !== selectedMonth) return false;
        return t.category === catName && t.type === type;
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const handleBudgetChange = (year, monthIdx, type, category, numericValue) => {
    setBudgetData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [monthIdx]: {
          ...prev[year][monthIdx],
          [type]: {
            ...prev[year][monthIdx][type],
            [category]: numericValue
          }
        }
      }
    }));
  };

  // --- RENDERING ---

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24 selection:bg-emerald-200">
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-2.5 rounded-2xl shadow-lg shadow-emerald-200">
                    <DollarSign className="w-6 h-6" strokeWidth={3} />
                </div>
                <div className="flex flex-col justify-center">
                    <span className="font-extrabold text-2xl tracking-tight text-slate-800 leading-none">Maymonee<span className="text-emerald-500">.</span></span>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">Financial Freedom</span>
                </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <NavButton active={activeTab} id="dashboard" label="Home" icon={<LayoutDashboard size={18} />} onClick={setActiveTab} />
              <NavButton active={activeTab} id="budgeting" label="Budget" icon={<Table size={18} />} onClick={setActiveTab} />
              <NavButton active={activeTab} id="spending" label="Spending" icon={<CreditCard size={18} />} onClick={setActiveTab} />
              <NavButton active={activeTab} id="assets" label="Assets" icon={<Landmark size={18} />} onClick={setActiveTab} />
              <NavButton active={activeTab} id="setup" label="Setup" icon={<Settings size={18} />} onClick={setActiveTab} />
              <button onClick={handleLogout} className="flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 text-rose-500 hover:bg-rose-50 ml-4"><LogOut size={18} className="mr-2"/> Logout</button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoadingData ? (
           <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-emerald-500 w-12 h-12 mb-4" />
              <p className="text-slate-500 font-medium">Sedang memuat data keuanganmu...</p>
           </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
                <DashboardView 
                    showYearly={showYearly} setShowYearly={setShowYearly}
                    selectedYear={selectedYear} setSelectedYear={setSelectedYear}
                    selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
                    availableYears={availableYears}
                    realizedIncome={realizedIncome} realizedSpending={realizedSpending}
                    monthSavingsTotal={monthSavingsTotal} currentCashflow={currentCashflow}
                    prevPeriodData={prevPeriodData}
                    budgetData={budgetData} transactions={transactions}
                    categories={categories}
                    getBudgetTotal={getBudgetTotal}
                    getCategoryRealization={getCategoryRealization}
                    currency={currency}
                />
            )}
            {activeTab === 'budgeting' && (
              <div className="space-y-8">
                <BudgetingSummary 
                  monthIncomeTotal={budgetTabIncomeTotal}
                  monthSavingsTotal={budgetTabSavingsTotal}
                  monthExpenseBudgetTotal={budgetTabExpenseTotal}
                  categories={categories}
                  getBudgetTotal={getBudgetTotal}
                  activeBudgetYear={budgetYear}
                  selectedMonth={selectedMonth}
                  currency={currency}
                />
                <BudgetingSection 
                  categories={categories}
                  budgetData={budgetData}
                  handleBudgetChange={handleBudgetChange}
                  selectedMonth={selectedMonth}
                  budgetYear={budgetYear}
                  setBudgetYear={setBudgetYear}
                  availableYears={availableYears}
                  currency={currency}
                />
              </div>
            )}
            {activeTab === 'spending' && (
                <SpendingView 
                    categories={categories} 
                    accounts={accounts} 
                    transactions={transactions} 
                    setTransactions={setTransactions} 
                    setAccounts={setAccounts}
                    realizedIncome={realizedIncome}
                    realizedSpending={realizedSpending}
                    filters={spendingFilters}
                    setFilters={setSpendingFilters}
                    currency={currency}
                    recurringTransactions={recurringTransactions}
                    setRecurringTransactions={setRecurringTransactions}
                />
            )}
            {activeTab === 'assets' && (
                <AssetsView 
                    assets={assets} 
                    accounts={accounts} 
                    setAssets={setAssets} 
                    setAccounts={setAccounts} 
                    setTransactions={setTransactions} 
                    transactions={transactions} 
                    currency={currency}
                />
            )}
            {activeTab === 'setup' && (
                <SetupView 
                    categories={categories} 
                    setCategories={setCategories} 
                    accounts={accounts} 
                    setAccounts={setAccounts} 
                    currency={currency}
                    setCurrency={setCurrency}
                />
            )}
          </>
        )}
      </main>
      
      <div className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl flex justify-around p-3 z-50 shadow-2xl shadow-emerald-900/10 ring-1 ring-black/5">
         <MobileNavBtn active={activeTab} id="dashboard" icon={<LayoutDashboard size={20} />} onClick={setActiveTab} />
         <MobileNavBtn active={activeTab} id="budgeting" icon={<Table size={20} />} onClick={setActiveTab} />
         <MobileNavBtn active={activeTab} id="spending" icon={<Plus size={24} className="text-white" />} onClick={setActiveTab} isMain />
         <MobileNavBtn active={activeTab} id="assets" icon={<Landmark size={20} />} onClick={setActiveTab} />
         <MobileNavBtn active={activeTab} id="setup" icon={<Settings size={20} />} onClick={setActiveTab} />
      </div>
    </div>
  );
}

// --- Sub-components for Layout ---

const NavButton = ({ active, id, label, icon, onClick }) => (
  <button onClick={() => onClick(id)} className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${active === id ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}><span className="mr-2">{icon}</span>{label}</button>
);

const MobileNavBtn = ({ active, id, icon, onClick, isMain }) => (
  <button onClick={() => onClick(id)} className={`p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${active === id ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'} ${isMain ? 'bg-gradient-to-br from-emerald-500 to-teal-600 -mt-12 border-4 border-white shadow-xl rounded-full w-16 h-16 transform hover:scale-105 active:scale-95' : ''}`}>{icon}{!isMain && <span className="text-[10px] mt-1 font-bold capitalize">{id}</span>}</button>
);