"use client";

import { useState } from "react";
import { useRole } from "@/hooks/use-role";
import { useRouter } from "next/navigation";
import { Box, LogIn, Mail, Lock, Loader2, ShieldCheck, User, X, KeyRound, Phone, Smartphone, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function LoginPage() {
  const { login } = useRole();
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Password Reset State
  const [resetPhone, setResetPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<"phone" | "otp" | "success">("phone");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const success = await login(email, password);
    if (success) {
      router.push("/");
    } else {
      setError(t.auth.invalidLogin);
    }
    setLoading(false);
  };

  const handleDemoLogin = async (role: 'founder' | 'customer') => {
    setLoading(true);
    setError("");
    const demoEmail = role === 'founder' ? 'alice@example.com' : 'somchai@example.com';
    const success = await login(demoEmail, '1234');
    if (success) {
      router.push(role === 'founder' ? '/dashboard' : '/');
    } else {
      setError(t.auth.invalidLogin);
    }
    setLoading(false);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: resetPhone, step: "request" })
      });
      if (res.ok) {
        setResetStep("otp");
      } else {
        const data = await res.json();
        setResetError(data.error || t.auth.otpFailed);
      }
    } catch (e) {
      setResetError(t.auth.networkError);
    }
    setResetLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: resetPhone, 
          otp, 
          newPassword, 
          step: "verify" 
        })
      });
      if (res.ok) {
        setResetStep("success");
      } else {
        const data = await res.json();
        setResetError(data.error || t.auth.resetFailed);
      }
    } catch (e) {
      setResetError(t.auth.networkError);
    }
    setResetLoading(false);
  };

  const closeResetModal = () => {
    setShowForgotPassword(false);
    setResetStep("phone");
    setResetPhone("");
    setOtp("");
    setNewPassword("");
    setResetError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50/50 animate-in fade-in duration-700">
      <div className="w-full max-w-md space-y-10 bg-white border border-slate-200 rounded-xl p-8 lg:p-12 shadow-sm">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-2">
             <ShieldCheck className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Pickpock</h1>
          <p className="text-slate-500 font-medium text-sm">{t.auth.login}</p>
        </div>

        {/* Quick Demo Login */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleDemoLogin('founder')}
            disabled={loading}
            className="group relative h-12 rounded-lg border-2 border-primary/20 bg-primary/5 text-slate-900 font-bold text-sm hover:bg-primary/10 hover:border-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>{t.auth.founder}</span>
            <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('customer')}
            disabled={loading}
            className="h-12 rounded-lg bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <User className="h-4 w-4" />
            <span>{t.auth.customer}</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t.auth.or}</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">{t.auth.email}</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                required
                placeholder={t.auth.emailPlaceholder}
                className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-slate-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">{t.auth.password}</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                placeholder={t.auth.passPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-slate-900"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-primary font-bold hover:text-primary/80 transition-colors"
              >
                {t.auth.forgotPassword}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
              <p className="text-rose-600 text-xs font-bold text-center uppercase tracking-tight">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 rounded-lg bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
            {t.auth.loginTitle}
          </button>
        </form>

        <div className="pt-8 border-t border-slate-100 text-center space-y-4">
           <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t.auth.demoAccounts}</p>
             <p className="text-xs text-slate-600 font-medium leading-relaxed">
               <span className="font-bold text-slate-900">{t.auth.founder}:</span> alice@example.com <br/>
               <span className="font-bold text-slate-900">{t.auth.customer}:</span> somchai@example.com
             </p>
           </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold tracking-tight flex items-center gap-2 uppercase">
                <KeyRound className="h-5 w-5 text-primary" />
                {t.auth.resetPassword}
              </h3>
              <button onClick={closeResetModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            
            <div className="p-8">
              {resetStep === "phone" && (
                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <p className="text-sm text-slate-500 font-medium">
                    {t.auth.resetPhoneDesc}
                  </p>
                  {resetError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                      <p className="text-rose-600 text-xs font-bold text-center uppercase tracking-tight">
                        {resetError}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">{t.auth.phone}</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="tel"
                        required
                        placeholder={t.auth.phonePlaceholder}
                        className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-slate-900"
                        value={resetPhone}
                        onChange={(e) => setResetPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-12 rounded-lg bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                    {t.auth.sendOtp}
                  </button>
                </form>
              )}

              {resetStep === "otp" && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <p className="text-sm text-slate-500 font-medium">
                    {t.auth.resetOtpDesc.replace('{phone}', resetPhone)}
                  </p>
                  {resetError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                      <p className="text-rose-600 text-xs font-bold text-center uppercase tracking-tight">
                        {resetError}
                      </p>
                    </div>
                  )}
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">{t.auth.otp}</label>
                      <input
                        type="text"
                        required
                        placeholder={t.auth.otpPlaceholder}
                        maxLength={6}
                        className="w-full px-6 py-4 rounded-lg border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-center text-2xl tracking-[0.5em] text-slate-900"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">{t.auth.newPassword}</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                          type="password"
                          required
                          placeholder={t.auth.passPlaceholder}
                          className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-slate-900"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-12 rounded-lg bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    {t.auth.updatePassword}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetStep("phone")}
                    className="w-full text-xs text-slate-400 font-bold hover:text-primary transition-colors"
                  >
                    {t.auth.backToPhone}
                  </button>
                </form>
              )}

              {resetStep === "success" && (
                <div className="py-8 text-center space-y-4">
                  <div className="inline-flex p-4 rounded-lg bg-emerald-50 text-emerald-600 mb-2 border border-emerald-100">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{t.auth.resetSuccess}</h4>
                  <p className="text-sm text-slate-500 font-medium">
                    {t.auth.resetSuccessDesc}
                  </p>
                  <button
                    onClick={closeResetModal}
                    className="w-full h-12 rounded-lg bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
                  >
                    {t.auth.returnToLogin}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
