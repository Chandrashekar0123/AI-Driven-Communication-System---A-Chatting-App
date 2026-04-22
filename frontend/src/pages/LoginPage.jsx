import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1E1F22] p-4 font-sans antialiased">
      <div className="w-full max-w-[480px] bg-[#313338] rounded-md p-8 shadow-2xl animate-in fade-in duration-300">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Welcome back!</h1>
          <p className="text-[#B5BAC1] text-base font-normal">
            We're so excited to see you again!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#B5BAC1]">
              Phone No / Email <span className="text-[#F23F42]">*</span>
            </label>
            <input
              type="text"
              placeholder="friend@example.com or +123456789"
              className="w-full px-3 py-2.5 bg-[#1E1F22] border-none rounded-[3px] focus:ring-1 focus:ring-[#5865F2] outline-none text-[#DBDEE1] font-medium transition-all"
              value={formData.emailOrPhone}
              onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#B5BAC1]">
              Password <span className="text-[#F23F42]">*</span>
            </label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2.5 bg-[#1E1F22] border-none rounded-[3px] focus:ring-1 focus:ring-[#5865F2] outline-none text-[#DBDEE1] font-medium transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#949BA4] hover:text-[#DBDEE1] transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <div className="text-left mt-2">
              <Link to="/forgot-password" size="sm" className="text-[14px] font-medium text-[#00A8FC] hover:underline">
                Forgot your password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#5865F2] text-white font-semibold rounded-[3px] hover:bg-[#4752C4] transition-all flex items-center justify-center disabled:opacity-50"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? <Loader2 className="size-5 animate-spin" /> : "Log In"}
          </button>
        </form>

        <div className="mt-4">
          <p className="text-[#949BA4] text-[14px]">
            Need an account?{" "}
            <Link to="/signup" className="text-[#00A8FC] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
