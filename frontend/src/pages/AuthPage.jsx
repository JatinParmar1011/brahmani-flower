import { useState, useRef, useEffect } from 'react';

// ── Mock "database" of registered users (persisted in memory) ─────────────
// Key: mobile number string, Value: profile object
const ADMIN_MOBILE = '8888888888';

const REGISTERED_USERS = {
  '9999999999': { name: 'Test User',  email: 'abc123@gmail.com' },
};
// Registered emails mapped to their linked mobile
const REGISTERED_EMAILS = {
  'abc123@gmail.com': '9999999999',
};
const TEST_OTP = '123456';

// ── Google SVG ─────────────────────────────────────────────────────────────
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

// ── Floating petals background ─────────────────────────────────────────────
const PETALS = ['🌸','🌺','🌼','🌷','💐','🌹'];
function Petals() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 16 }).map((_, i) => (
        <span key={i} className="absolute opacity-[0.07] animate-bounce select-none"
          style={{
            left: `${(i * 19 + 3) % 100}%`,
            top: `${(i * 27 + 8) % 88}%`,
            fontSize: `${20 + (i % 4) * 10}px`,
            animationDelay: `${i * 0.35}s`,
            animationDuration: `${2.5 + (i % 3) * 0.8}s`,
          }}
        >{PETALS[i % PETALS.length]}</span>
      ))}
    </div>
  );
}

// ── Shared Google + T&C footer ─────────────────────────────────────────────
function SocialFooter() {
  return (
    <>
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 whitespace-nowrap">or continue with</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <button className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
        <GoogleIcon /> LOGIN WITH GOOGLE
      </button>
      <p className="text-center text-xs text-gray-400 mt-4">
        By continuing, you agree to our{' '}
        <a href="#" className="text-[#1a6b8a] hover:underline">Terms of Service</a>{' '}
        &amp;{' '}
        <a href="#" className="text-[#1a6b8a] hover:underline">Privacy Policy</a>
      </p>
    </>
  );
}

// ── Step progress bar ──────────────────────────────────────────────────────
function StepBar({ total, current }) {
  return (
    <div className="flex gap-1.5 mb-7">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= current ? 'bg-[#1a6b8a]' : 'bg-gray-200'}`} />
      ))}
    </div>
  );
}

// ── STEP 0: Login or Sign Up ───────────────────────────────────────────────
function StepLoginOrSignup({ onEmailNext, onPhoneNext }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const isPhone = /^\d+$/.test(value);
  const isEmail = value.includes('@') && value.includes('.');

  // Auto-navigate to Sign Up when user types 4+ digits
  useEffect(() => {
    if (isPhone && value.length >= 4) {
      onPhoneNext(value, true); // true = came from auto-navigate (partial number)
    }
  }, [value]);

  const handleNext = () => {
    setError('');
    if (!value.trim()) { setError('Please enter email or mobile number.'); return; }
    if (isPhone) {
      if (value.length !== 10) { setError('Enter a valid 10-digit mobile number.'); return; }
      onPhoneNext(value, false);
    } else if (isEmail) {
      onEmailNext(value);
    } else {
      setError('Enter a valid email or 10-digit mobile number.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Login or Sign up</h2>
      <p className="text-sm text-gray-400 mb-6">Welcome back! Please enter your details.</p>

      <label className="block text-sm font-medium text-gray-600 mb-1.5">Enter email / Mobile number</label>
      <input
        type="text"
        value={value}
        onChange={e => {
          const v = e.target.value;
          // Only allow digits if user is typing a phone number
          if (/^\d+$/.test(v) || v === '') {
            setValue(v.slice(0, 10));
          } else {
            setValue(v);
          }
          setError('');
        }}
        onKeyDown={e => e.key === 'Enter' && handleNext()}
        placeholder="Email or 10-digit mobile number"
        className={`w-full border rounded-lg px-4 py-3 text-sm outline-none transition focus:ring-2 ${error ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-[#1a6b8a] focus:ring-[#1a6b8a]/20'}`}
      />
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}

      <button onClick={handleNext}
        className="w-full mt-4 bg-[#1a6b8a] hover:bg-[#155a75] active:scale-[0.98] text-white font-bold py-3 rounded-lg text-sm tracking-widest transition-all">
        NEXT
      </button>
      <SocialFooter />
    </div>
  );
}

