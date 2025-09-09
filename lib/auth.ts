import { cookies } from 'next/headers';
import { verifyJwt } from './jwt';

export type AuthUser = {
  userId: string;
  email: string;
  role?: string;
};

export async function getAuth(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const cookieJwt = cookieStore.get('auth_jwt')?.value || '';
  if (cookieJwt) {
    const payload = verifyJwt(cookieJwt);
    if (payload && typeof payload.email === 'string') {
      return { userId: String(payload.sub || payload.email), email: payload.email as string, role: payload.role as string | undefined };
    }
  }
  return null;
}

export async function getAuthFromRequest(req: Request): Promise<AuthUser | null> {
  const header = req.headers.get('authorization') || '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7) : '';
  if (token) {
    const payload = verifyJwt(token);
    if (payload && typeof payload.email === 'string') {
      return { userId: String(payload.sub || payload.email), email: payload.email as string, role: payload.role as string | undefined };
    }
  }
  return null;
}

export async function requireTeacher(req: Request): Promise<{ auth?: AuthUser; errorResponse?: Response }> {
  const auth = await getAuthFromRequest(req);
  if (!auth) {
    return { errorResponse: new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  }
  if (auth.role !== 'teacher') {
    return { errorResponse: new Response(JSON.stringify({ success: false, error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } }) };
  }
  return { auth };
}


