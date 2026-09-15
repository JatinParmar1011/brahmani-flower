import { createContext, useContext, useState } from 'react';
import { clearAuth, userStorage } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => userStorage.get());

  const login = (authData) => {
    const u = {
      userId:       authData.userId,
      name:         authData.name,
      mobileNumber: authData.mobileNumber,
      role:         authData.role,
    };
    userStorage.save(u);   // persist so page refresh keeps the user
    setUser(u);
  };

  const logout = async () => {
    await clearAuth();     // removes bf_token, bf_user, clears HttpOnly cookie
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
