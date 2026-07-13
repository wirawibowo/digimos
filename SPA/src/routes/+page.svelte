<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let masjidName = $state('');
	let cityName = $state('');
	let cityApiId = $state('');
	let apiProvider = $state<'myquran' | 'aladhan'>('myquran');
	let announcements = $state('Selamat datang\nMohon matikan ponsel saat sholat');

	if (browser) {
		const saved = localStorage.getItem('digimos-spa-config');
		if (saved) {
			const cfg = JSON.parse(saved);
			masjidName = cfg.masjidName ?? '';
			cityName = cfg.cityName ?? '';
			cityApiId = cfg.cityApiId ?? '';
			apiProvider = cfg.apiProvider ?? 'myquran';
			announcements = cfg.announcements ?? 'Selamat datang\nMohon matikan ponsel saat sholat';
		}
	}

	function save() {
		const cfg = { masjidName, cityName, cityApiId, apiProvider, announcements };
		localStorage.setItem('digimos-spa-config', JSON.stringify(cfg));
		goto('/display');
	}
</script>

<main>
	<div class="card">
		<div class="logo">🕌</div>
		<h1>Digimos SPA</h1>
		<p class="subtitle">Tampilan Masjid — Tanpa Server</p>

		<form onsubmit={(e) => { e.preventDefault(); save(); }}>
			<div class="field">
				<label for="masjidName">Nama Masjid</label>
				<input id="masjidName" type="text" bind:value={masjidName} placeholder="Masjid Al-Fahrudin" required />
			</div>

			<div class="field">
				<label for="apiProvider">Sumber Jadwal Sholat</label>
				<select id="apiProvider" bind:value={apiProvider}>
					<option value="myquran">MyQuran (Kemenag RI)</option>
					<option value="aladhan">AlAdhan (Internasional)</option>
				</select>
			</div>

			{#if apiProvider === 'myquran'}
			<div class="field">
				<label for="cityApiId">ID Kota MyQuran</label>
				<input id="cityApiId" type="text" bind:value={cityApiId} placeholder="Contoh: 0301 (Jakarta)" required />
				<span class="hint">Cek ID kota di <a href="https://api.myquran.com/v2/sholat/kota/semua" target="_blank">api.myquran.com</a></span>
			</div>
			{:else}
			<div class="field">
				<label for="cityName">Nama Kota</label>
				<input id="cityName" type="text" bind:value={cityName} placeholder="Jakarta, Indonesia" required />
			</div>
			{/if}

			<div class="field">
				<label for="announcements">Running Text (satu per baris)</label>
				<textarea id="announcements" bind:value={announcements} rows="4" placeholder="Selamat datang..."></textarea>
			</div>

			<button type="submit">Tampilkan Display →</button>
		</form>
	</div>
</main>

<style>
	main {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
	}

	.card {
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 16px;
		padding: 2.5rem;
		width: 100%;
		max-width: 480px;
	}

	.logo {
		font-size: 3rem;
		text-align: center;
		margin-bottom: 0.5rem;
	}

	h1 {
		text-align: center;
		font-size: 1.75rem;
		color: #f0cd86;
		margin-bottom: 0.25rem;
	}

	.subtitle {
		text-align: center;
		color: #888;
		font-size: 0.9rem;
		margin-bottom: 2rem;
	}

	.field {
		margin-bottom: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	label {
		font-size: 0.85rem;
		color: #aaa;
		font-weight: 500;
	}

	input, select, textarea {
		background: #111;
		border: 1px solid #333;
		border-radius: 8px;
		color: #fff;
		padding: 0.6rem 0.85rem;
		font-size: 0.95rem;
		width: 100%;
		outline: none;
		transition: border-color 0.2s;
	}

	input:focus, select:focus, textarea:focus {
		border-color: #f0cd86;
	}

	textarea {
		resize: vertical;
		font-family: inherit;
	}

	.hint {
		font-size: 0.78rem;
		color: #666;
	}

	.hint a {
		color: #f0cd86;
	}

	button {
		width: 100%;
		padding: 0.85rem;
		background: #f0cd86;
		color: #111;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		margin-top: 0.5rem;
		transition: opacity 0.2s;
	}

	button:hover {
		opacity: 0.88;
	}
</style>
