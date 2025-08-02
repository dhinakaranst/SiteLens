import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  createdAt: string;
}

interface UsageStats {
  checksUsed: number;
  lastCheck: string | null;
  freeChecksLimit: number;
}

interface AuthContextType {
  user: User | null;
  usageStats: UsageStats;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
  canPerformCheck: () => boolean;
  incrementUsage: () => void;
  getRemainingChecks: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    checksUsed: 0,
    lastCheck: null,
    freeChecksLimit: 1, // Only 1 free check without login
  });

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('user');
    const storedUsage = localStorage.getItem('usageStats');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }

    if (storedUsage) {
      try {
        const usageData = JSON.parse(storedUsage);
        setUsageStats(usageData);
      } catch (error) {
        console.error('Error parsing stored usage data:', error);
        localStorage.removeItem('usageStats');
      }
    }
    
    setIsLoading(false);
  }, []);

  const canPerformCheck = (): boolean => {
    // If user is logged in, they can perform unlimited checks
    if (user) {
      return true;
    }
    
    // If not logged in, check if they've exceeded free limit
    return usageStats.checksUsed < usageStats.freeChecksLimit;
  };

  const incrementUsage = (): void => {
    const newUsageStats = {
      ...usageStats,
      checksUsed: usageStats.checksUsed + 1,
      lastCheck: new Date().toISOString(),
    };
    
    setUsageStats(newUsageStats);
    localStorage.setItem('usageStats', JSON.stringify(newUsageStats));
  };

  const getRemainingChecks = (): number => {
    if (user) {
      return -1; // Unlimited for logged in users
    }
    
    return Math.max(0, usageStats.freeChecksLimit - usageStats.checksUsed);
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Don't clear usage stats on logout - keep the free check limit
    // Clear any other auth-related data
    sessionStorage.clear();
    // Clear any cached API responses
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    console.log('✅ Logout successful - auth data cleared');
  };

  const value = {
    user,
    usageStats,
    login,
    logout,
    isLoading,
    canPerformCheck,
    incrementUsage,
    getRemainingChecks,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 