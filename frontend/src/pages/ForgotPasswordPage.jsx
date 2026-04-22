import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const { forgotPassword, resetPassword } = useAuthStore();
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await forgotPassword(emailOrPhone);
    setIsLoading(false);
    if (success) setIsSent(true);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("Password must be 6+ characters");
    
    setIsLoading(true);
    const success = await resetPassword({ emailOrPhone, otp, newPassword });
    setIsLoading(false);
    if (success) navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1E1F22] p-4 font-sans antialiased">
      <div className="w-full max-w-[480px] bg-[#313338] rounded-md p-8 shadow-2xl animate-in fade-in duration-300">
        {!isSent ? (
          <>
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Forgot Password?</h1>
              <p className="text-[#B5BAC1] text-base font-normal">
                No worries! Enter your Phone or Email and we'll send you a reset code.
              </p>
            </div>

            <form onSubmit={handleRequestReset} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[12px] font-bold uppercase tracking-wider text-[#B5BAC1]">
                  Phone No / Email <span className="text-[#F23F42]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="friend@example.com or +123456789"
                  className="w-full px-3 py-2.5 bg-[#1E1F22] border-none rounded-[3px] focus:ring-1 focus:ring-[#5865F2] outline-none text-[#DBDEE1] font-medium transition-all"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#5865F2] text-white font-semibold rounded-[3px] hover:bg-[#4752C4] transition-all flex items-center justify-center disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Send Reset Code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Reset Password</h1>
              <p className="text-[#B5BAC1] text-base font-normal">
                Check your terminal for the reset code.
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[12px] font-bold uppercase tracking-wider text-[#B5BAC1]">
                  Reset Code <span className="text-[#F23F42]">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-3 py-2.5 bg-[#1E1F22] border-none rounded-[3px] focus:ring-1 focus:ring-[#5865F2] outline-none text-[#DBDEE1] text-center font-bold tracking-widest transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold uppercase tracking-wider text-[#B5BAC1]">
                  New Password <span className="text-[#F23F42]">*</span>
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2.5 bg-[#1E1F22] border-none rounded-[3px] focus:ring-1 focus:ring-[#5865F2] outline-none text-[#DBDEE1] font-medium transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#23A559] text-white font-semibold rounded-[3px] hover:bg-[#1A8244] transition-all flex items-center justify-center disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Update Password"}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 flex justify-center">
          <Link to="/login" className="flex items-center gap-1 text-[14px] font-medium text-[#00A8FC] hover:underline">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
