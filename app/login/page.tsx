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
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<"email" | "otp" | "password" | "success">("email");
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
        body: JSON.stringify({ email: resetEmail, step: "request" })
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp, step: "verify-otp" })
      });
      if (res.ok) {
        setResetStep("password");
      } else {
        const data = await res.json();
        setResetError(data.error || "Invalid OTP");
      }
    } catch (e) {
      setResetError(t.auth.networkError);
    }
    setResetLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: resetEmail, 
          otp, 
          newPassword, 
          step: "update" 
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
    setResetStep("email");
    setResetEmail("");
    setOtp("");
    setNewPassword("");
    setResetError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50/50 animate-in fade-in duration-700">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-10 bg-white border border-slate-200 rounded-xl p-8 lg:p-12 shadow-sm">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-2">
             <ShieldCheck className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Pickpock</h1>
          <p className="text-slate-500 font-medium text-sm">{t.auth.login}</p>
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
      </div>

      <div className="w-full lg:w-[400px] h-fit bg-white border border-slate-200 rounded-xl p-6 lg:p-8 shadow-sm">
        <div className="text-center space-y-4">
           <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
             <div className="flex items-center justify-center gap-2 mb-2">
               <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest m-0">
                 {t.auth.judgeShortcuts}
               </p>
             </div>
             <p className="text-[10px] text-slate-400 font-medium mb-4">{t.auth.judgeDesc}</p>
             <div className="grid grid-cols-2 gap-2 mb-4">
               <button 
                 type="button" 
                 onClick={() => { setEmail('alice@example.com'); setPassword('1234'); }}
                 className="p-2 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
               >
                 {t.auth.adminLabel}
               </button>
               <button 
                 type="button" 
                 onClick={() => { setEmail('somchai@example.com'); setPassword('1234'); }}
                 className="p-2 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
               >
                 {t.auth.partnerLabel}
               </button>
               <button 
                 type="button" 
                 onClick={() => { setEmail('bob@example.com'); setPassword('1234'); }}
                 className="p-2 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
               >
                 {t.auth.customerLabel}
               </button>
               <button 
                 type="button" 
                 onClick={() => { setEmail('charlie@example.com'); setPassword('1234'); }}
                 className="p-2 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
               >
                 {t.auth.vipLabel}
               </button>
             </div>
             
             <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 border-t border-slate-200 pt-3">
               {t.auth.partnerStoreOwners}
             </div>
             <div className="grid grid-cols-2 gap-2">
               <button 
                 type="button" 
                 onClick={() => { setEmail('bytezone@example.com'); setPassword('1234'); }}
                 className="p-2 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all cursor-pointer"
               >
                 ByteZone Gaming
               </button>
               <button 
                 type="button" 
                 onClick={() => { setEmail('smartlife@example.com'); setPassword('1234'); }}
                 className="p-2 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all cursor-pointer"
               >
                 SmartLife Gadget
               </button>
               <button 
                 type="button" 
                 onClick={() => { setEmail('campus@example.com'); setPassword('1234'); }}
                 className="p-2 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all cursor-pointer"
               >
                 Campus Essentials
               </button>
               <button 
                 type="button" 
                 onClick={() => { setEmail('cozy@example.com'); setPassword('1234'); }}
                 className="p-2 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-rose-400 hover:text-white hover:border-rose-400 transition-all cursor-pointer"
               >
                 Cozy Living
               </button>
             </div>
           </div>
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
              {resetStep === "email" && (
                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <p className="text-sm text-slate-500 font-medium">
                    {t.auth.resetEmailDesc}
                  </p>
                  {resetError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                      <p className="text-rose-600 text-xs font-bold text-center uppercase tracking-tight">
                        {resetError}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">{t.auth.email}</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="email"
                        required
                        placeholder={t.auth.emailPlaceholder}
                        className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-slate-900"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-12 rounded-lg bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    {t.auth.sendOtp}
                  </button>
                </form>
              )}

              {resetStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <p className="text-sm text-slate-500 font-medium">
                    {t.auth.resetOtpDesc.replace('{phone}', resetEmail)}
                  </p>
                  {resetError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                      <p className="text-rose-600 text-xs font-bold text-center uppercase tracking-tight">
                        {resetError}
                      </p>
                    </div>
                  )}
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
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-12 rounded-lg bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    {t.auth.verifyOtpTitle}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetStep("email")}
                    className="w-full text-xs text-slate-400 font-bold hover:text-primary transition-colors cursor-pointer"
                  >
                    {t.auth.backToEmail}
                  </button>
                </form>
              )}

              {resetStep === "password" && (
                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  <p className="text-sm text-slate-500 font-medium">
                    {t.auth.otpVerifiedDesc}
                  </p>
                  {resetError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                      <p className="text-rose-600 text-xs font-bold text-center uppercase tracking-tight">
                        {resetError}
                      </p>
                    </div>
                  )}
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
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-12 rounded-lg bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    {t.auth.updatePassword}
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
