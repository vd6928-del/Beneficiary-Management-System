/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Sprout, Lock, LogIn, AlertTriangle, LogOut } from 'lucide-react';
import { ROLE_HIERARCHY, SECURITY_ROLES } from '../lib/roles';

interface LoginScreenProps {
  onSignIn: () => Promise<void>;
  onSignOut?: () => Promise<void>;
  error?: string | null;
  isSignedInButBlocked?: boolean;
  userEmail?: string | null;
}

export default function LoginScreen({
  onSignIn,
  onSignOut,
  error,
  isSignedInButBlocked = false,
  userEmail,
}: LoginScreenProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleClick = async () => {
    setSubmitting(true);
    try {
      await onSignIn();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-6 font-sans text-slate-800">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-white">
        {/* Left Branding & Security Hierarchy */}
        <div className="lg:col-span-7 bg-slate-900 text-white p-8 lg:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Beneficiary Master Portal
                </h1>
                <p className="text-xs text-slate-400">
                  Climate Resilient Agriculture · Role-Based Access System
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-8">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <ShieldCheck className="w-4 h-4" />
                <span>4-Tier Security Levels</span>
              </div>

              <div className="space-y-2.5">
                {SECURITY_ROLES.map((roleKey) => {
                  const meta = ROLE_HIERARCHY[roleKey];
                  return (
                    <div
                      key={roleKey}
                      className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{meta.label}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Level {meta.level}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {meta.scopeSummary}
                        </p>
                      </div>
                      <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-8">
            All requests are verified server-side with role and village-level access enforcement.
          </p>
        </div>

        {/* Right Sign-In Panel */}
        <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
              <Lock className="w-3 h-3" />
              Secure Sign-In
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-3">
              {isSignedInButBlocked ? 'Access Restricted' : 'Sign in to continue'}
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {isSignedInButBlocked
                ? `Signed in as ${userEmail || 'unknown account'}. Your account cannot access the portal right now.`
                : 'Authenticate with your authorized Google account. Your security level (Admin, State Incharge, Project Manager, or Field Worker) is automatically applied.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {isSignedInButBlocked && onSignOut ? (
            <button
              onClick={onSignOut}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out & Switch Account
            </button>
          ) : (
            <button
              onClick={handleClick}
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition flex items-center justify-center gap-2.5 shadow-md shadow-blue-600/20"
            >
              <LogIn className="w-4 h-4" />
              <span>{submitting ? 'Verifying account...' : 'Sign in with Google'}</span>
            </button>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
            <p className="font-semibold text-slate-700">New team member?</p>
            <p>
              New accounts start with <strong>Field Worker</strong> access unless pre-assigned a
              higher role by your System Administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
