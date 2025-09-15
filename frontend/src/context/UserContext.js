import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState('guest');
  const [token, setToken] = useState(null);
  const appId = 'saralnivesh_v1.0';

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setUserId('guest');
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const login = async (userData, userToken) => {
    try {
      await AsyncStorage.setItem('userToken', userToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      setUserId(userData.id);
      setToken(userToken);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      userId,
      token,
      appId,
      login,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    return {
      userId: 'guest',
      user: null,
      token: null,
      appId: 'saralnivesh_v1.0',
      logout: () => {}
    };
  }
  return context;
};