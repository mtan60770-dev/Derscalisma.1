
import React, { useState } from 'react';
import { User } from '../types';

interface SecurityProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (data: Partial<User>) => void;
  onViolation?: (reason: string) => void;
}

export const Security: React.FC<SecurityProps> = ({ user, onBack, onUpdateUser, onViolation }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSetting, setIsSetting] = useState(false);
  const [error, setError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPanicConfirm, setShowPanicConfirm] = useState(false);

  const handleSave = () => {
    if (pin.length !== 4) {
      setError('PIN 4 haneli olmalıdır.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PIN kodları uyuşmuyor.');
      return;
    }
    onUpdateUser({ pinCode: pin, isSecurityEnabled: true });
    setIsSetting(false);
    setError('');
    alert('Güvenlik PIN kodu başarıyla ayarlandı!');
  };

  const handleChangePassword = () => {
    if (currentPassword !== user.password) {
      setPasswordError('Mevcut şifre hatalı.');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('Yeni şifre en az 4 karakter olmalıdır.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Şifreler uyuşmuyor.');
      return;
    }
    onUpdateUser({ password: newPassword });
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordError('');
    alert('Şifreniz başarıyla değiştirildi!');
  };

  const handleToggle = () => {
    if (user.isSecurityEnabled) {
      onUpdateUser({ isSecurityEnabled: false });
    } else {
      setIsSetting(true);
    }
  };

  const handlePanic = () => {
    // Simulate panic mode
    alert('Tehlike Modu Aktif: Tüm diğer cihazlardan çıkış yapıldı ve veriler kilitlendi.');
    setShowPanicConfirm(false);
  };

  const securityScore = (user.isSecurityEnabled ? 20 : 0) + (user.isPrivacyModeEnabled ? 15 : 0) + (user.pinCode ? 15 : 0) + (user.password ? 20 : 0) + (user.is2FAEnabled ? 15 : 0) + (user.isBiometricEnabled ? 15 : 0);

  return (
    <div className="flex flex-col h-full bg-background-dark text-white p-6 overflow-y-auto no-scrollbar pb-32">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-black italic uppercase tracking-tighter">GÜVENLİK MERKEZİ</h1>
        <div className="w-10" />
      </div>

      <div className="space-y-6">
        {/* Security Score */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 p-8 rounded-[3rem] border border-white/10 text-center relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">GÜVENLİK PUANI</p>
                <div className="text-6xl font-black italic tracking-tighter text-primary mb-2">%{securityScore}</div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${securityScore}%` }} />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    {securityScore < 100 ? 'Hesabını tam korumaya almak için tüm özellikleri aktif et.' : 'Hesabın Titan Shield ile tam koruma altında!'}
                </p>
            </div>
            <span className="absolute -right-4 -bottom-4 material-symbols-outlined text-[100px] text-white/5 rotate-12">verified_user</span>
        </div>

        {/* 2FA & Biometric */}
        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">verified_user</span>
              <div>
                <h3 className="font-bold text-sm">İki Adımlı Doğrulama (2FA)</h3>
                <p className="text-[10px] text-slate-500 uppercase font-black">Ekstra Güvenlik Katmanı</p>
              </div>
            </div>
            <button 
              onClick={() => onUpdateUser({ is2FAEnabled: !user.is2FAEnabled })}
              className={`w-12 h-6 rounded-full transition-all relative ${user.is2FAEnabled ? 'bg-primary' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.is2FAEnabled ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          <div className="h-px w-full bg-white/5" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">fingerprint</span>
              <div>
                <h3 className="font-bold text-sm">Biyometrik Giriş</h3>
                <p className="text-[10px] text-slate-500 uppercase font-black">Face ID / Touch ID</p>
              </div>
            </div>
            <button 
              onClick={() => onUpdateUser({ isBiometricEnabled: !user.isBiometricEnabled })}
              className={`w-12 h-6 rounded-full transition-all relative ${user.isBiometricEnabled ? 'bg-primary' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.isBiometricEnabled ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">account_box</span>
              <div>
                <h3 className="font-bold text-sm">Hesap Durumu</h3>
                <p className="text-[10px] text-slate-500 uppercase font-black">Genel Hesap Sağlığı</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase border border-emerald-500/20">
              AKTİF
            </span>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Kayıt Tarihi</span>
              <span className="text-[10px] font-black text-slate-500">12 Eki 2025</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">İhlal Durumu</span>
              <span className="text-[10px] font-black text-emerald-500">TEMİZ</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Hesap Türü</span>
              <span className={`text-[10px] font-black ${user.isProActive ? 'text-purple-400' : 'text-slate-500'}`}>{user.isProActive ? 'PRO ÜYE' : 'STANDART'}</span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">key</span>
              <div>
                <h3 className="font-bold text-sm">Şifre Değiştir</h3>
                <p className="text-[10px] text-slate-500 uppercase font-black">Hesap Güvenliği</p>
              </div>
            </div>
            <button 
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="px-4 py-1.5 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest border border-white/5"
            >
              {isChangingPassword ? 'İPTAL' : 'DÜZENLE'}
            </button>
          </div>
          
          {isChangingPassword && (
            <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top duration-300">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Mevcut Şifre</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-white/5 text-sm font-bold"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Yeni Şifre</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-white/5 text-sm font-bold"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Yeni Şifre Tekrar</label>
                <input 
                  type="password" 
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-white/5 text-sm font-bold"
                  placeholder="••••••••"
                />
              </div>
              {passwordError && <p className="text-red-500 text-[10px] font-black uppercase text-center">{passwordError}</p>}
              <button 
                onClick={handleChangePassword}
                className="w-full bg-primary py-4 rounded-2xl font-black uppercase italic shadow-glow"
              >
                ŞİFREYİ GÜNCELLE
              </button>
            </div>
          )}
        </div>

        {/* Device History */}
        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">devices</span>
            <div>
              <h3 className="font-bold text-sm">Cihaz Geçmişi</h3>
              <p className="text-[10px] text-slate-500 uppercase font-black">Giriş Yapılan Cihazlar</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {user.loginSessions?.map(session => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined">
                      { (session.deviceName || '').toLowerCase().includes('iphone') ? 'smartphone' : 'laptop'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">{session.deviceName}</h4>
                    <p className="text-[9px] text-slate-500 font-black uppercase">{session.location} • {session.isCurrent ? 'Şu An Aktif' : new Date(session.lastActive).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
                {session.isCurrent ? (
                  <span className="text-[8px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-2 py-1 rounded-lg">BU CİHAZ</span>
                ) : (
                  <button className="text-[8px] font-black text-red-500 uppercase bg-red-500/10 px-2 py-1 rounded-lg">ÇIKIŞ YAP</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">lock</span>
              <div>
                <h3 className="font-bold text-sm">Uygulama Kilidi</h3>
                <p className="text-[10px] text-slate-500 uppercase font-black">PIN Kodu Koruması</p>
              </div>
            </div>
            <button 
              onClick={handleToggle}
              className={`w-12 h-6 rounded-full transition-all relative ${user.isSecurityEnabled ? 'bg-primary' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.isSecurityEnabled ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Bu özellik aktif edildiğinde, uygulamaya girişte veya profilinize erişimde 4 haneli PIN kodu sorulacaktır.
          </p>

          {user.isSecurityEnabled && (
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-xs font-bold text-slate-300">Otomatik Kilit Süresi</span>
              <select 
                value={user.autoLockTimer || 0}
                onChange={(e) => onUpdateUser({ autoLockTimer: Number(e.target.value) })}
                className="bg-slate-800 text-xs font-bold p-2 rounded-xl outline-none border border-white/5"
              >
                <option value={0}>Hemen</option>
                <option value={1}>1 Dakika</option>
                <option value={5}>5 Dakika</option>
                <option value={15}>15 Dakika</option>
              </select>
            </div>
          )}
        </div>

        {isSetting && (
          <div className="bg-white/5 p-6 rounded-[2rem] border border-primary/30 animate-in fade-in slide-in-from-top duration-300">
            <h3 className="font-black italic text-sm mb-4 uppercase text-primary">Yeni PIN Kodu Oluştur</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">PIN Kodu</label>
                <input 
                  type="password" 
                  maxLength={4}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-white/5 text-center text-2xl tracking-[1em] font-black"
                  placeholder="****"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Tekrarla</label>
                <input 
                  type="password" 
                  maxLength={4}
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-white/5 text-center text-2xl tracking-[1em] font-black"
                  placeholder="****"
                />
              </div>
              {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}
              <button 
                onClick={handleSave}
                className="w-full bg-primary py-4 rounded-2xl font-black uppercase italic shadow-glow"
              >
                KAYDET
              </button>
            </div>
          </div>
        )}

        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-yellow-500">security</span>
            <div>
              <h3 className="font-bold text-sm">Gelişmiş Koruma</h3>
              <p className="text-[10px] text-slate-500 uppercase font-black">Titan Shield v1.2</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-emerald-500">check_circle</span>
                    <span className="text-[10px] font-black uppercase text-slate-400">Uçtan Uca Şifreleme</span>
                </div>
                <span className="text-[9px] font-black text-emerald-500 uppercase">AKTİF</span>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-emerald-500">check_circle</span>
                    <span className="text-[10px] font-black uppercase text-slate-400">Yapay Zeka Filtresi</span>
                </div>
                <span className="text-[9px] font-black text-emerald-500 uppercase">GÜVENLİ</span>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-emerald-500">check_circle</span>
                    <span className="text-[10px] font-black uppercase text-slate-400">Gizlilik Modu</span>
                </div>
                <span className={`text-[9px] font-black uppercase ${user.isPrivacyModeEnabled ? 'text-emerald-500' : 'text-slate-600'}`}>
                    {user.isPrivacyModeEnabled ? 'AKTİF' : 'PASİF'}
                </span>
            </div>
          </div>
        </div>

        {/* AI Moderation */}
        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-500">smart_toy</span>
              <div>
                <h3 className="font-bold text-sm">Yapay Zeka Moderasyonu</h3>
                <p className="text-[10px] text-slate-500 uppercase font-black">Otomatik Davranış Analizi</p>
              </div>
            </div>
            <button 
              onClick={() => onUpdateUser({ isAiModerationEnabled: !user.isAiModerationEnabled })}
              className={`w-12 h-6 rounded-full transition-all relative ${user.isAiModerationEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.isAiModerationEnabled ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Yapay zeka, platform içindeki davranışlarınızı ve mesajlarınızı analiz ederek topluluk kurallarına uyumu denetler. İhlal durumunda otomatik ban işlemi uygulanabilir.
          </p>

          {user.isAiModerationEnabled && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <button 
                onClick={() => {
                  const reasons = [
                    "Sistemde hile yapmaya çalışma girişimi tespit edildi.",
                    "Topluluk kurallarına aykırı mesaj gönderimi.",
                    "Şüpheli hesap aktivitesi ve bot kullanımı.",
                    "Diğer kullanıcılara karşı uygunsuz davranış."
                  ];
                  const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
                  
                  if (window.confirm("DİKKAT: Bu işlem hesabınızda kural ihlali oluşturacaktır (Saatlik/Günlük/Kalıcı Ban). Test etmek istiyor musunuz?")) {
                    if (onViolation) {
                      onViolation(randomReason);
                    } else {
                      onUpdateUser({ isBanned: true, banReason: randomReason });
                    }
                  }
                }}
                className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-black uppercase border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                YAPAY ZEKA BAN TESTİ
              </button>
            </div>
          )}
        </div>

        {/* Panic Button */}
        <div className="bg-red-500/10 p-6 rounded-[2rem] border border-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-red-500">warning</span>
            <div>
              <h3 className="font-bold text-sm text-red-500">Tehlike Modu</h3>
              <p className="text-[10px] text-red-500/70 uppercase font-black">Acil Durum Protokolü</p>
            </div>
          </div>
          <p className="text-xs text-red-400/80 leading-relaxed mb-4">
            Hesabınızın tehlikede olduğunu düşünüyorsanız, diğer tüm cihazlardan anında çıkış yapın ve verilerinizi kilitleyin.
          </p>
          
          {showPanicConfirm ? (
            <div className="space-y-3 animate-in fade-in duration-300">
              <p className="text-[10px] font-black uppercase text-red-500 text-center">Emin misiniz?</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowPanicConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-xs font-black uppercase"
                >
                  İptal
                </button>
                <button 
                  onClick={handlePanic}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white text-xs font-black uppercase shadow-glow"
                >
                  Evet, Kilitle
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowPanicConfirm(true)}
              className="w-full py-4 rounded-2xl bg-red-500/20 text-red-500 font-black uppercase italic tracking-widest hover:bg-red-500/30 transition-colors"
            >
              TÜM CİHAZLARDAN ÇIKIŞ YAP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