// ── STEP 1: Sign Up — enter mobile ────────────────────────────────────────
function StepSignupMobile({ prefill, onBack, onNext }) {
  const [mobile, setMobile] = useState(prefill || '');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Auto-focus and place cursor at end when arriving with prefilled digits
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, []);

  const handleNext = () => {
    setError('');
    if (mobile.length !== 10) { setError('Enter a valid 10-digit mobile number.'); return; }
    onNext(mobile);
  };

  const remaining = 10 - mobile.length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-600 text-lg">←</button>
        <h2 className="text-2xl font-bold text-gray-900">Sign up</h2>
      </div>
      <p className="text-sm text-gray-400 mb-6 ml-11">Create your account with mobile number</p>

      <label className="block text-sm font-medium text-gray-600 mb-1.5">Enter Mobile Number</label>
      <div className={`flex border rounded-lg overflow-hidden transition focus-within:ring-2 ${error ? 'border-red-400 focus-within:ring-red-200' : 'border-gray-300 focus-within:border-[#1a6b8a] focus-within:ring-[#1a6b8a]/20'}`}>
        <div className="flex items-center gap-1.5 px-3 bg-gray-50 border-r border-gray-200 text-sm text-gray-700 flex-shrink-0 select-none">
          <span>🇮🇳</span><span className="font-medium">+91</span><span className="text-gray-400 text-xs">▼</span>
        </div>
        <input
          ref={inputRef}
          type="tel"
          value={mobile}
          onChange={e => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleNext()}
          placeholder="Enter mobile number"
          className="flex-1 px-4 py-3 text-sm outline-none bg-white"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      {!error && mobile.length > 0 && mobile.length < 10 && (
        <p className="text-xs text-gray-400 mt-1.5">{remaining} more digit{remaining !== 1 ? 's' : ''} needed</p>
      )}

      <button onClick={handleNext}
        className="w-full mt-4 bg-[#1a6b8a] hover:bg-[#155a75] active:scale-[0.98] text-white font-bold py-3 rounded-lg text-sm tracking-widest transition-all">
        NEXT
      </button>
      <SocialFooter />
    </div>
  );
}

// ── STEP 2: OTP Verification ───────────────────────────────────────────────
function StepOTP({ mobile, isLogin, onBack, onNext }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

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
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      refs.current[5]?.focus();
    }
  };

  const handleSubmit = () => {
    const entered = otp.join('');
    if (entered.length < 6) { setError('Please enter all 6 digits.'); return; }
    if (entered !== TEST_OTP) { setError('Invalid OTP. Use 123456 for testing.'); return; }
    onNext();
  };

  const handleResend = () => { setTimer(30); setOtp(['','','','','','']); setError(''); refs.current[0]?.focus(); };

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-600 text-lg">←</button>
        <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
      </div>
      <p className="text-sm text-gray-400 mb-5 ml-11">OTP sent to <span className="font-semibold text-gray-700">+91 {mobile}</span></p>

      {/* Mobile display */}
      <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-1 bg-gray-50">
        <div className="flex items-center gap-1.5 px-3 border-r border-gray-200 text-sm text-gray-600 flex-shrink-0">
          <span>🇮🇳</span><span>+91</span>
        </div>
        <input value={mobile} readOnly className="flex-1 px-4 py-2.5 text-sm bg-gray-50 text-gray-600 cursor-default outline-none" />
      </div>
      {!isLogin && <p className="text-xs text-amber-600 mb-4 font-medium">📱 New account will be created for this number</p>}
      {isLogin && <p className="text-xs text-green-600 mb-4 font-medium">✅ Existing account found — logging you in</p>}

      {/* OTP box */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100 mb-4">
        <p className="text-sm font-semibold text-gray-700 text-center mb-5">
          Enter the 6-digit OTP
        </p>
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
        <p className="text-center text-[11px] text-gray-300 mt-2">Use <strong className="text-gray-400">123456</strong> for testing</p>
      </div>

      <button onClick={handleSubmit}
        disabled={otp.join('').length < 6}
        className="w-full bg-[#1a6b8a] hover:bg-[#155a75] disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold py-3 rounded-lg text-sm tracking-widest transition-all">
        SUBMIT
      </button>
    </div>
  );
}

