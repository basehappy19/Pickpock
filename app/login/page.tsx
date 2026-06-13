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
      setError("Invalid email or password. All passwords are '1234'");
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
        setResetError(data.error || "Failed to send OTP");
      }
    } catch (e) {
      setResetError("Network error");
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
        setResetError(data.error || "Failed to reset password");
      }
    } catch (e) {
      setResetError("Network error");
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
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-700">
      <div className="w-full max-w-md space-y-8 bg-card border-2 border-primary/10 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl shadow-primary/5">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 mb-4">
             <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">MSU <span className="text-primary">FOUNDER</span></h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">{t.nav.login}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="email" 
                required
                placeholder="you@example.com"
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs text-primary font-black hover:underline ml-1"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <p className="text-rose-500 text-xs font-black text-center uppercase tracking-tight">{error}</p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <LogIn className="h-6 w-6" />}
            LOGIN TO MALL
          </button>
        </form>

        <div className="pt-6 border-t border-muted text-center space-y-4">
           <p className="text-xs text-muted-foreground font-bold italic">
             Demo accounts (Password: 1234): <br/>
             Founder: alice@example.com <br/>
             Customer: somchai@example.com
           </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-md rounded-2xl border-2 border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-rainbow-gradient border-b flex justify-between items-center">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2 uppercase tracking-tighter">
                <KeyRound className="h-5 w-5 text-primary" />
                Reset Password
              </h3>
              <button onClick={closeResetModal} className="p-2 hover:bg-black/5 rounded-full cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {resetStep === "phone" && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter your registered phone number to receive a verification code.
                  </p>
                  {resetError && (
                    <p className="text-rose-500 text-xs font-black text-center uppercase tracking-tight bg-rose-50 rounded-xl p-3">
                      {resetError}
                    </p>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="tel"
                        required
                        placeholder="08X-XXX-XXXX"
                        className="w-full pl-12 pr-6 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                        value={resetPhone}
                        onChange={(e) => setResetPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                    Send OTP Code
                  </button>
                </form>
              )}

              {resetStep === "otp" && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    We've sent an OTP to <span className="font-bold text-primary">{resetPhone}</span>. (Demo OTP: 123456)
                  </p>
                  {resetError && (
                    <p className="text-rose-500 text-xs font-black text-center uppercase tracking-tight bg-rose-50 rounded-xl p-3">
                      {resetError}
                    </p>
                  )}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Verification Code (OTP)</label>
                      <input
                        type="text"
                        required
                        placeholder="123456"
                        maxLength={6}
                        className="w-full px-6 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-black text-center text-2xl tracking-[1em]"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          className="w-full pl-12 pr-6 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetStep("phone")}
                    className="w-full text-xs text-muted-foreground font-bold hover:text-primary transition-colors"
                  >
                    Back to change phone number
                  </button>
                </form>
              )}

              {resetStep === "success" && (
                <div className="py-8 text-center space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <h4 className="text-xl font-black">Success!</h4>
                  <p className="text-sm text-muted-foreground font-bold">
                    Your password has been updated successfully. You can now log in with your new password.
                  </p>
                  <button
                    onClick={closeResetModal}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-xl shadow-primary/20 hover:opacity-90 transition-all cursor-pointer"
                  >
                    Return to Login
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
