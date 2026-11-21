import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_CREDENTIALS, INITIAL_REGISTERED_USERS } from '../data/mockUsers';
import { getStoredItem, setStoredItem, STORAGE_KEYS, removeStoredItem } from '../services/storageService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initial registered users list
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    return getStoredItem(STORAGE_KEYS.REGISTERED_USERS, INITIAL_REGISTERED_USERS);
  });

  // Current authenticated user (read from localStorage; if none, user must log in)
  const [currentUser, setCurrentUser] = useState(() => {
    return getStoredItem(STORAGE_KEYS.CURRENT_USER, null);
  });

  // Keep localStorage synced
  useEffect(() => {
    if (currentUser) {
      setStoredItem(STORAGE_KEYS.CURRENT_USER, currentUser);
    } else {
      removeStoredItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.REGISTERED_USERS, registeredUsers);
  }, [registeredUsers]);

  /**
   * Login user by email & password
   */
  const login = (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Check against demo accounts first
    const demoMatch = Object.values(DEMO_CREDENTIALS).find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
    );

    if (demoMatch) {
      setCurrentUser(demoMatch);
      return { success: true, user: demoMatch };
    }

    // Check against registered users
    const registeredMatch = registeredUsers.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
    );

    if (registeredMatch) {
      setCurrentUser(registeredMatch);
      return { success: true, user: registeredMatch };
    }

    return {
      success: false,
      message: 'Invalid email or password. Please use demo credentials or register an account.'
    };
  };

  /**
   * Register a new user
   */
  const register = ({ name, phone, email, password, role }) => {
    const trimmedEmail = email.trim().toLowerCase();
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser = {
      name,
      phone,
      email: trimmedEmail,
      password,
      role: role || 'citizen',
      createdAt: new Date().toISOString()
    };

    if (role === 'rescue') {
      newUser.teamName = `${name}'s Squad`;
      newUser.specialization = 'General Emergency Rescue';
      newUser.availability = 'available';
    }

    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    setCurrentUser(newUser);

    return { success: true, user: newUser };
  };

  /**
   * Quick switch between demo accounts for easy testing of multi-dashboard interaction
   */
  const switchDemoUser = (role) => {
    if (DEMO_CREDENTIALS[role]) {
      setCurrentUser(DEMO_CREDENTIALS[role]);
      return true;
    }
    return false;
  };

  /**
   * Logout current user
   */
  const logout = () => {
    try {
      sessionStorage.removeItem('rescuenet_entered_session');
      localStorage.removeItem('rescuenet_has_entered_app');
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        login,
        register,
        switchDemoUser,
        logout,
        registeredUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
