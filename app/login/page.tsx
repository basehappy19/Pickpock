"use client";

import { useState } from "react";
import { useRole } from "@/hooks/use-role";
import { useRouter } from "next/navigation";
import { Box, LogIn, Mail, Lock, Loader2, ShieldCheck, User, X, KeyRound, Phone, Smartphone, CheckCircle2, UserPlus } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function LoginPage() {
  const { login, registerUser } = useRole();
  const { t, language } = useLanguage();
  const router = useRouter();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState("");
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

    if (isLoginMode) {
      const success = await login(email, password);
      if (success) {
        router.push("/");
      } else {
        setError(t.auth.invalidLogin || "Invalid email or password");
      }
    } else {
      const success = await registerUser(name, email, password);
      if (success) {
        router.push("/");
      } else {
        setError(language === 'th' ? "เกิดข้อผิดพลาดในการสมัคร หรืออีเมลนี้ถูกใช้งานแล้ว" : "Registration failed or email already exists");
      }
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] animate-in fade-in duration-700 pb-[10vh]">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 lg:gap-8 z-10">
        <div className="flex-1 space-y-8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-2xl p-8 lg:p-12 shadow-xl dark:shadow-2xl dark:shadow-black/50 transition-all duration-300">
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2 shadow-inner">
               <ShieldCheck className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              PickPock
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {isLoginMode ? t.auth.login : (language === 'th' ? "สร้างบัญชีใหม่" : "Create a new account")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLoginMode && (
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 ml-1">
                  {language === 'th' ? "ชื่อ-นามสกุล" : "Full Name"}
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder={language === 'th' ? "เช่น สมชาย ใจดี" : "e.g. John Doe"}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 outline-none transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 ml-1">{t.auth.email}</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  placeholder={t.auth.emailPlaceholder}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 outline-none transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 ml-1">{t.auth.password}</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  placeholder={t.auth.passPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 outline-none transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
              {isLoginMode && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-primary font-bold hover:text-primary/80 dark:hover:text-primary/90 transition-colors"
                  >
                    {t.auth.forgotPassword}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 backdrop-blur-sm">
                <p className="text-rose-600 dark:text-rose-400 text-xs font-bold text-center uppercase tracking-tight">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20 dark:shadow-white/10"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isLoginMode ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />)}
              {isLoginMode ? t.auth.loginTitle : (language === 'th' ? "สมัครสมาชิก" : "Sign Up")}
            </button>

            <div className="pt-4 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isLoginMode 
                  ? (language === 'th' ? "ยังไม่มีบัญชีใช่ไหม? " : "Don't have an account? ") 
                  : (language === 'th' ? "มีบัญชีอยู่แล้วใช่ไหม? " : "Already have an account? ")}
                <button
                  type="button"
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="font-bold text-primary hover:text-primary/80 dark:hover:text-primary/90 transition-colors cursor-pointer"
                >
                  {isLoginMode 
                    ? (language === 'th' ? "สมัครสมาชิก" : "Sign up") 
                    : (language === 'th' ? "เข้าสู่ระบบ" : "Log in")}
                </button>
              </p>
            </div>
          </form>
        </div>

        <div className="w-full lg:w-[400px] h-fit bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 lg:p-8 shadow-xl dark:shadow-2xl dark:shadow-black/50 transition-all duration-300">
          <div className="text-center space-y-4">
             <div className="bg-slate-50/80 dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm">
               <div className="flex items-center justify-center gap-2 mb-3">
                 <span className="relative flex h-2.5 w-2.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                 </span>
                 <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest m-0">
                   {t.auth.judgeShortcuts}
                 </p>
               </div>
               <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-5">{t.auth.judgeDesc}</p>
               
               <div className="grid grid-cols-2 gap-3 mb-5">
                 <button 
                   type="button" 
                   onClick={() => { setEmail('alice@example.com'); setPassword('1234'); }}
                   className="p-2.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white hover:border-primary dark:hover:border-primary transition-all cursor-pointer shadow-sm"
                 >
                   {t.auth.adminLabel}
                 </button>
                 <button 
                   type="button" 
                   onClick={() => { setEmail('somchai@example.com'); setPassword('1234'); }}
                   className="p-2.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white hover:border-primary dark:hover:border-primary transition-all cursor-pointer shadow-sm"
                 >
                   {t.auth.partnerLabel}
                 </button>
                 <button 
                   type="button" 
                   onClick={() => { setEmail('bob@example.com'); setPassword('1234'); }}
                   className="p-2.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white hover:border-primary dark:hover:border-primary transition-all cursor-pointer shadow-sm"
                 >
                   {t.auth.customerLabel}
                 </button>
                 <button 
                   type="button" 
                   onClick={() => { setEmail('charlie@example.com'); setPassword('1234'); }}
                   className="p-2.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white hover:border-primary dark:hover:border-primary transition-all cursor-pointer shadow-sm"
                 >
                   {t.auth.vipLabel}
                 </button>
               </div>
               
               <div className="relative mb-4 mt-6">
                 <div className="absolute inset-0 flex items-center">
                   <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                 </div>
                 <div className="relative flex justify-center text-[10px]">
                   <span className="bg-slate-50 dark:bg-slate-950 px-2 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                     {t.auth.partnerStoreOwners}
                   </span>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                 <button 
                   type="button" 
                   onClick={() => { setEmail('bytezone@example.com'); setPassword('1234'); }}
                   className="p-2.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white hover:border-indigo-500 dark:hover:border-indigo-600 transition-all cursor-pointer shadow-sm"
                 >
                   ByteZone
                 </button>
                 <button 
                   type="button" 
                   onClick={() => { setEmail('smartlife@example.com'); setPassword('1234'); }}
                   className="p-2.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600 dark:hover:text-white hover:border-sky-500 dark:hover:border-sky-600 transition-all cursor-pointer shadow-sm"
                 >
                   SmartLife
                 </button>
                 <button 
                   type="button" 
                   onClick={() => { setEmail('campus@example.com'); setPassword('1234'); }}
                   className="p-2.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 dark:hover:text-white hover:border-amber-500 dark:hover:border-amber-600 transition-all cursor-pointer shadow-sm"
                 >
                   Campus
                 </button>
                 <button 
                   type="button" 
                   onClick={() => { setEmail('cozy@example.com'); setPassword('1234'); }}
                   className="p-2.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-rose-400 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white hover:border-rose-400 dark:hover:border-rose-500 transition-all cursor-pointer shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold tracking-tight flex items-center gap-2 uppercase text-slate-900 dark:text-white">
                <KeyRound className="h-5 w-5 text-primary" />
                {t.auth.resetPassword}
              </h3>
              <button onClick={closeResetModal} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
                <X className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </button>
            </div>
            
            <div className="p-8 bg-white dark:bg-slate-900">
              {resetStep === "email" && (
                <form onSubmit={handleRequestOtp} className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {t.auth.resetEmailDesc}
                  </p>
                  {resetError && (
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                      <p className="text-rose-600 dark:text-rose-400 text-xs font-bold text-center uppercase tracking-tight">
                        {resetError}
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 ml-1">{t.auth.email}</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-primary transition-colors" />
                      <input
                        type="email"
                        required
                        placeholder={t.auth.emailPlaceholder}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 outline-none transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    {t.auth.sendOtp}
                  </button>
                </form>
              )}

              {resetStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {t.auth.resetOtpDesc.replace('{phone}', resetEmail)}
                  </p>
                  {resetError && (
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                      <p className="text-rose-600 dark:text-rose-400 text-xs font-bold text-center uppercase tracking-tight">
                        {resetError}
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 ml-1">{t.auth.otp}</label>
                    <input
                      type="text"
                      required
                      placeholder={t.auth.otpPlaceholder}
                      maxLength={6}
                      className="w-full px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 outline-none transition-all font-bold text-center text-3xl tracking-[0.4em] text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    {t.auth.verifyOtpTitle}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetStep("email")}
                    className="w-full text-xs text-slate-400 dark:text-slate-500 font-bold hover:text-primary dark:hover:text-primary transition-colors cursor-pointer"
                  >
                    {t.auth.backToEmail}
                  </button>
                </form>
              )}

              {resetStep === "password" && (
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {t.auth.otpVerifiedDesc}
                  </p>
                  {resetError && (
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                      <p className="text-rose-600 dark:text-rose-400 text-xs font-bold text-center uppercase tracking-tight">
                        {resetError}
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 ml-1">{t.auth.newPassword}</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-primary transition-colors" />
                      <input
                        type="password"
                        required
                        placeholder={t.auth.passPlaceholder}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 outline-none transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    {t.auth.updatePassword}
                  </button>
                </form>
              )}

              {resetStep === "success" && (
                <div className="py-10 text-center space-y-5 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="inline-flex p-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2 border border-emerald-100 dark:border-emerald-500/20 shadow-inner">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">{t.auth.resetSuccess}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {t.auth.resetSuccessDesc}
                    </p>
                  </div>
                  <button
                    onClick={closeResetModal}
                    className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-md mt-6"
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
