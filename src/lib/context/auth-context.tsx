'use client';

// context/AuthContext.tsx
import { User as FirebaseUser, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import Cookies from 'js-cookie';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { firebaseIdToken } from '../constant/firebase';
import { Collection, User } from '../core/models';
import { firebaseAuth } from '../firebase/client/client-config';
import { FirestoreClientHelper } from '../firebase/client/firestore-client.helper';

export interface UserState {
  identity: FirebaseUser; // Firebase user object
  userInfo: User | null; // Custom user object from Firestore
}

// Simplified auth context - no more token management needed
interface AuthContextType {
  userState: UserState | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Simplified auth provider - removed global loading overlay
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userState, setUserState] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (identity) => {
      setLoading(true);

      if (identity) {
        try {
          console.log('Warning: Auth context fetching user info for:', identity.email);
          const userInfo = await FirestoreClientHelper.getOne<User>(Collection.USERS, [
            { field: 'email', op: '==', value: identity.email }
          ]);

          setUserState({ identity, userInfo });
        } catch (error) {
          console.error('Error fetching user info:', error);
          setUserState({ identity, userInfo: null });
        }
      } else {
        setUserState(null);
        // Clear cookie when user logs out
        Cookies.remove(firebaseIdToken);
      }

      setLoading(false);
    });

    return (): void => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(firebaseAuth);
      setUserState(null);
      // Clear the cookie to prevent middleware issues
      Cookies.remove(firebaseIdToken);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async (): Promise<void> => {
    const { currentUser } = firebaseAuth;
    if (currentUser) {
      try {
        const userInfo = await FirestoreClientHelper.getOne<User>(Collection.USERS, [
          { field: 'email', op: '==', value: currentUser.email }
        ]);
        setUserState({ identity: currentUser, userInfo });
      } catch (error) {
        console.error('Error refreshing user info:', error);
      }
    }
  };

  return <AuthContext.Provider value={{ userState, loading, logout, refreshUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
