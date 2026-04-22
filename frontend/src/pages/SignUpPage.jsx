import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    emailOrPhone: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.emailOrPhone.trim()) return toast.error("Phone number or Email is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) signup(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1E1F22] p-4 font-sans antialiased">
      <div className="w-full max-w-[480px] bg-[#313338] rounded-md p-8 shadow-2xl animate-in fade-in duration-300">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Create an account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#B5BAC1]">
              Full Name <span className="text-[#F23F42]">*</span>
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-3 py-2.5 bg-[#1E1F22] border-none rounded-[3px] focus:ring-1 focus:ring-[#5865F2] outline-none text-[#DBDEE1] font-medium transition-all"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

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
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#5865F2] text-white font-semibold rounded-[3px] hover:bg-[#4752C4] transition-all flex items-center justify-center disabled:opacity-50"
            disabled={isSigningUp}
          >
            {isSigningUp ? <Loader2 className="size-5 animate-spin" /> : "Continue"}
          </button>
        </form>

        <div className="mt-4">
          <p className="text-[#00A8FC] text-[14px]">
            <Link to="/login" className="hover:underline">
              Already have an account?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
