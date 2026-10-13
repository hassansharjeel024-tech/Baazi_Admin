import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { login } from "../services/authService";

function LoginScreen() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{
        backgroundColor: "#0F111A",
        backgroundImage: "linear-gradient(180deg, #0F111A 0%, #3B82F6 100%)",
      }}
    >
      {/* Dot texture overlay — CSS-generated, fades out vertically like the Figma asset */}
    {/* Dot texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.18) 1.5px, transparent 1.5px)",
          backgroundSize: "27px 27px",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 10%, transparent 55%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 10%, transparent 55%)",
        }}
      />

      <div
  className="w-full flex flex-col gap-8 relative z-10"
  style={{
    maxWidth: "440px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
    backgroundColor: "rgba(59,130,246,0.13)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    paddingTop: "52px",
    paddingRight: "32px",
    paddingBottom: "32px",
    paddingLeft: "32px",
  }}
>
        <div>
          <h1 className="text-white font-bold text-2xl mb-1">Welcome Back</h1>
          <p className="text-gray-400 text-sm">
            Sign in to manage the gaming ecosystem.
          </p>
        </div>

        <div className="flex flex-col gap-4 -mt-4">
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide block mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or phone"
                className="w-full text-white text-sm pl-10 pr-4 py-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                style={{
                  backgroundColor: "#091E46",
                  border: "1px solid rgba(139,145,158,0.20)",
                  borderRadius: "12px",
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                Password
              </label>
              <a href="#" className="text-white text-xs font-medium hover:underline">
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full text-white text-sm pl-10 pr-10 py-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                style={{
                  backgroundColor: "#091E46",
                  border: "1px solid rgba(139,145,158,0.20)",
                  borderRadius: "12px",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span
              onClick={() => setRememberSession(!rememberSession)}
              className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${
                rememberSession ? "bg-yellow-400 justify-end" : "bg-gray-600 justify-start"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white block" />
            </span>
            <span className="text-gray-300 text-sm">Remember this session</span>
          </label>

          {error && (
            <p className="text-red-400 text-sm -mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-purple-900 font-bold text-sm rounded-lg hover:brightness-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#DBE21C",
              borderRadius: "12px",
              paddingTop: "16px",
              paddingBottom: "16px",
              boxShadow: "0px 4px 20px 0px rgba(0,255,135,0.30)",
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In 🚀"
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-xs uppercase tracking-wide">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            type="button"
            className="w-full text-white font-medium text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            style={{
              backgroundColor: "#091E46",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              paddingTop: "20px",
              paddingBottom: "20px",
              paddingRight: "17.31px",
              paddingLeft: "17.3px",
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
        </div>
      </div>
    </form>
  );
}

export default LoginScreen;