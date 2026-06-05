<script lang="ts">
	import { page } from '$app/state';
	import StatCard from '$lib/components/StatCard.svelte';

	const masjidList = $derived(page.data.masjidList ?? []);
	const totalMasjid = $derived(page.data.totalMasjid ?? 0);
	const nextPrayer = $derived(page.data.nextPrayer ?? 'Belum sinkron');
	const nextTime = $derived(page.data.nextTime ?? '--:--');
</script>

<section class="dashboard">
	<div class="section-header">
		<div>
			<h1>Dashboard</h1>
			<p>Ringkasan cepat untuk semua masjid yang terdaftar.</p>
		</div>
		<a class="btn gold" href="/masjid">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
			Tambah Masjid
		</a>
	</div>

	<div class="stats">
		<div class="stat">
			<div class="lbl">Total Masjid</div>
			<div class="val">{totalMasjid}</div>
			<div class="delta" style="color: var(--muted)">terdaftar dalam sistem</div>
		</div>
		<div class="stat">
			<div class="lbl">Total Display</div>
			<div class="val">{totalMasjid}</div>
			<div class="delta" style="color: var(--muted)">1 display / masjid</div>
		</div>
		<div class="stat gold">
			<div class="lbl">Sholat Berikutnya</div>
			<div class="val">{nextPrayer}</div>
			<div class="delta">{nextTime}</div>
		</div>
	</div>

	<div class="masjid-grid">
		{#each masjidList as masjid}
			<article class="card masjid-card">
				<div class="card-top">
					<div class="mosque-icon">
						<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.4 0 .8.2 1 .6l1.2 2c.2.4.2.8 0 1.2L12.8 8.4c-.1.2-.2.4-.2.6V11h3.3a3 3 0 0 1 3 3v7H5V14a3 3 0 0 1 3-3h3.3V9a1 1 0 0 0-.2-.6L9.8 5.8a1 1 0 0 1 0-1.2l1.2-2c.2-.4.6-.6 1-.6Z"/></svg>
					</div>
					<div class="card-info">
						<h3>{masjid.name}</h3>
						<p>{masjid.address}</p>
					</div>
				</div>
				<div class="card-meta">
					<span class="badge">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
						{masjid.cityName}
					</span>
					<span class="badge">{masjid.apiProvider}</span>
				</div>
				<div class="card-actions">
					<a class="btn ghost" href="/admin/{masjid.id}">Kelola</a>
					<a class="btn ghost" href="/settings/{masjid.id}">Tema</a>
					<a class="btn ghost" href="/jadwal/{masjid.id}">Jadwal</a>
					<a class="btn ghost" href="/iqamah/{masjid.id}">Adzan & Iqamah</a>
					<a class="btn gold" href="/display/{masjid.id}" target="_blank">Display ↗</a>
				</div>
			</article>
		{:else}
			<div class="empty-state">
				<div class="empty-icon">
					<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
				</div>
				<h3>Belum ada masjid</h3>
				<p>Tambahkan masjid pertama untuk mulai menggunakan Digimos.</p>
				<a class="btn gold" href="/masjid">+ Tambah Masjid</a>
			</div>
		{/each}
	</div>
</section>

<style>
	.dashboard {
		display: grid;
		gap: 28px;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 14px;
	}

	.masjid-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 16px;
	}

	.masjid-card {
		display: flex;
		flex-direction: column;
		gap: 16px;
		transition: transform 0.15s, border-color 0.15s;
	}

	.masjid-card:hover {
		transform: translateY(-2px);
		border-color: var(--gold-300);
	}

	.card-top {
		display: flex;
		gap: 14px;
		align-items: flex-start;
	}

	.mosque-icon {
		width: 46px;
		height: 46px;
		border-radius: 12px;
		background: rgba(243, 205, 134, 0.12);
		border: 1px solid rgba(243, 205, 134, 0.25);
		display: grid;
		place-items: center;
		color: var(--gold-300);
		flex-shrink: 0;
	}

	.card-info h3 {
		font-size: 17px;
		font-weight: 700;
		margin-bottom: 4px;
		letter-spacing: -0.2px;
	}

	.card-info p {
		font-size: 13px;
		color: var(--muted);
		line-height: 1.4;
	}

	.card-meta {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		padding: 4px 10px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: var(--muted);
	}

	.card-actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-top: auto;
	}

	.empty-state {
		grid-column: 1 / -1;
		text-align: center;
		padding: 60px 24px;
		background: linear-gradient(180deg, var(--panel), var(--panel-2));
		border: 1px dashed var(--border);
		border-radius: 16px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.empty-icon {
		width: 72px;
		height: 72px;
		border-radius: 20px;
		background: rgba(243, 205, 134, 0.1);
		border: 1px solid rgba(243, 205, 134, 0.2);
		display: grid;
		place-items: center;
		color: var(--gold-300);
		margin-bottom: 4px;
	}

	.empty-state h3 {
		font-size: 20px;
		font-weight: 700;
	}

	.empty-state p {
		color: var(--muted);
		font-size: 14px;
		max-width: 320px;
	}
</style>
