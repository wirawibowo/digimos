<script lang="ts">
	import { page } from '$app/state';

	const user = $derived(page.data.user);
	const masjidList = $derived(page.data.masjidList ?? []);
	const currentPath = $derived(page.url.pathname);
	let { children } = $props();

	function initial(name: string) {
		return name?.charAt(0).toUpperCase() ?? 'A';
	}
</script>

<svelte:head>
	<title>Digimos Admin</title>
</svelte:head>

<div class="app-shell">
	<header class="topbar">
		<div class="brand">
			<span class="mark">
				<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.4 0 .8.2 1 .6l1.2 2c.2.4.2.8 0 1.2L12.8 8.4c-.1.2-.2.4-.2.6V11h3.3a3 3 0 0 1 3 3v7H5V14a3 3 0 0 1 3-3h3.3V9a1 1 0 0 0-.2-.6L9.8 5.8a1 1 0 0 1 0-1.2l1.2-2c.2-.4.6-.6 1-.6Z"/></svg>
			</span>
			<span><span class="accent">Digi</span>mos</span>
		</div>

		<nav class="nav">
			<a href="/dashboard" class:active={currentPath === '/dashboard'}>Dashboard</a>
			<a href="/masjid" class:active={currentPath === '/masjid'}>Masjid</a>
			{#if user?.role === 'superadmin'}
				<a href="/users" class:active={currentPath === '/users'}>Pengguna</a>
			{/if}
		</nav>

		<div class="topbar-right">
			{#if masjidList.length > 0}
				<div class="masjid-pill">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
					{masjidList[0]?.name}
				</div>
			{/if}
			<div class="user-pill">
				<span class="avatar">{initial(user?.name ?? 'A')}</span>
				<span>{user?.name}</span>
			</div>
			<form method="POST" action="/api/auth?_method=DELETE">
				<button class="btn ghost" type="submit">Keluar</button>
			</form>
		</div>
	</header>

	<main class="content">
		{@render children()}
	</main>
</div>

<style>
	.app-shell {
		min-height: 100vh;
	}

	.topbar {
		position: sticky;
		top: 0;
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24px;
		background: rgba(6, 18, 46, 0.7);
		border-bottom: 1px solid var(--border);
		backdrop-filter: blur(10px);
		z-index: 10;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		font-weight: 800;
		font-size: 18px;
		letter-spacing: 0.3px;
	}

	.brand .mark {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: linear-gradient(135deg, #c89a45, #f0cd86 50%, #a37a2a);
		display: grid;
		place-items: center;
		color: #0a1f4d;
		flex-shrink: 0;
	}

	.brand .mark svg {
		width: 22px;
		height: 22px;
	}

	.accent {
		color: var(--gold-300);
	}

	.nav {
		display: flex;
		gap: 4px;
	}

	.nav a {
		color: rgba(255, 255, 255, 0.7);
		text-decoration: none;
		padding: 8px 14px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		transition: background 0.15s, color 0.15s;
	}

	.nav a:hover {
		color: #fff;
		background: rgba(255, 255, 255, 0.06);
	}

	.nav a.active {
		background: var(--navy-600);
		color: #fff;
	}

	.topbar-right {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.masjid-pill {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border);
		border-radius: 999px;
		font-size: 12px;
		color: var(--muted);
	}

	.user-pill {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 12px 5px 5px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border);
		border-radius: 999px;
		font-size: 13px;
	}

	.avatar {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--gold-400);
		color: #0a1f4d;
		display: grid;
		place-items: center;
		font-weight: 700;
		font-size: 13px;
	}

	.content {
		max-width: 1280px;
		margin: 0 auto;
		padding: 32px 24px 80px;
	}
</style>
