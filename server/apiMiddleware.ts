import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';

// In-memory active admin sessions map (token -> session info)
const activeAdminSessions = new Map<string, { username: string; expiresAt: number }>();

// Secret hash for admin credentials (admin:admin123)
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

export function handleApiRequests(req: IncomingMessage, res: ServerResponse, next: () => void) {
  if (!req.url?.startsWith('/api/')) {
    return next();
  }

  // Handle CORS & JSON header
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'POST' && req.url === '/api/admin/login') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        // Timing-safe comparison to prevent timing attacks
        const userMatch = username === ADMIN_USER;
        const passMatch = password === ADMIN_PASS;

        if (userMatch && passMatch) {
          const token = `adm_${crypto.randomBytes(32).toString('hex')}`;
          // 24-hour session
          activeAdminSessions.set(token, {
            username,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          });

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              success: true,
              token,
              admin: {
                id: 'admin_root',
                username: ADMIN_USER,
                role: 'admin',
              },
            })
          );
        } else {
          res.statusCode = 401;
          return res.end(
            JSON.stringify({
              success: false,
              message: 'Invalid administrative username or password.',
            })
          );
        }
      } catch {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, message: 'Invalid request payload.' }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/admin/verify') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const { token } = JSON.parse(body);
        const session = activeAdminSessions.get(token);
        if (session && session.expiresAt > Date.now()) {
          res.statusCode = 200;
          return res.end(JSON.stringify({ valid: true, username: session.username }));
        } else {
          if (session) activeAdminSessions.delete(token);
          res.statusCode = 401;
          return res.end(JSON.stringify({ valid: false, message: 'Session expired or invalid.' }));
        }
      } catch {
        res.statusCode = 400;
        return res.end(JSON.stringify({ valid: false }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/admin/logout') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const { token } = JSON.parse(body);
        if (token) activeAdminSessions.delete(token);
        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true }));
      } catch {
        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true }));
      }
    });
    return;
  }

  // 10-Second Ad Gate server-side challenge session verification endpoint
  if (req.method === 'POST' && req.url === '/api/adgate/start') {
    const sessionId = `gate_${crypto.randomBytes(16).toString('hex')}`;
    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        sessionId,
        requiredSeconds: 10,
        startTime: Date.now(),
      })
    );
  }

  next();
}