// ── STEP 3: Profile Details ────────────────────────────────────────────────
function StepProfile({ identifier, onDone }) {
  const [form, setForm] = useState({ title: 'Mr.', name: '', dob: '', agree: true });
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name.trim()) { setError('Please enter your full name.'); return; }
    const key = identifier.replace('+91', '').trim();
    const userData = { name: form.name, title: form.title, email: identifier.includes('@') ? identifier : '', mobile: key, dob: form.dob };
    REGISTERED_USERS[key] = userData;
    onDone(userData);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Profile Details</h2>
      <p className="text-sm text-gray-400 mb-6">Tell us a little about yourself</p>

      <div className="flex gap-3 mb-4">
        <div className="w-28">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Title</label>
          <select value={form.title} onChange={e => set('title', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition bg-white">
            {['Mr.','Mrs.','Ms.','Dr.'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name <span className="text-red-400">*</span></label>
          <input type="text" value={form.name} onChange={e => { set('name', e.target.value); setError(''); }}
            placeholder="Your full name"
            className={`w-full border rounded-lg px-4 py-3 text-sm outline-none transition focus:ring-2 ${error ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-[#1a6b8a] focus:ring-[#1a6b8a]/20'}`}
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-500 -mt-2 mb-3">{error}</p>}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1.5">Email / Mobile</label>
        <input type="text" value={identifier} readOnly
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-100 text-gray-500 cursor-not-allowed" />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-600 mb-1.5">Date of Birth</label>
        <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition" />
      </div>

      <label className="flex items-start gap-2.5 mb-6 cursor-pointer group">
        <input type="checkbox" checked={form.agree} onChange={e => set('agree', e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#1a6b8a] cursor-pointer" />
        <span className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-700 transition">
          I agree to receive special updates, offers &amp; promotions from Brahmani Flowers
        </span>
      </label>

      <div className="flex gap-3">
        <button onClick={onDone}
          className="flex-1 border-2 border-gray-300 text-gray-600 font-bold py-3 rounded-lg text-sm hover:bg-gray-50 hover:border-gray-400 transition-colors">
          SKIP
        </button>
        <button onClick={handleSubmit}
          className="flex-1 bg-[#1a6b8a] hover:bg-[#155a75] active:scale-[0.98] text-white font-bold py-3 rounded-lg text-sm tracking-widest transition-all">
          SUBMIT
        </button>
      </div>
    </div>
  );
}

// ── Main AuthPage ──────────────────────────────────────────────────────────
// Flow A — Email entered:   0 → 1(signup mobile) → 2(otp) → 3(profile) → home
// Flow B — New phone:       0 → 1(signup mobile) → 2(otp) → 3(profile) → home
// Flow C — Existing phone:  0 → 2(otp login)              → home
export default function AuthPage({ onAuthDone, onAdminLogin }) {
  const [step, setStep]         = useState(0);
  const [mobile, setMobile]     = useState('');
  const [identifier, setId]     = useState(''); // email or mobile for profile
  const [isLogin, setIsLogin]   = useState(false);
  const [totalSteps, setTotal]  = useState(4);

  // Step 0 — phone entered
  // autoNav=true means triggered by typing 4 digits (partial), always go to signup
  // autoNav=false means NEXT button clicked with full 10-digit number
  const handlePhoneNext = (phone, autoNav = false) => {
    setId(phone);
    if (!autoNav && phone.length === 10 && phone === ADMIN_MOBILE) {
      // Admin login flow
      setMobile(phone);
      setIsLogin(true);
      setTotal(2);
      setStep(2);
    } else if (!autoNav && phone.length === 10 && !!REGISTERED_USERS[phone]) {
      // Full 10-digit existing user via NEXT button → login flow
      setMobile(phone);
      setIsLogin(true);
      setTotal(2);
      setStep(2);
    } else {
      // Partial number (auto-nav) OR new number → go to signup with prefill
      setMobile(phone);
      setIsLogin(false);
      setTotal(4);
      setStep(1);
    }
  };


  // Step 0 — email entered
  const handleEmailNext = (email) => {
    const linkedMobile = REGISTERED_EMAILS[email.toLowerCase()];
    if (linkedMobile) {
      // Existing email user → login flow: show OTP with linked mobile
      setId(email);
      setMobile(linkedMobile);
      setIsLogin(true);
      setTotal(2);
      setStep(2);
    } else {
      // New email → signup flow: go to enter mobile
      setId(email);
      setIsLogin(false);
      setTotal(4);
      setStep(1);
    }
  };

  // Step 1 — mobile confirmed in signup form
  // Check here too: user may have arrived via auto-nav with a partial number
  // and completed it to an existing registered number
  const handleSignupMobileNext = (phone) => {
    setMobile(phone);
    setId(phone);
    if (phone === ADMIN_MOBILE) {
      setIsLogin(true);
      setTotal(2);
    } else if (REGISTERED_USERS[phone]) {
      // Existing user → switch to login flow
      setIsLogin(true);
      setTotal(2);
    } else {
      setIsLogin(false);
    }
    setStep(2);
  };

  // Step 2 — OTP verified
  const handleOTPNext = () => {
    if (mobile === ADMIN_MOBILE) {
      onAdminLogin && onAdminLogin();
      return;
    }
    if (isLogin) {
      const stored = REGISTERED_USERS[mobile];
      const userData = stored
        ? { title: stored.title || 'Mr.', name: stored.name || 'User', email: stored.email || (identifier.includes('@') ? identifier : ''), mobile, dob: stored.dob || '' }
        : { title: 'Mr.', name: 'User', email: identifier.includes('@') ? identifier : '', mobile, dob: '' };
      onAuthDone(userData);
    } else {
      setStep(3);
    }
  };

  // Progress bar index: login=2 steps, signup=4 steps
  const displayStep = isLogin
    ? (step === 2 ? 1 : 0)
    : (step === 0 ? 0 : step === 1 ? 1 : step === 2 ? 2 : 3);

  return (
    <div className="relative min-h-[calc(100vh-130px)] flex items-center justify-center py-10 px-4"
      style={{ background: 'linear-gradient(135deg,#f0f9ff 0%,#fce4ec 40%,#f0fdf4 100%)' }}
    >
      <Petals />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <StepBar total={totalSteps} current={displayStep} />

          {step === 0 && (
            <StepLoginOrSignup
              onEmailNext={handleEmailNext}
              onPhoneNext={handlePhoneNext}
            />
          )}
          {step === 1 && (
            <StepSignupMobile
              prefill={/^\d+$/.test(identifier) ? identifier : ''}
              onBack={() => setStep(0)}
              onNext={handleSignupMobileNext}
            />
          )}
          {step === 2 && (
            <StepOTP
              mobile={mobile}
              isLogin={isLogin}
              onBack={() => isLogin ? setStep(0) : setStep(1)}
              onNext={handleOTPNext}
            />
          )}
          {step === 3 && (
            <StepProfile
              identifier={identifier.includes('@') ? identifier : `+91 ${mobile}`}
              onDone={onAuthDone}
            />
          )}
        </div>

        <div className="flex justify-center gap-3 mt-5 text-2xl opacity-30 select-none">
          {PETALS.map((p, i) => <span key={i}>{p}</span>)}
        </div>
      </div>
    </div>
  );
}
