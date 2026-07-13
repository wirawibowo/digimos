import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users } from '$lib/server/schema';
import { createSession, destroySession, setSessionCookie, verifyPassword } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const url = new URL(request.url);
	const override = url.searchParams.get('_method');
	if (override?.toUpperCase() === 'DELETE') {
		await destroySession(cookies);
		return json({ ok: true });
	}

	const body = await request.json().catch(() => null);
	if (!body?.username || !body?.password) {
		return json({ error: 'Username dan password wajib diisi.' }, { status: 400 });
	}

	const user = db.select().from(users).where(eq(users.username, body.username)).get();
	if (!user) {
		return json({ error: 'Username atau password salah.' }, { status: 400 });
	}

	const valid = await verifyPassword(body.password, user.password);
	if (!valid) {
		return json({ error: 'Username atau password salah.' }, { status: 400 });
	}

	const session = await createSession(user.id);
	setSessionCookie(cookies, session.id, session.expiresAt);

	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ cookies }) => {
	await destroySession(cookies);
	return json({ ok: true });
};
