// src/lib/security.js
import crypto from 'crypto';

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - Input text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\$/g, '&#36;')
    .replace(/`/g, '&#96;');
}

/**
 * Generate a CSRF token
 * @returns {string} CSRF token
 */
export function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token
 * @param {string} token - CSRF token from request
 * @param {string} storedToken - CSRF token from session
 * @returns {boolean} Whether token is valid
 */
export function validateCSRFToken(token, storedToken) {
  if (!token || !storedToken) return false;
  
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(storedToken)
  );
}

/**
 * Set secure HTTP headers for an API response
 * @param {Response} response - Next.js Response object
 * @returns {Response} Response with security headers
 */
export function setSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  
  // Prevent clickjacking attacks
  headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable Cross-Site Scripting (XSS) filter
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // Strict HTTPS (for production)
  if (process.env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy to prevent XSS and other injections
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
  );
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * Rate limiter to prevent brute force attacks
 * Simple in-memory implementation (use Redis for production)
 */
const ipAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip) {
  const now = Date.now();
  
  if (!ipAttempts.has(ip)) {
    ipAttempts.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  const attempt = ipAttempts.get(ip);
  
  // Reset if lockout period has passed
  if (now - attempt.timestamp > LOCKOUT_TIME) {
    ipAttempts.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  // Check if rate limit exceeded
  if (attempt.count >= MAX_ATTEMPTS) {
    return false;
  }
  
  // Increment attempt count
  attempt.count += 1;
  ipAttempts.set(ip, attempt);
  return true;
}

/**
 * Add request ID header for tracking
 * @returns {string} Generated request ID
 */
export function generateRequestId() {
  return `req_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Log security events
 * @param {string} type - Event type
 * @param {Object} details - Event details
 */
export function logSecurityEvent(type, details) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type,
    ...details
  }));
}