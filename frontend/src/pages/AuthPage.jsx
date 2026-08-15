import { useState, useRef, useEffect } from 'react';
import {
  setupRecaptcha,
  sendFirebaseOtp,
  signInWithGoogle,
  exchangeFirebaseToken,
  completeRegistration,
  completeGoogleRegistration,
  sendEmailOtp,
  verifyEmailOtp,
} from '../services/authService';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

const PETALS = ['🌸','🌺','🌼','🌷','💐','🌹'];
function Petals() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 16 }).map((_, i) => (
        <span key={i} className="absolute opacity-[0.07] animate-bounce select-none"
          style={{ left:`${(i*19+3)%100}%`, top:`${(i*27+8)%88}%`, fontSize:`${20+(i%4)*10}px`, animationDelay:`${i*0.35}s`, animationDuration:`${2.5+(i%3)*0.8}s` }}
        >{PETALS[i%PETALS.length]}</span>
      ))}
    </div>
  );
}

function SocialFooter({ onGoogleLogin }) {
  return (
    <>
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 whitespace-nowrap">or continue with</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <button onClick={onGoogleLogin}
        className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
        <GoogleIcon /> LOGIN WITH GOOGLE
      </button>
    </>
  );
}

function StepBar({ total, current }) {
  return (
    <div className="flex gap-1.5 mb-7">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= current ? 'bg-[#1a6b8a]' : 'bg-gray-200'}`} />
      ))}
    </div>
  );
}

// ── STEP 0: Enter mobile ───────────────────────────────────────────────────
function StepMobile({ onNext, onGoogleLogin, onUserStatus }) {
  const [mobile, setMobile] = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [userStatus, setUserStatus] = useState(null); // null | 'new' | 'existing'

  // Check if mobile is registered when 10 digits entered
  useEffect(() => {
    if (mobile.length === 10) {
      fetch(`http://localhost:8080/api/auth/check-mobile?mobile=${mobile}`)
        .then(r => r.json())
        .then(d => {
          const exists = d?.data?.exists ?? false;
          setUserStatus(exists ? 'existing' : 'new');
          onUserStatus(exists ? 'existing' : 'new');
        })
        .catch(() => { setUserStatus(null); onUserStatus(null); });
    } else {
      setUserStatus(null);
      onUserStatus(null);
    }
  }, [mobile]);

  const handleNext = async () => {
    setError('');
    if (mobile.length !== 10) { setError('Enter a valid 10-digit mobile number.'); return; }
    setLoading(true);
    try {
      setupRecaptcha('recaptcha-container');
      const confirmation = await sendFirebaseOtp(mobile);
      onNext(mobile, confirmation);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      if (window.recaptchaVerifier) { window.recaptchaVerifier.clear(); window.recaptchaVerifier = null; }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Login or Sign up</h2>
      <p className="text-sm text-gray-400 mb-6">Welcome back! Please enter your mobile number.</p>

      <label className="block text-sm font-medium text-gray-600 mb-1.5">Mobile Number</label>
      <div className={`flex border rounded-lg overflow-hidden transition focus-within:ring-2 ${error ? 'border-red-400 focus-within:ring-red-200' : 'border-gray-300 focus-within:border-[#1a6b8a] focus-within:ring-[#1a6b8a]/20'}`}>
        <div className="flex items-center gap-1.5 px-3 bg-gray-50 border-r border-gray-200 text-sm text-gray-700 flex-shrink-0 select-none">
          <span>🇮🇳</span><span className="font-semibold">+91</span>
        </div>
        <input type="tel" value={mobile} autoFocus
          onChange={e => { setMobile(e.target.value.replace(/\D/g,'').slice(0,10)); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleNext()}
          placeholder="Enter 10-digit mobile number"
          className="flex-1 px-4 py-3 text-sm outline-none bg-white"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      {!error && userStatus === 'existing' && <p className="text-xs text-green-600 mt-1.5 font-medium">✅ Existing account found — logging you in</p>}
      {!error && userStatus === 'new'      && <p className="text-xs text-amber-600 mt-1.5 font-medium">📱 New account will be created for this number</p>}
      <div id="recaptcha-container" />

      <button onClick={handleNext} disabled={loading}
        className="w-full mt-4 bg-[#1a6b8a] hover:bg-[#155a75] disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold py-3 rounded-lg text-sm tracking-widest transition-all">
        {loading ? 'Sending OTP…' : 'SEND OTP'}
      </button>
      <SocialFooter onGoogleLogin={onGoogleLogin} />
    </div>
  );
}

// ── STEP 1: OTP Verification ───────────────────────────────────────────────
function StepOTP({ mobile, confirmation, isLogin, onBack, onNext, onResend }) {
  const [otp, setOtp]     = useState(['','','','','','']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const refs = useRef([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next); setError('');
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };
  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (paste.length === 6) { setOtp(paste.split('')); refs.current[5]?.focus(); }
  };

  const handleSubmit = async () => {
    const entered = otp.join('');
    if (entered.length < 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    try {
      const result = await confirmation.confirm(entered);
      const idToken = await result.user.getIdToken();
      const userData = await exchangeFirebaseToken(idToken);
      onNext(userData, idToken);
    } catch { setError('Invalid OTP. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setTimer(30); setOtp(['','','','','','']); setError(''); setLoading(true);
    try {
      setupRecaptcha('recaptcha-container-otp');
      const nc = await sendFirebaseOtp(mobile);
      onResend(nc);
    } catch (err) { setError(err.message || 'Failed to resend OTP.'); }
    finally { setLoading(false); refs.current[0]?.focus(); }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-600 text-lg">←</button>
        <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
      </div>
      <p className="text-sm text-gray-400 mb-5 ml-11">OTP sent to <span className="font-semibold text-gray-700">+91 {mobile}</span></p>

      <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-1 bg-gray-50">
        <div className="flex items-center gap-1.5 px-3 border-r border-gray-200 text-sm text-gray-600 flex-shrink-0">
          <span>🇮🇳</span><span className="font-semibold">+91</span>
        </div>
        <input value={mobile} readOnly className="flex-1 px-4 py-2.5 text-sm bg-gray-50 text-gray-600 cursor-default outline-none" />
      </div>
      {isLogin === true  && <p className="text-xs text-green-600 mt-1.5 mb-3 font-medium">✅ Existing account found — logging you in</p>}
      {isLogin === false && <p className="text-xs text-amber-600 mt-1.5 mb-3 font-medium">📱 New account will be created for this number</p>}

      <div id="recaptcha-container-otp" />

      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100 mb-4">
        <p className="text-sm font-semibold text-gray-700 text-center mb-5">Enter the 6-digit OTP</p>
        <div className="flex justify-center gap-2.5 mb-4" onPaste={handlePaste}>
          {otp.map((d, i) => (
            <input key={i} ref={el => refs.current[i] = el}
              type="text" inputMode="numeric" maxLength={1} value={d}
              onChange={e => handleChange(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all ${d ? 'border-[#1a6b8a] bg-[#1a6b8a]/5 text-[#1a6b8a]' : 'border-gray-300 bg-white'} focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20`}
            />
          ))}
        </div>
        {error && <p className="text-xs text-red-500 text-center mb-2">{error}</p>}
        <p className="text-center text-xs text-gray-400">
          Didn't receive OTP?{' '}
          {timer > 0
            ? <span className="text-gray-500 font-medium">Resend in {timer}s</span>
            : <button onClick={handleResend} className="text-[#1a6b8a] font-semibold hover:underline">Resend OTP</button>
          }
        </p>
      </div>

      <button onClick={handleSubmit} disabled={otp.join('').length < 6 || loading}
        className="w-full bg-[#1a6b8a] hover:bg-[#155a75] disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold py-3 rounded-lg text-sm tracking-widest transition-all">
        {loading ? 'Verifying…' : 'SUBMIT'}
      </button>
    </div>
  );
}

// ── STEP 2: Profile Details (new users) ───────────────────────────────────
function StepProfile({ userData, firebaseIdToken, onDone, onMoreClick }) {
  const genderFromTitle = t => t === 'Mr.' ? 'Male' : 'Female';
  const [form, setForm] = useState({ title: 'Mr.', name: '', dateOfBirth: '', email: '', agree: false });
  const [emailCode, setEmailCode]       = useState('');
  const [emailSent, setEmailSent]       = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailError, setEmailError]     = useState('');
  const [sendingCode, setSendingCode]   = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const handleSendEmailCode = async () => {
    setEmailError('');
    setSendingCode(true);
    try {
      await sendEmailOtp(form.email.trim().toLowerCase());
      setEmailSent(true);
    } catch (err) {
      setEmailError(err.message || 'Failed to send code. Try again.');
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    if (emailCode.length !== 6) { setEmailError('Enter the 6-digit code sent to your email.'); return; }
    try {
      await verifyEmailOtp(form.email.trim().toLowerCase(), emailCode);
      setEmailVerified(true);
      setEmailError('');
    } catch {
      setEmailError('Invalid or expired OTP. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('name'); return; }
    if (!form.agree) { setError('agree'); return; }
    setLoading(true);
    try {
      const gender = genderFromTitle(form.title);
      const data = await completeRegistration(firebaseIdToken, {
        name:        form.name.trim(),
        title:       form.title,
        gender,
        dateOfBirth: form.dateOfBirth || null,
        email:       form.email.trim().toLowerCase() || null,
      });
      onDone({ ...data, name: form.name.trim(), title: form.title, gender, dateOfBirth: form.dateOfBirth, email: form.email, emailVerified });
    } catch {
      onDone({ ...userData, name: form.name.trim() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Profile Details</h2>
      <p className="text-sm text-gray-400 mb-6">Tell us a little about yourself</p>

      {/* Title + Name */}
      <div className="flex gap-3 mb-4">
        <div className="w-28">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Title</label>
          <select value={form.title} onChange={e => set('title', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition bg-white">
            {['Mr.','Mrs.','Ms.'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name <span className="text-red-400">*</span></label>
          <input type="text" value={form.name} onChange={e => { set('name', e.target.value); setError(''); }}
            placeholder="Your full name"
            className={`w-full border rounded-lg px-4 py-3 text-sm outline-none transition focus:ring-2 ${error === 'name' ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-[#1a6b8a] focus:ring-[#1a6b8a]/20'}`}
          />
        </div>
      </div>
      {error === 'name' && <p className="text-xs text-red-500 -mt-2 mb-3">Please enter your full name.</p>}

      {/* Mobile — read only */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1.5">Mobile</label>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <span className="flex items-center gap-1 px-3 border-r border-gray-200 text-sm text-gray-500 select-none">🇮🇳 +91</span>
          <input value={userData?.mobileNumber || ''} readOnly className="flex-1 px-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
        </div>
      </div>

      {/* Email — optional with verify */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          Email <span className="text-gray-400 font-normal">(optional)</span>
          {emailVerified && <span className="ml-2 text-xs text-green-600 font-semibold">✅ Verified</span>}
        </label>
        <div className="flex gap-2">
          <input type="email" value={form.email}
            onChange={e => { set('email', e.target.value); setEmailSent(false); setEmailVerified(false); setEmailError(''); }}
            placeholder="your@email.com"
            disabled={emailVerified}
            className={`flex-1 border rounded-lg px-4 py-3 text-sm outline-none transition focus:ring-2 ${emailVerified ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 focus:border-[#1a6b8a] focus:ring-[#1a6b8a]/20'}`}
          />
          {isValidEmail && !emailVerified && (
            <button onClick={handleSendEmailCode} disabled={sendingCode}
              className="px-4 py-3 bg-[#1a6b8a] hover:bg-[#155a75] disabled:bg-gray-300 text-white text-xs font-bold rounded-lg whitespace-nowrap transition-colors">
              {sendingCode ? '…' : emailSent ? 'Resend' : 'Send Code'}
            </button>
          )}
        </div>

        {/* Email OTP input — shown after Send Code */}
        {emailSent && !emailVerified && (
          <div className="mt-2 flex gap-2">
            <input type="text" inputMode="numeric" value={emailCode}
              onChange={e => { setEmailCode(e.target.value.replace(/\D/g,'').slice(0,6)); setEmailError(''); }}
              placeholder="Enter 6-digit code"
              className={`flex-1 border rounded-lg px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${emailError ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-[#1a6b8a] focus:ring-[#1a6b8a]/20'}`}
            />
            <button onClick={handleVerifyEmailCode}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors">
              Verify
            </button>
          </div>
        )}
        {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
        {emailSent && !emailVerified && <p className="text-xs text-gray-400 mt-1">Check your inbox for the 6-digit verification code.</p>}
      </div>

      {/* DOB */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-600 mb-1.5">Date of Birth <span className="text-gray-400 font-normal">(optional)</span></label>
        <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition" />
      </div>


      <div className="flex items-start gap-2.5 mb-1">
        <div className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded-sm border flex items-center justify-center cursor-pointer ${error === 'agree' ? 'border-red-400' : 'border-gray-400'} ${form.agree ? 'bg-[#1a6b8a] border-[#1a6b8a]' : 'bg-white'}`}
          onClick={() => { set('agree', !form.agree); setError(''); }}>
          {form.agree && <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
        <span className="text-xs text-gray-500 leading-relaxed">
          By signing up, you agree to our{' '}
          <button type="button" onClick={e => { e.stopPropagation(); onMoreClick?.('terms'); }} className="text-[#1a6b8a] hover:underline font-medium">Terms &amp; Conditions</button>
          {' '}&amp;{' '}
          <button type="button" onClick={e => { e.stopPropagation(); onMoreClick?.('privacy'); }} className="text-[#1a6b8a] hover:underline font-medium">Privacy Policy</button>
        </span>
      </div>
      {error === 'agree' && <p className="text-xs text-red-500 mb-4">Please agree to our Terms &amp; Conditions &amp; Privacy Policy to continue.</p>}

      <button onClick={handleSubmit} disabled={loading}
        className="w-full bg-[#1a6b8a] hover:bg-[#155a75] disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold py-3 rounded-lg text-sm tracking-widest transition-all">
        {loading ? 'Saving…' : 'SUBMIT'}
      </button>
    </div>
  );
}

// ── STEP 3: Google new users — verify mobile + collect profile ────────────
function StepGoogleMobile({ userData, onDone, onMoreClick }) {
  const googleName = userData?.name || '';
  const googleEmail = userData?.email || '';

  const titleFromName = () => 'Mr.'; // default; user can change
  const genderFromTitle = t => (t === 'Mr.' ? 'Male' : 'Female');

  const [mobile, setMobile]           = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [otpSent, setOtpSent]         = useState(false);
  const [otp, setOtp]                 = useState(['','','','','','']);
  const [title, setTitle]             = useState('Mr.');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [agree, setAgree]             = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [timer, setTimer]             = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    if (!otpSent || timer <= 0) return;
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, otpSent]);

  useEffect(() => {
    if (otpSent) refs.current[0]?.focus();
  }, [otpSent]);

  const handleSendOtp = async () => {
    if (!agree) { setError('agree'); return; }
    if (mobile.length !== 10) { setError('Enter a valid 10-digit mobile number.'); return; }
    setLoading(true); setError('');
    try {
      // Check if mobile already registered
      const res = await fetch(`http://localhost:8080/api/auth/check-mobile?mobile=${mobile}`);
      const d = await res.json();
      if (d?.data?.exists) {
        setError('This mobile number is already registered. Please use a different number.');
        setLoading(false);
        return;
      }
      setupRecaptcha('recaptcha-google-mobile');
      const conf = await sendFirebaseOtp(mobile);
      setConfirmation(conf);
      setOtpSent(true);
      setTimer(30);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
      if (window.recaptchaVerifier) { window.recaptchaVerifier.clear(); window.recaptchaVerifier = null; }
    } finally { setLoading(false); }
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next); setError('');
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };
  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (paste.length === 6) { setOtp(paste.split('')); refs.current[5]?.focus(); }
  };

  const handleResend = async () => {
    setTimer(30); setOtp(['','','','','','']); setError(''); setLoading(true);
    try {
      setupRecaptcha('recaptcha-google-mobile');
      const nc = await sendFirebaseOtp(mobile);
      setConfirmation(nc);
    } catch (err) { setError(err.message || 'Failed to resend OTP.'); }
    finally { setLoading(false); refs.current[0]?.focus(); }
  };

  const handleVerifyOtp = async () => {
    const entered = otp.join('');
    if (entered.length < 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    try {
      const result = await confirmation.confirm(entered);
      const phoneIdToken = await result.user.getIdToken();
      const gender = genderFromTitle(title);
      const data = await completeGoogleRegistration(
        phoneIdToken, googleEmail, googleName, title, gender, dateOfBirth
      );
      onDone(data);
    } catch (err) {
      setError(err.message?.includes('OTP') || err.message?.includes('code') ? 'Invalid OTP. Please try again.' : (err.message || 'Verification failed.'));
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Verify Mobile Number</h2>
      <p className="text-sm text-gray-400 mb-5">
        Hi <span className="font-semibold text-gray-700">{googleName}</span>! One last step — verify your mobile.
      </p>

      {/* Title + DOB on same line */}
      <div className="flex gap-3 mb-4">
        <div className="w-28">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Title</label>
          <select value={title} onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition bg-white">
            {['Mr.','Mrs.','Ms.'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Date of Birth <span className="text-gray-400 font-normal">(optional)</span></label>
          <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition" />
        </div>
      </div>

      {/* Mobile input */}
      <label className="block text-sm font-medium text-gray-600 mb-1.5">Mobile Number</label>
      <div className={`flex border rounded-lg overflow-hidden transition focus-within:ring-2 ${error && error !== 'agree' && !otpSent ? 'border-red-400 focus-within:ring-red-200' : 'border-gray-300 focus-within:border-[#1a6b8a] focus-within:ring-[#1a6b8a]/20'}`}>
        <div className="flex items-center gap-1.5 px-3 bg-gray-50 border-r border-gray-200 text-sm text-gray-700 flex-shrink-0 select-none">
          <span>🇮🇳</span><span className="font-semibold">+91</span>
        </div>
        <input type="tel" value={mobile}
          onChange={e => { setMobile(e.target.value.replace(/\D/g,'').slice(0,10)); setError(''); setOtpSent(false); setOtp(['','','','','','']); }}
          onKeyDown={e => e.key === 'Enter' && !otpSent && handleSendOtp()}
          placeholder="Enter 10-digit mobile number"
          className="flex-1 px-4 py-3 text-sm outline-none bg-white"
        />
      </div>
      {error && error !== 'agree' && !otpSent && <p className="text-xs text-red-500 mt-1.5">{error}</p>}

      <div id="recaptcha-google-mobile" />

      {/* Agree checkbox */}
      <div className="flex items-start gap-2.5 mt-3 mb-1">
        <div className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded-sm border flex items-center justify-center cursor-pointer ${error === 'agree' ? 'border-red-400' : 'border-gray-400'} ${agree ? 'bg-[#1a6b8a] border-[#1a6b8a]' : 'bg-white'}`}
          onClick={() => { setAgree(v => !v); setError(''); }}>
          {agree && <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
        <span className="text-xs text-gray-500 leading-relaxed">
          By signing up, you agree to our{' '}
          <button type="button" onClick={e => { e.stopPropagation(); onMoreClick?.('terms'); }} className="text-[#1a6b8a] hover:underline font-medium">Terms &amp; Conditions</button>
          {' '}&amp;{' '}
          <button type="button" onClick={e => { e.stopPropagation(); onMoreClick?.('privacy'); }} className="text-[#1a6b8a] hover:underline font-medium">Privacy Policy</button>
        </span>
      </div>
      {error === 'agree' && <p className="text-xs text-red-500 mb-1">Please agree to our Terms &amp; Conditions &amp; Privacy Policy to continue.</p>}

      <button onClick={handleSendOtp} disabled={loading || mobile.length !== 10}
        className="w-full mt-3 bg-[#1a6b8a] hover:bg-[#155a75] disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold py-3 rounded-lg text-sm tracking-widest transition-all">
        {loading && !otpSent ? 'Sending…' : otpSent ? 'Resend OTP' : 'SEND OTP'}
      </button>

      {/* OTP box — shown inline after Send Code */}
      {otpSent && (
        <div className="mt-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-5 border border-gray-100">
          <p className="text-xs text-gray-500 text-center mb-4">OTP sent to <span className="font-semibold text-gray-700">+91 {mobile}</span></p>
          <div className="flex justify-center gap-2.5 mb-3" onPaste={handlePaste}>
            {otp.map((d, i) => (
              <input key={i} ref={el => refs.current[i] = el}
                type="text" inputMode="numeric" maxLength={1} value={d}
                onChange={e => handleOtpChange(e.target.value, i)}
                onKeyDown={e => handleOtpKeyDown(e, i)}
                className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all ${d ? 'border-[#1a6b8a] bg-[#1a6b8a]/5 text-[#1a6b8a]' : 'border-gray-300 bg-white'} focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20`}
              />
            ))}
          </div>
          {error && <p className="text-xs text-red-500 text-center mb-2">{error}</p>}
          <p className="text-center text-xs text-gray-400 mb-4">
            Didn't receive OTP?{' '}
            {timer > 0
              ? <span className="text-gray-500 font-medium">Resend in {timer}s</span>
              : <button onClick={handleResend} className="text-[#1a6b8a] font-semibold hover:underline">Resend OTP</button>
            }
          </p>
          <button onClick={handleVerifyOtp} disabled={otp.join('').length < 6 || loading}
            className="w-full bg-[#1a6b8a] hover:bg-[#155a75] disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold py-3 rounded-lg text-sm tracking-widest transition-all">
            {loading ? 'Verifying…' : 'VERIFY & CONTINUE'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main AuthPage ──────────────────────────────────────────────────────────
// New user  → step0(mobile+OTP send) → step1(OTP verify) → step2(profile) → home  [3 steps]
// Existing  → step0(mobile+OTP send) → step1(OTP verify)                  → home  [2 steps]
export default function AuthPage({ onAuthDone, onAdminLogin, onMoreClick }) {
  const [step, setStep]                 = useState(0);
  const [mobile, setMobile]             = useState('');
  const [isLogin, setIsLogin] = useState(null); // null=unknown, true=existing, false=new
  const [confirmation, setConfirmation] = useState(null);
  const [pendingUser, setPendingUser]   = useState(null);
  const [firebaseIdToken, setFirebaseIdToken] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError]   = useState('');

  const handleMobileNext = (phone, confirmationResult) => {
    setMobile(phone);
    setConfirmation(confirmationResult);
    setStep(1);
  };

  const handleOtpNext = (userData, idToken) => {
    if (userData.role === 'ADMIN') { onAdminLogin?.(); return; }
    setIsLogin(!userData.newUser);
    if (userData.newUser) { setPendingUser(userData); setFirebaseIdToken(idToken); setStep(2); }
    else onAuthDone(userData);
  };

  const handleResend = (nc) => setConfirmation(nc);

  const handleGoogleLogin = async () => {
    setGoogleError(''); setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      const idToken = await result.user.getIdToken();
      const userData = await exchangeFirebaseToken(idToken);
      if (userData.role === 'ADMIN') { onAdminLogin?.(); return; }
      // If no mobile number, ask user to verify one
      if (!userData.mobileNumber) {
        setPendingUser(userData);
        setFirebaseIdToken(idToken);
        setStep(3); // google mobile step
        return;
      }
      onAuthDone(userData);
    } catch (err) {
      setGoogleError(err.message || 'Google sign-in failed. Please try again.');
    } finally { setGoogleLoading(false); }
  };

  // step3 = Google new user flow: 2 bars (step0=mobile entry, step1=verify)
  // step0/1/2 = phone flow: existing=2 bars, new=3 bars
  const totalSteps = step === 3 ? 2 : (step === 0 ? 3 : isLogin === true ? 2 : 3);
  const displayStep = step === 3 ? 1 : step;

  return (
    <div className="relative min-h-[calc(100vh-130px)] flex items-center justify-center py-10 px-4"
      style={{ background: 'linear-gradient(135deg,#f0f9ff 0%,#fce4ec 40%,#f0fdf4 100%)' }}>
      <Petals />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <StepBar total={totalSteps} current={displayStep} />

          {step === 0 && <StepMobile onNext={handleMobileNext} onGoogleLogin={handleGoogleLogin} onUserStatus={status => setIsLogin(status === 'existing' ? true : status === 'new' ? false : null)} />}
          {step === 1 && (
            <StepOTP mobile={mobile} confirmation={confirmation} isLogin={isLogin}
              onBack={() => setStep(0)} onNext={handleOtpNext} onResend={handleResend} />
          )}
          {step === 2 && <StepProfile userData={pendingUser} firebaseIdToken={firebaseIdToken} onDone={onAuthDone} onMoreClick={onMoreClick} />}
          {step === 3 && <StepGoogleMobile userData={pendingUser} onDone={onAuthDone} onMoreClick={onMoreClick} />}

          {googleLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl text-center">
                <p className="text-sm font-semibold text-gray-700">Signing in with Google…</p>
              </div>
            </div>
          )}
          {googleError && <p className="text-xs text-red-500 text-center mt-3">{googleError}</p>}
        </div>
        <div className="flex justify-center gap-3 mt-5 text-2xl opacity-30 select-none">
          {PETALS.map((p, i) => <span key={i}>{p}</span>)}
        </div>
      </div>
    </div>
  );
}
