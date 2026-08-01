import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import { useMember } from "../context/MemberContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { motion, AnimatePresence } from "framer-motion";

export default function MemberLogin() {
  const { login } = useMember();
  const navigate = useNavigate();
  
  const [tab, setTab] = useState("login"); // "login" or "register"
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const [googleClientId, setGoogleClientId] = useState("874744414734-mockclientid.apps.googleusercontent.com");
  
  useEffect(() => {
    API.get("/settings")
      .then((res) => {
        if (res.data.google_client_id) {
          setGoogleClientId(res.data.google_client_id);
        }
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
      });
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (gsiLoaded && window.google) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          handleGoogleSSOLogin(response.credential);
        }
      });
    }
  }, [gsiLoaded, googleClientId]);

  // OTP Verification States
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpPurpose, setOtpPurpose] = useState("registration"); // "registration" or "password_reset"
  const [otpEmail, setOtpEmail] = useState("");

  // Forgot Password Steps: 0 = not forgot, 1 = enter email, 2 = enter otp (uses showOtp), 3 = enter new password
  const [forgotStep, setForgotStep] = useState(0);
  const [newPassword, setNewPassword] = useState("");

  // Tab state listener: we need to re-render the google login button because switching tabs unmounts and remounts the element.
  useEffect(() => {
    const btn = document.getElementById("google-signin-btn");
    if (gsiLoaded && window.google && btn) {
      window.google.accounts.id.renderButton(
        btn,
        { theme: "outline", size: "large", width: "100%", shape: "pill" }
      );
    }
  }, [gsiLoaded, tab, showOtp, forgotStep]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (tab === "login") {
        const res = await API.post("/members/login", { email: form.email, password: form.password });
        login(res.data);
        navigate("/profile");
      } else {
        const res = await API.post("/members/register", form);
        setOtpEmail(form.email);
        setOtpPurpose("registration");
        setShowOtp(true);
        if (res.data.dev_otp) {
          // Dev OTP on-screen helper removed for production launch
        }
      }
    } catch (e) {
      if (e.response?.data?.status === "Pending Verification") {
        setOtpEmail(form.email);
        setOtpPurpose("registration");
        setShowOtp(true);
        setError("Account registration is pending OTP verification. Please enter the OTP sent to your email.");
      } else {
        setError(e.response?.data?.error || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await API.post("/members/verify-otp", {
        email: otpEmail,
        otp: otpCode,
        purpose: otpPurpose
      });

      if (otpPurpose === "registration") {
        setShowOtp(false);
        setTab("login");
        setSuccess("Account activated successfully! You can now log in securely.");
        setOtpCode("");
      } else if (otpPurpose === "password_reset") {
        setShowOtp(false);
        setForgotStep(3); // Direct to password reset view
        setOtpCode("");
      }
    } catch (e) {
      setError(e.response?.data?.error || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await API.post("/members/resend-otp", {
        email: otpEmail,
        purpose: otpPurpose
      });
      setSuccess(`A new OTP has been sent!`);
      if (res.data.dev_otp) {
        setSuccess(`A new OTP has been sent! Code: ${res.data.dev_otp}`);
      }
    } catch (e) {
      setError(e.response?.data?.error || "Failed to resend OTP");
    }
  };

  const handleForgotPasswordRequest = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await API.post("/members/forgot-password", { email: otpEmail });
      setOtpPurpose("password_reset");
      setForgotStep(2); // Go to OTP verification step
      setShowOtp(true);
      if (res.data.dev_otp) {
        setSuccess(`Reset OTP generated: ${res.data.dev_otp}`);
      }
    } catch (e) {
      setError(e.response?.data?.error || "Email address not found");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await API.post("/members/reset-password", {
        email: otpEmail,
        newPassword: newPassword
      });
      setForgotStep(0);
      setTab("login");
      setSuccess(res.data.message);
      setNewPassword("");
    } catch (e) {
      setError(e.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSSOLogin = async (idToken) => {
    setGoogleLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await API.post("/members/google-sso", {
        idToken: idToken
      });
      
      login(res.data);
      setShowGoogleModal(false);
      navigate("/profile");
    } catch (e) {
      setError(e.response?.data?.error || "Google SSO Login Failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const MOCK_GOOGLE_PROFILES = [
    { name: "Olive Seeds", email: "olive.seeds.design@gmail.com", avatar: "🌱", sub: "google-oauth2|1001" },
    { name: "Oliver Smith", email: "oliver.smith.tech@gmail.com", avatar: "💻", sub: "google-oauth2|1002" },
    { name: "John Doe", email: "john.doe.creative@gmail.com", avatar: "🎨", sub: "google-oauth2|1003" }
  ];

  return (
    <div style={{ background: "#FAF9F6", color: "#0D1512", fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen flex flex-col justify-between overflow-hidden">
      <SEO 
        title="Secure Member Access" 
        description="Log in to your Olive Seeds dashboard to monitor physical order tracking, download your digital assets, and update profile settings with active OTP security." 
        keywords="login, client login, sso google login, account register, physical order tracking, secure access, otp security"
      />
      <Navbar />

      <div className="max-w-md w-full mx-auto px-4 py-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)", color: "#0D1512" }}
          className="border rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden"
        >
          {/* Top Decorative Line */}
          <div style={{ background: "linear-gradient(90deg, #0D1512, #2d5a4e, #0D1512)" }} className="absolute top-0 left-0 right-0 h-1.5" />

          {/* 1. RENDER OTP SCREEN */}
          {showOtp ? (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-3xl font-black text-center mb-1">Enter OTP Code</h2>
              <p className="text-xs text-stone-500 text-center mb-8">
                We sent a secure verification code to <span className="text-[#0D1512] font-bold">{otpEmail}</span>
              </p>

              {error && (
                <div className="text-xs px-4 py-3 rounded-xl mb-4 border font-semibold bg-red-500/10 text-red-700 border-red-500/20">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-xs px-4 py-3 rounded-xl mb-4 border font-semibold bg-green-500/10 text-green-700 border-green-500/20">
                  {success}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 block">6-Digit Verification Code</label>
                  <input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    style={{ borderColor: "rgba(27, 57, 49, 0.2)" }}
                    className="w-full text-center tracking-[0.5em] font-black border bg-stone-50 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                  />
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otpCode.length < 6}
                  style={{ background: "#0D1512", color: "#FAF9F6" }}
                  className="w-full rounded-xl py-4 text-xs font-black tracking-wider uppercase shadow-lg active:scale-95 transition-all mt-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? "Verifying..." : "Verify OTP Code"}
                </button>

                <div className="flex justify-between items-center mt-4">
                  <button 
                    onClick={handleResendOtp}
                    className="text-xs text-[#0D1512] hover:underline font-bold transition"
                  >
                    Resend OTP Code
                  </button>
                  <button 
                    onClick={() => { setShowOtp(false); setForgotStep(0); setError(""); setSuccess(""); }}
                    className="text-xs text-stone-400 hover:text-stone-600 transition"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </div>
          ) : forgotStep === 1 ? (
            /* 2. RENDER FORGOT PASSWORD - ENTER EMAIL SCREEN */
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-3xl font-black text-center mb-1">Reset Password</h2>
              <p className="text-xs text-stone-500 text-center mb-8">
                Enter your account email to receive a recovery OTP code
              </p>

              {error && (
                <div className="text-xs px-4 py-3 rounded-xl mb-4 border font-semibold bg-red-500/10 text-red-700 border-red-500/20">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{ borderColor: "rgba(27, 57, 49, 0.2)" }}
                    className="w-full border bg-stone-50 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                  />
                </div>

                <button
                  onClick={handleForgotPasswordRequest}
                  disabled={loading || !otpEmail}
                  style={{ background: "#0D1512", color: "#FAF9F6" }}
                  className="w-full rounded-xl py-4 text-xs font-black tracking-wider uppercase shadow-lg active:scale-95 transition-all mt-2 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Request Reset OTP"}
                </button>

                <button 
                  onClick={() => { setForgotStep(0); setError(""); setSuccess(""); }}
                  className="text-center text-xs text-stone-400 hover:text-stone-600 mt-2 transition font-bold"
                >
                  Cancel Recovery
                </button>
              </div>
            </div>
          ) : forgotStep === 3 ? (
            /* 3. RENDER NEW PASSWORD CREATION SCREEN */
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-3xl font-black text-center mb-1">New Password</h2>
              <p className="text-xs text-stone-500 text-center mb-8">
                Choose a strong new password for your account
              </p>

              {error && (
                <div className="text-xs px-4 py-3 rounded-xl mb-4 border font-semibold bg-red-500/10 text-red-700 border-red-500/20">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 block">New Security Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ borderColor: "rgba(27, 57, 49, 0.2)" }}
                    className="w-full border bg-stone-50 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                  />
                </div>

                <button
                  onClick={handleResetPassword}
                  disabled={loading || newPassword.length < 6}
                  style={{ background: "#0D1512", color: "#FAF9F6" }}
                  className="w-full rounded-xl py-4 text-xs font-black tracking-wider uppercase shadow-lg active:scale-95 transition-all mt-2 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Password & Login"}
                </button>
              </div>
            </div>
          ) : (
            /* 4. RENDER GENERAL LOGIN / REGISTER SCREEN */
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-3xl font-black text-center mb-1">
                {tab === "login" ? "Welcome Back" : "Join The Studio"}
              </h2>
              <p className="text-xs text-stone-500 text-center mb-8">
                {tab === "login" ? "Access files, tracking status, and profiles" : "Get started with custom digital and physical products"}
              </p>

              <div className="flex mb-6 bg-stone-100 p-1 rounded-xl border border-stone-200">
                {["login", "register"].map((t) => (
                  <button 
                    key={t} 
                    onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                    className={`flex-1 py-2 text-xs font-bold capitalize rounded-lg transition-all duration-300
                      ${tab === t ? "bg-white text-stone-900 shadow-md" : "text-stone-400 hover:text-stone-600"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs px-4 py-3 rounded-xl mb-4 border font-semibold bg-red-500/10 text-red-700 border-red-500/20"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs px-4 py-3 rounded-xl mb-4 border font-semibold bg-green-500/10 text-green-700 border-green-500/20"
                >
                  {success}
                </motion.div>
              )}

              <div className="flex flex-col gap-4">
                {tab === "register" && (
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 block">Full Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      style={{ borderColor: "rgba(27, 57, 49, 0.2)" }}
                      className="w-full border bg-stone-50 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                    />
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    style={{ borderColor: "rgba(27, 57, 49, 0.2)" }}
                    className="w-full border bg-stone-50 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                  />
                </div>
                {tab === "register" && (
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 block">Phone Number</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      style={{ borderColor: "rgba(27, 57, 49, 0.2)" }}
                      className="w-full border bg-stone-50 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                    />
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Password</label>
                    {tab === "login" && (
                      <button 
                        onClick={() => { setForgotStep(1); setOtpEmail(form.email); setError(""); setSuccess(""); }}
                        className="text-[10px] font-bold text-[#0D1512] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    style={{ borderColor: "rgba(27, 57, 49, 0.2)" }}
                    className="w-full border bg-stone-50 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                  />
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ background: "#0D1512", color: "#FAF9F6" }}
                  className="w-full rounded-xl py-4 text-xs font-black tracking-wider uppercase shadow-lg active:scale-95 transition-all mt-2"
                >
                  {loading ? "Processing..." : tab === "login" ? "Sign In Securely" : "Create Account & Send OTP"}
                </button>

                {/* Separator */}
                <div className="flex items-center gap-3 my-2 text-stone-400 text-[10px] uppercase font-bold tracking-widest">
                  <div className="flex-1 h-px bg-stone-200" />
                  <span>Or Continue With</span>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>

                {/* Google Single Sign-On Button */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }} className="w-full">
                  <div id="google-signin-btn" className="w-full flex justify-center" />
                  <p className="text-[9px] text-center text-stone-400">
                    Connects securely using official Google Identity endpoints
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
