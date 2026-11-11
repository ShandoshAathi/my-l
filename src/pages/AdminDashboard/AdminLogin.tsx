import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Key, AlertCircle, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onSendOtp: (email: string) => Promise<{ isDemo: boolean; demoCode?: string }>;
  onVerifyOtp: (email: string, code: string) => Promise<boolean>;
  onSetPassword: (password: string) => Promise<void>;
  isConfigured: boolean;
}

type AuthMode = 'otp_setup' | 'password_login';
type OtpStep = 'enter_email' | 'enter_otp' | 'set_password';

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLogin,
  onSendOtp,
  onVerifyOtp,
  onSetPassword,
  isConfigured
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>('otp_setup');
  const [otpStep, setOtpStep] = useState<OtpStep>('enter_email');

  // Fields
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await onSendOtp(email.trim());
      if (res.isDemo && res.demoCode) {
        setDemoNotice(`Demo mode active: Your verification OTP is: ${res.demoCode}`);
        setOtpCode(res.demoCode);
      }
      setSuccessMsg(`A 6-digit verification code was sent to ${email.trim()}`);
      setOtpStep('enter_otp');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setError('Please enter the full 6-digit verification code');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const verified = await onVerifyOtp(email.trim(), otpCode.trim());
      if (verified) {
        setSuccessMsg('Email verified successfully! Now set your secret admin password.');
        setOtpStep('set_password');
      } else {
        setError('Invalid OTP code. Please check and try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid OTP code';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set Password & Enter
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await onSetPassword(newPassword);
      setSuccessMsg('Admin credentials created! Opening your surprise vault...');
      // Allow parent session watcher to recognize user
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Standard Password Sign In
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !loginPassword) {
      setError('Please enter both email and password');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await onLogin(email.trim(), loginPassword);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-pastel-blush via-white to-pastel-pink/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl glass-card p-7 sm:p-9 shadow-glass border border-pastel-pink/50 relative overflow-hidden"
      >
        {/* Soft background aura */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-pink/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pastel-purple/30 rounded-full blur-2xl pointer-events-none" />

        {/* Header Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-pastel-rose to-pastel-purple text-white shadow-glow-rose mb-4">
          <Lock className="h-7 w-7" />
        </div>

        <h2 className="text-center font-heading text-2xl sm:text-3xl font-bold text-gray-800">
          Admin Gift Vault
        </h2>
        <p className="text-center font-anime text-xs sm:text-sm text-gray-500 mt-1 mb-5">
          Customize photos, love letters, songs & secret gift links
        </p>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-pastel-pink/20 p-1 mb-6 border border-pastel-pink/40">
          <button
            type="button"
            onClick={() => {
              setAuthMode('otp_setup');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'otp_setup'
                ? 'bg-white text-pastel-rose shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Email OTP & Setup
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('password_login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'password_login'
                ? 'bg-white text-pastel-rose shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Password Sign In
          </button>
        </div>

        {/* Supabase Status / Demo Pill */}
        {!isConfigured && (
          <div className="mb-4 rounded-2xl bg-amber-50/90 p-3 border border-amber-200 text-amber-800 text-xs leading-relaxed flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Offline / Local Demo Active</p>
              <p className="text-[11px] mt-0.5">
                Supabase credentials not detected in .env. Interactive demo OTP (123456) and local memory storage are ready!
              </p>
            </div>
          </div>
        )}

        {demoNotice && (
          <div className="mb-4 rounded-2xl bg-emerald-50 p-3 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{demoNotice}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 p-3 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && !error && (
          <div className="mb-4 rounded-2xl bg-pastel-blush p-3 border border-pastel-pink text-pastel-rose text-xs flex items-center gap-2 font-medium">
            <Sparkles className="h-4 w-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: EMAIL OTP & SET PASSWORD */}
        {authMode === 'otp_setup' && (
          <div>
            {/* 3-Step Progress Indicator */}
            <div className="flex items-center justify-between mb-6 px-4">
              <div className="flex flex-col items-center">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    otpStep === 'enter_email'
                      ? 'bg-pastel-rose text-white shadow-sm'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  1
                </div>
                <span className="text-[10px] font-anime mt-1 text-gray-500">Email</span>
              </div>
              <div className={`h-0.5 flex-1 mx-2 ${otpStep !== 'enter_email' ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              <div className="flex flex-col items-center">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    otpStep === 'enter_otp'
                      ? 'bg-pastel-rose text-white shadow-sm'
                      : otpStep === 'set_password'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  2
                </div>
                <span className="text-[10px] font-anime mt-1 text-gray-500">OTP</span>
              </div>
              <div className={`h-0.5 flex-1 mx-2 ${otpStep === 'set_password' ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              <div className="flex flex-col items-center">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    otpStep === 'set_password'
                      ? 'bg-pastel-rose text-white shadow-sm'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  3
                </div>
                <span className="text-[10px] font-anime mt-1 text-gray-500">Password</span>
              </div>
            </div>

            {/* Step 1 Form: Email */}
            {otpStep === 'enter_email' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-pastel-pink/50 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-pastel-rose focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pastel-rose to-pastel-purple shadow-glow-rose hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <span>Send 6-Digit OTP</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2 Form: Enter OTP */}
            {otpStep === 'enter_otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                      6-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpStep('enter_email')}
                      className="text-[11px] text-pastel-rose hover:underline"
                    >
                      Change Email
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-pastel-pink/50 bg-white/80 text-sm tracking-widest text-center font-mono font-bold focus:outline-none focus:ring-2 focus:ring-pastel-rose focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Check your inbox at <span className="font-medium text-gray-600">{email}</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pastel-rose to-pastel-purple shadow-glow-rose hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 3 Form: Set Password */}
            {otpStep === 'set_password' && (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Create Admin Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Key className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-pastel-pink/50 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-pastel-rose focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Key className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-pastel-pink/50 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-pastel-rose focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pastel-rose to-pastel-purple shadow-glow-rose hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Save Password & Open Vault</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODE 2: EXISTING PASSWORD LOGIN */}
        {authMode === 'password_login' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-pastel-pink/50 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-pastel-rose focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Key className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-pastel-pink/50 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-pastel-rose focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pastel-rose to-pastel-purple shadow-glow-rose hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp_setup');
                  setOtpStep('enter_email');
                }}
                className="text-xs text-pastel-rose hover:underline"
              >
                Forgot password or need to verify with OTP?
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
