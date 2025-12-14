import React, { useState } from 'react';

interface AuthProps {
  onLogin: (name: string, password: string, email: string, grade: number, rememberMe: boolean, isRegister: boolean) => Promise<boolean>;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState<number>(9); // Default grade
  const [rememberMe, setRememberMe] = useState(false);
  
  const [error, setError] = useState('');
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    
    if (!name.trim()) {
        setError('Kullanıcı adı gerekli.');
        return;
    }
    if (!password || password.length < 4) {
        setError('Şifre en az 4 karakter olmalı.');
        return;
    }

    setLoading(true);
    
    // Simulate network delay for effect
    await new Promise(r => setTimeout(r, 600));

    const success = await onLogin(
        name.trim(), 
        password.trim(), 
        email.trim() || "ogrenci@okul.edu.tr", 
        grade,
        rememberMe,
        mode === 'register'
    );

    if (success) {
        setAnimating(true);
    } else {
        setLoading(false);
        setError(mode === 'login' ? 'Kullanıcı adı veya şifre hatalı!' : 'Bu kullanıcı adı zaten kullanılıyor.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F172A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-[#0F172A] to-[#0F172A] animate-spin-slow duration-[20s]"></div>
      <div className="absolute top-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-[80px] animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[80px] animate-pulse delay-1000"></div>

      <div className={`w-full max-w-sm flex flex-col items-center relative z-10 transition-all duration-700 ${animating ? 'scale-110 opacity-0 blur-sm' : 'scale-100 opacity-100'}`}>
        
        {/* Logo Area */}
        <div className="mb-6 text-center animate-in slide-in-from-top-10 duration-700">
           <div className="w-20 h-20 bg-gradient-to-tr from-primary to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-primary/30 transform rotate-3 hover:rotate-6 transition-transform cursor-pointer">
               <span className="material-symbols-outlined text-white text-4xl drop-shadow-md">school</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tighter mb-1">Focus App</h1>
           <p className="text-indigo-200 text-xs font-medium tracking-wide uppercase">Öğrenci Girişi</p>
        </div>

        {/* Auth Box */}
        <div className="w-full bg-white/5 backdrop-blur-xl rounded-[2rem] p-1 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-10 duration-700 delay-100">
            {/* Tabs */}
            <div className="flex w-full mb-6 bg-black/20 p-1 rounded-[1.5rem]">
                <button 
                    onClick={() => { setMode('login'); setError(''); }}
                    className={`flex-1 py-3 text-sm font-bold rounded-[1.2rem] transition-all duration-300 ${mode === 'login' ? 'bg-white text-slate-900 shadow-lg scale-100' : 'text-slate-400 hover:text-white scale-95'}`}
                >
                    Giriş Yap
                </button>
                <button 
                    onClick={() => { setMode('register'); setError(''); }}
                    className={`flex-1 py-3 text-sm font-bold rounded-[1.2rem] transition-all duration-300 ${mode === 'register' ? 'bg-primary text-white shadow-lg scale-100' : 'text-slate-400 hover:text-white scale-95'}`}
                >
                    Kayıt Ol
                </button>
            </div>

            <div className="px-4 pb-4 flex flex-col gap-4">
                
                {/* Username Input */}
                <div className="group space-y-1">
                    <label className="text-xs font-bold text-slate-400 ml-3 group-focus-within:text-primary transition-colors">
                        {mode === 'login' ? 'Kullanıcı Adı' : 'Kullanıcı Adı Belirle'}
                    </label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Örn: ali123"
                            className="w-full bg-black/20 border border-white/5 rounded-2xl py-3.5 pl-12 pr-5 text-white font-bold placeholder:text-slate-600 focus:border-primary/50 focus:bg-black/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                        <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-500">person</span>
                    </div>
                </div>

                {/* Email & Grade Input (Register Only) */}
                {mode === 'register' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                        <div className="group space-y-1">
                            <label className="text-xs font-bold text-slate-400 ml-3 group-focus-within:text-primary transition-colors">E-Posta</label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="mail@ornek.com"
                                    className="w-full bg-black/20 border border-white/5 rounded-2xl py-3.5 pl-12 pr-5 text-white font-bold placeholder:text-slate-600 focus:border-primary/50 focus:bg-black/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                />
                                <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-500">mail</span>
                            </div>
                        </div>

                        <div className="group space-y-1">
                            <label className="text-xs font-bold text-slate-400 ml-3 group-focus-within:text-primary transition-colors">Sınıf</label>
                            <div className="relative">
                                <select 
                                    value={grade}
                                    onChange={(e) => setGrade(Number(e.target.value))}
                                    className="w-full bg-black/20 border border-white/5 rounded-2xl py-3.5 pl-12 pr-5 text-white font-bold focus:border-primary/50 focus:bg-black/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none"
                                >
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i} value={i + 1} className="bg-slate-900 text-white">{i + 1}. Sınıf</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-500">school</span>
                                <span className="material-symbols-outlined absolute right-4 top-3.5 text-slate-500 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Password Input */}
                <div className="group space-y-1">
                    <label className="text-xs font-bold text-slate-400 ml-3 group-focus-within:text-primary transition-colors">Şifre</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                            className="w-full bg-black/20 border border-white/5 rounded-2xl py-3.5 pl-12 pr-5 text-white font-bold placeholder:text-slate-600 focus:border-primary/50 focus:bg-black/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                        <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-500">lock</span>
                    </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center gap-3 px-1 mt-1">
                    <div 
                        onClick={() => setRememberMe(!rememberMe)}
                        className={`w-5 h-5 rounded-md border cursor-pointer flex items-center justify-center transition-all ${rememberMe ? 'bg-primary border-primary' : 'border-slate-600 bg-transparent'}`}
                    >
                        {rememberMe && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
                    </div>
                    <span onClick={() => setRememberMe(!rememberMe)} className="text-xs text-slate-400 font-bold cursor-pointer select-none">Beni Hatırla (Oturumu Kaydet)</span>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-xl flex items-center gap-2 animate-in shake">
                        <span className="material-symbols-outlined text-red-500 text-sm">error</span>
                        <span className="text-red-400 text-xs font-bold">{error}</span>
                    </div>
                )}

                <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`group w-full h-14 mt-2 font-bold text-white rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden ${mode === 'register' ? 'bg-gradient-to-r from-primary to-blue-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    {loading ? (
                        <span className="material-symbols-outlined animate-spin">refresh</span>
                    ) : (
                        <>
                            <span className="relative text-lg">{mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}</span>
                            <span className="material-symbols-outlined text-lg relative group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </>
                    )}
                </button>
            </div>
        </div>

      </div>
      
      <div className="absolute bottom-6 text-center w-full opacity-50">
         <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em]">Designed for Students</p>
      </div>
    </div>
  );
};
