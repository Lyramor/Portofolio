// src/lib/auth.js
import { query } from './db';

/**
 * Get the current authenticated user from session token
 * @param {Object} cookieStore - Next.js cookies store
 * @returns {Promise<Object|null>} User object or null if not authenticated
 */
export async function getSessionUser(cookieStore) {
  try {
    // Get session token from cookie
    const sessionToken = cookieStore.get('lyra_session')?.value;

    if (!sessionToken) {
      return null;
    }

    // Get user from session
    const sessions = await query(
      `SELECT u.id, u.username, u.email 
       FROM sessions s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.token = ? AND s.expires_at > NOW()`,
      [sessionToken]
    );

    if (sessions.length === 0) {
      return null;
    }

    return sessions[0];
  } catch (error) {
    console.error('Error getting session user:', error);
    return null;
  }
}

/**
 * Middleware to validate session token in API routes
 * @param {Function} handler - API route handler
 * @returns {Function} Middleware wrapped handler
 */
export function withAuth(handler) {
  return async (req, res) => {
    try {
      // Get session token from cookie
      const sessionToken = req.cookies.get('lyra_session')?.value;

      if (!sessionToken) {
        return new Response(
          JSON.stringify({ message: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Get user from session
      const user = await getSessionUser(req.cookies);

      if (!user) {
        return new Response(
          JSON.stringify({ message: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Attach user to request
      req.user = user;

      // Pass to handler
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return new Response(
        JSON.stringify({ message: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} text - Input text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}