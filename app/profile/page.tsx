"use client";

import { useRole } from "@/hooks/use-role";
import { useLanguage } from "@/hooks/use-language";
import { useState, useEffect } from "react";
import { User as UserIcon, Mail, Phone, Lock, ShieldCheck, Loader2, Save, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, updateUserInfo, logout } = useRole();
  const { t } = useLanguage();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      const fetchFullDetails = async () => {
        try {
          const res = await fetch("/api/users");
          if (res.ok) {
            const users = await res.json();
            const full = users.find((u: any) => u.id === user.id);
            if (full) {
              setPhone(full.phone || "");
            }
          }
        } catch (e) {
          console.error("Failed to fetch full user info", e);
        }
      };
      fetchFullDetails();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto p-8 text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="font-black uppercase tracking-widest text-muted-foreground">{t.profile.loginRequired}</p>
      </div>
    );
  }

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name,
          email,
          phone
        })
      });

      const data = await res.json();
      if (data.success) {
        updateUserInfo({ name, email });
        toast.success(t.profile.updateSuccess);
      } else {
        toast.error(data.error || t.profile.error);
      }
    } catch (e) {
      toast.error(t.profile.networkError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t.profile.passwordMismatch);
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(t.profile.passwordUpdateSuccess);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || t.profile.invalidOldPassword);
      }
    } catch (e) {
      toast.error(t.profile.passwordUpdateError);
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter uppercase">{t.profile.title}</h1>
        <p className="text-muted-foreground font-bold">{t.profile.subtitle}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 space-y-6">
          <div className="flex items-center gap-4 border-b pb-6 mb-2">
             <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-2xl text-primary uppercase">
               {user.name.charAt(0)}
             </div>
             <div>
               <h3 className="text-xl font-black tracking-tight">{user.name}</h3>
               <p className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck className="h-3 w-3 text-primary" /> {user.role} • {user.tier}
               </p>
             </div>
          </div>

          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.profile.fullName}</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none font-bold text-sm transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.profile.email}</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none font-bold text-sm transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.profile.phone}</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="tel" 
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none font-bold text-sm transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full h-14 mt-4 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {t.dashboard.saveChanges}
            </button>
          </form>
        </div>

        <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 space-y-6">
          <h3 className="text-xl font-black tracking-tight uppercase flex items-center gap-2 border-b pb-6 mb-2">
            <Lock className="h-5 w-5 text-primary" /> {t.profile.changePasswordTitle}
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.profile.currentPassword}</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none font-bold text-sm transition-all"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1 pt-2 border-t border-dashed">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.profile.newPassword}</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none font-bold text-sm transition-all"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.profile.confirmNewPassword}</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none font-bold text-sm transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={isChangingPass}
              className="w-full h-14 mt-4 rounded-xl bg-secondary font-black uppercase tracking-widest shadow-lg hover:bg-secondary/80 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isChangingPass ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
              {t.profile.updatePasswordBtn}
            </button>
          </form>

          <div className="pt-8 mt-4 border-t">
             <button 
                onClick={() => logout()}
                className="w-full h-14 rounded-xl border-2 border-rose-500/20 text-rose-500 font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
             >
                <LogOut className="h-5 w-5" /> {t.profile.logout}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
