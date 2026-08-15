import { createContext, useContext, useState } from 'react';
import { clearAuth, isAdmin, userStorage } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => userStorage.get());

  const login = (authData) => {
    setUser({
      userId:       authData.userId,
      name:         authData.name,
      mobileNumber: authData.mobileNumber,
      role:         authData.role,
    });
  };

  const logout = async () => {
    await clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: isAdmin() }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
