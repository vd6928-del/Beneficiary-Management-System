/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Request, Response, NextFunction } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser, isAppOwnerUser, type DbUser } from '../db/users.ts';
import type { SecurityRole } from '../lib/roles.ts';

export interface AuthRequest extends Request {
  firebaseUser?: DecodedIdToken;
  dbUser?: DbUser;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({ error: 'Authentication token is missing.' });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (!decodedToken.email) {
      return res.status(403).json({ error: 'Verified email address is required.' });
    }

    const dbUser = await getOrCreateUser({
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
      photoUrl: decodedToken.picture,
    });

    if (!dbUser.isActive) {
      return res.status(403).json({
        error: 'Your account has been suspended by an Administrator. Please contact support.',
      });
    }

    req.firebaseUser = decodedToken;
    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }
};

export const requireRole = (allowedRoles: SecurityRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.dbUser.role)) {
      return res.status(403).json({
        error: 'Access denied. Your security level does not permit this action.',
      });
    }
    next();
  };
};

export const requireAppOwner = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.dbUser) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (!isAppOwnerUser(req.dbUser)) {
    return res.status(403).json({
      error: 'Access denied. This action is restricted strictly to the App Owner.',
    });
  }
  next();
};
