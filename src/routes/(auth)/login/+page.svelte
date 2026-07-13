<script lang="ts">
	import { page } from '$app/state';

	let showError = $derived(page.form?.error);
</script>

<svelte:head>
	<title>Login — Digimos</title>
</svelte:head>

<main class="auth">
	<div class="auth-bg"></div>
	<section class="auth-card">
		<div class="auth-brand">
			<div class="auth-logo-mark">
				<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.4 0 .8.2 1 .6l1.2 2c.2.4.2.8 0 1.2L12.8 8.4c-.1.2-.2.4-.2.6V11h3.3a3 3 0 0 1 3 3v7H5V14a3 3 0 0 1 3-3h3.3V9a1 1 0 0 0-.2-.6L9.8 5.8a1 1 0 0 1 0-1.2l1.2-2c.2-.4.6-.6 1-.6Z"/></svg>
			</div>
			<h1 class="auth-logo"><span class="accent">Digi</span>mos</h1>
			<p>Masuk untuk mengelola display masjid Anda.</p>
		</div>

		<form method="POST">
			<div class="field">
				<label for="username">Username</label>
				<input id="username" class="auth-input" name="username" autocomplete="username" required placeholder="admin" />
			</div>
			<div class="field">
				<label for="password">Password</label>
				<input id="password" class="auth-input" name="password" type="password" autocomplete="current-password" required placeholder="••••••••" />
			</div>
			{#if showError}
				<p class="error">{showError}</p>
			{/if}
			<button class="btn-login" type="submit">
				Masuk
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
			</button>
		</form>
	</section>
</main>

<style>
	.auth {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 32px;
		position: relative;
		overflow: hidden;
	}

	.auth-card {
		width: min(420px, 100%);
		background: linear-gradient(180deg, rgba(13, 35, 96, 0.9), rgba(10, 28, 79, 0.9));
		border: 1px solid var(--border);
		border-radius: 20px;
		padding: 36px;
		backdrop-filter: blur(16px);
		box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
		position: relative;
		z-index: 1;
	}

	.auth-brand {
		text-align: center;
		margin-bottom: 28px;
	}

	.auth-logo-mark {
		width: 52px;
		height: 52px;
		border-radius: 14px;
		background: linear-gradient(135deg, #c89a45, #f0cd86 50%, #a37a2a);
		display: grid;
		place-items: center;
		color: #0a1f4d;
		margin: 0 auto 12px;
	}

	.auth-logo-mark svg {
		width: 28px;
		height: 28px;
	}

	.auth-logo {
		font-size: 28px;
		font-weight: 800;
		letter-spacing: 0.3px;
		margin-bottom: 6px;
	}

	.accent {
		color: var(--gold-300);
	}

	.auth-brand p {
		color: var(--muted);
		font-size: 14px;
	}

	form {
		display: grid;
		gap: 14px;
	}

	.field {
		display: grid;
		gap: 6px;
	}

	.field label {
		font-size: 12px;
		font-weight: 600;
		color: var(--muted);
		letter-spacing: 0.4px;
	}

	.auth-input {
		background: rgba(6, 17, 46, 0.8);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 12px 14px;
		color: #fff;
		font-family: inherit;
		font-size: 15px;
		outline: none;
		width: 100%;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.auth-input:focus {
		border-color: var(--gold-300);
		box-shadow: 0 0 0 3px rgba(240, 205, 134, 0.2);
	}

	.auth-input::placeholder {
		color: rgba(255, 255, 255, 0.25);
	}

	.btn-login {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 13px 16px;
		border: none;
		border-radius: 12px;
		background: linear-gradient(180deg, var(--gold-300), var(--gold-400));
		color: #0a1f4d;
		font-family: inherit;
		font-size: 15px;
		font-weight: 700;
		cursor: pointer;
		margin-top: 4px;
		transition: transform 0.15s, box-shadow 0.15s;
		box-shadow: 0 6px 20px rgba(243, 205, 134, 0.3);
	}

	.btn-login:hover {
		transform: translateY(-1px);
		box-shadow: 0 10px 28px rgba(243, 205, 134, 0.4);
	}

	.error {
		color: #ff9696;
		font-size: 13px;
		background: rgba(255, 80, 80, 0.1);
		border: 1px solid rgba(255, 80, 80, 0.3);
		padding: 10px 14px;
		border-radius: 8px;
	}
</style>
