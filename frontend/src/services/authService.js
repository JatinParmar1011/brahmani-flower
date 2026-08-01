import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';

const BASE_URL = 'http://localhost:8080/api';

// ── Token / User storage ───────────────────────────────────────────────────
export const tokenStorage = {
  save: (token) => localStorage.setItem('bf_token', token),
  get: ()        => localStorage.getItem('bf_token'),
  remove: ()     => localStorage.removeItem('bf_token'),
};

export const userStorage = {
  save: (user) => localStorage.setItem('bf_user', JSON.stringify(user)),
  get: () => {
    const u = localStorage.getItem('bf_user');
    return u ? JSON.parse(u) : null;
  },
  remove: () => localStorage.removeItem('bf_user'),
};

export const clearAuth = async () => {
  tokenStorage.remove();
  userStorage.remove();
  await signOut(auth);
};

// ── HTTP helpers ───────────────────────────────────────────────────────────
const post = async (url, body) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Request failed');
  return data.data;
};

const patch = async (url, body) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenStorage.get()}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Update failed');
  return data.data;
};

// ── Firebase Phone OTP ─────────────────────────────────────────────────────
export const setupRecaptcha = (containerId) => {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });
};

export const sendFirebaseOtp = (mobileNumber) =>
  signInWithPhoneNumber(auth, `+91${mobileNumber}`, window.recaptchaVerifier);

// ── Firebase Google Auth ───────────────────────────────────────────────────
export const signInWithGoogle = () =>
  signInWithPopup(auth, new GoogleAuthProvider());

// ── Exchange Firebase ID token with backend JWT ────────────────────────────
export const exchangeFirebaseToken = async (firebaseIdToken) => {
  const data = await post('/auth/firebase-login', { firebaseIdToken });
  tokenStorage.save(data.accessToken);
  userStorage.save({
    userId:       data.userId,
    name:         data.name,
    mobileNumber: data.mobileNumber,
    role:         data.role,
  });
  return data;
};

// ── Complete registration for new phone users ─────────────────────────────
export const completeRegistration = async (firebaseIdToken, profileData) => {
  const data = await post('/auth/complete-registration', { firebaseIdToken, ...profileData });
  tokenStorage.save(data.accessToken);
  userStorage.save({
    userId:       data.userId,
    name:         data.name,
    mobileNumber: data.mobileNumber,
    role:         data.role,
  });
  return data;
};

// ── Complete registration for Google new users (after mobile OTP verify) ─
export const completeGoogleRegistration = async (phoneIdToken, googleEmail, googleName, title, gender, dateOfBirth) => {
  const data = await post('/auth/complete-google-registration', {
    phoneIdToken, googleEmail, googleName, title, gender, dateOfBirth,
  });
  tokenStorage.save(data.accessToken);
  userStorage.save({
    userId:       data.userId,
    name:         data.name,
    mobileNumber: data.mobileNumber,
    role:         data.role,
  });
  return data;
};

// ── Email OTP ──────────────────────────────────────────────────────────────
export const sendEmailOtp = (email) =>
  post('/auth/send-email-otp', { email });

export const verifyEmailOtp = (email, otp) =>
  post('/auth/verify-email-otp', { email, otp });

// ── Update profile after new signup ───────────────────────────────────────
export const updateProfile = (data) =>
  patch('/user/profile', data);

// ── Get full profile from backend ─────────────────────────────────────────
export const getProfile = async () => {
  const res = await fetch(`${BASE_URL}/user/profile`, {
    headers: { 'Authorization': `Bearer ${tokenStorage.get()}` },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

// ── Auth state helpers ─────────────────────────────────────────────────────
export const isAuthenticated = () => !!tokenStorage.get();
export const isAdmin = () => userStorage.get()?.role === 'ADMIN';
export const getAuthHeader = () => ({ Authorization: `Bearer ${tokenStorage.get()}` });
