/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import {
  getRoleMetadata,
  type RoleMetadata,
  type RolePermissions,
} from '../lib/roles';
import type { UserProfile } from '../types';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  roleMeta: RoleMetadata | null;
  permissions: RolePermissions | null;
  isAppOwner: boolean;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  authFetch: (input: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAppOwner, setIsAppOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const userRef = useRef<FirebaseUser | null>(null);

  const authFetch = useCallback(
    async (input: string, init: RequestInit = {}): Promise<Response> => {
      const currentUser = userRef.current || auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be signed in to perform this action.');
      }
      const token = await currentUser.getIdToken();
      const headers = new Headers(init.headers || {});
      headers.set('Authorization', `Bearer ${token}`);
      if (init.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      return fetch(input, { ...init, headers });
    },
    []
  );

  const loadProfile = useCallback(async (user: FirebaseUser) => {
    setAuthError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setProfile(null);
        setIsAppOwner(false);
        setAuthError(data.error || 'Unable to verify your security profile.');
        return;
      }
      setProfile(data.user);
      setIsAppOwner(Boolean(data.isAppOwner));
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setProfile(null);
      setIsAppOwner(false);
      setAuthError('Could not connect to authentication service. Please try again.');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      userRef.current = user;
      setFirebaseUser(user);
      if (user) {
        setLoading(true);
        await loadProfile(user);
        setLoading(false);
      } else {
        setProfile(null);
        setIsAppOwner(false);
        setAuthError(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [loadProfile]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error('Google Sign-In failed:', err);
      setAuthError(err?.message || 'Sign-in failed. Please try again.');
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthError(null);
    await signOut(auth);
    setProfile(null);
    setIsAppOwner(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    const current = userRef.current || auth.currentUser;
    if (current) {
      await loadProfile(current);
    }
  }, [loadProfile]);

  const roleMeta = profile ? getRoleMetadata(profile.role) : null;
  const permissions = roleMeta ? roleMeta.permissions : null;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        roleMeta,
        permissions,
        isAppOwner,
        loading,
        authError,
        signInWithGoogle,
        logout,
        refreshProfile,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
