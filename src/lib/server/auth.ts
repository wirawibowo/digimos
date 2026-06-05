import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { sessions, users } from './schema';
import type { Cookies } from '@sveltejs/kit';

const SESSION_COOKIE = 'digimos_session';
const SESSION_TTL_DAYS = 7;

type SafeUser = {
	id: number;
	username: string;
	name: string;
	role: string;
	masjidId: number | null;
};

export async function hashPassword(password: string) {
	return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
	return bcrypt.compare(password, hash);
}

export function setSessionCookie(
	cookies: Cookies,
	sessionId: string,
	expiresAt: string
) {
	const secure = process.env.NODE_ENV === 'production';

	cookies.set(SESSION_COOKIE, sessionId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure,
		expires: new Date(expiresAt)
	});
}

export async function createSession(userId: number) {
	const id = crypto.randomUUID();
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);
	const expiresAtIso = expiresAt.toISOString();

	await db.insert(sessions).values({
		id,
		userId,
		expiresAt: expiresAtIso,
		createdAt: new Date().toISOString()
	});

	return { id, expiresAt: expiresAtIso };
}

export async function destroySession(cookies: Cookies) {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (sessionId) {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
	}

	cookies.delete(SESSION_COOKIE, { path: '/' });
}

export async function validateSession(cookies: Cookies): Promise<SafeUser | null> {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (!sessionId) {
		return null;
	}

	const session = db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
	if (!session) {
		cookies.delete(SESSION_COOKIE, { path: '/' });
		return null;
	}

	if (new Date(session.expiresAt) <= new Date()) {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
		cookies.delete(SESSION_COOKIE, { path: '/' });
		return null;
	}

	const user = db
		.select({
			id: users.id,
			username: users.username,
			name: users.name,
			role: users.role,
			masjidId: users.masjidId
		})
		.from(users)
		.where(eq(users.id, session.userId))
		.get();

	if (!user) {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
		cookies.delete(SESSION_COOKIE, { path: '/' });
		return null;
	}

	return user;
}
