<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';

	const masjid = $derived(page.data.masjid);
	const schedule = $derived(page.data.schedule);
	const iqamah = $derived(page.data.iqamah);
	const announcementList = $derived(page.data.announcementList ?? []);
	let marqueeSpeed = $state(page.data.marqueeSpeed ?? 60);
	$effect(() => { marqueeSpeed = page.data.marqueeSpeed ?? 60; });
	const error = $derived(page.form?.error);

	const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth() + 1;

	const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

	let syncStatus = $state('');
	let syncingYear = $state(false);
	let syncYearProgress = $state(0);

	let formCityApiId = $state('');
	let formCityName = $state('');
	let formProvider = $state('myquran');
	let formMethod = $state('');
	let searchCityQuery = $state('');
	let searchCityResults = $state<{id: string, lokasi: string}[]>([]);
	let searchingCity = $state(false);

	$effect(() => {
		if (masjid) {
			formCityApiId = masjid.cityApiId || '';
			formCityName = masjid.cityName || '';
			formProvider = masjid.apiProvider || 'myquran';
			formMethod = masjid.apiMethod || '';
		}
	});

	async function searchCity() {
		if (!searchCityQuery) return;
		searchingCity = true;
		try {
			const res = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${encodeURIComponent(searchCityQuery)}`);
			const json = await res.json();
			if (json.status && json.data) {
				searchCityResults = Array.isArray(json.data) ? json.data : [json.data];
			} else {
				searchCityResults = [];
			}
		} catch (e) {
			searchCityResults = [];
		}
		searchingCity = false;
	}

	function selectCity(c: {id: string, lokasi: string}) {
		formCityApiId = c.id;
		// Capitalize title case nicely
		formCityName = c.lokasi.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
		searchCityResults = [];
		searchCityQuery = '';
	}

	async function syncMonth() {
		syncStatus = 'Menyinkronkan...';
		try {
			const res = await fetch('/api/jadwal/sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ masjid_id: masjid.id, month: currentMonth, year: currentYear })
			});
			const result = await res.json();
			if (result.success) {
				syncStatus = `✓ ${result.data.length} hari berhasil disinkron`;
				setTimeout(() => window.location.reload(), 1500);
			} else {
				syncStatus = 'Gagal: ' + (result.error ?? 'Unknown error');
			}
		} catch (e: any) {
			syncStatus = 'Error: ' + e.message;
		}
		setTimeout(() => syncStatus = '', 5000);
	}

	async function syncYear() {
		if (!confirm(`Sinkronkan seluruh tahun ${currentYear} dari API ${masjid.apiProvider}?\n\nProses ini memerlukan koneksi internet dan memakan waktu ~30 detik.`)) return;

		syncingYear = true;
		syncYearProgress = 0;
		let ok = 0, fail = 0;

		for (let m = 1; m <= 12; m++) {
			syncYearProgress = m;
			try {
				const res = await fetch('/api/jadwal/sync', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ masjid_id: masjid.id, month: m, year: currentYear })
				});
				const r = await res.json();
				if (r.success) ok++; else fail++;
			} catch { fail++; }
		}

		syncingYear = false;
		syncYearProgress = 0;
		if (fail === 0) {
			syncStatus = `✓ Setahun berhasil! ${ok} bulan (±${ok * 30} hari) tersimpan.`;
			setTimeout(() => window.location.reload(), 2000);
		} else {
			syncStatus = `Selesai: ${ok} bulan berhasil, ${fail} gagal.`;
		}
		setTimeout(() => syncStatus = '', 7000);
	}
</script>

<section class="admin">
	<div class="section-header">
		<div>
			<h1>{masjid.name}</h1>
			<p>Kelola jadwal sholat, pengumuman, dan identitas masjid.</p>
		</div>
		<div class="header-btns">
			<a class="btn ghost" href={`/jadwal/${masjid.id}`}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
				Jadwal Bulanan
			</a>
			<a class="btn ghost" href={`/settings/${masjid.id}`}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
				Tema
			</a>
			<a class="btn gold" href={`/display/${masjid.id}`} target="_blank">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
				Buka Display ↗
			</a>
		</div>
	</div>

	<div class="main-grid">

		<!-- ── KOLOM KIRI ── -->
		<div class="col-left">

			<!-- Jadwal Hari Ini -->
			<section class="card">
				<div class="card-head">
					<div>
						<h3>Jadwal Sholat Hari Ini</h3>
						<p class="card-sub">{today} · {masjid.cityName}</p>
					</div>
					<span class="provider-badge">{masjid.apiProvider}</span>
				</div>

				{#if schedule}
					<div class="prayer-grid">
						{#each [
							{ name: 'Shubuh', time: schedule.shubuh, iq: iqamah?.shubuh },
							{ name: 'Syuruq', time: schedule.syuruq, iq: null },
							{ name: 'Dzuhur', time: schedule.dzuhur, iq: iqamah?.dzuhur },
							{ name: 'Ashar', time: schedule.ashar, iq: iqamah?.ashar },
							{ name: 'Maghrib', time: schedule.maghrib, iq: iqamah?.maghrib },
							{ name: 'Isya', time: schedule.isya, iq: iqamah?.isya },
						] as p}
							<div class="prayer-row">
								<span class="prayer-name">{p.name}</span>
								<span class="prayer-time">{p.time}</span>
								{#if p.iq !== null && p.iq !== undefined}
									<span class="iqamah-time">+{p.iq} mnt</span>
								{:else}
									<span></span>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div class="no-schedule">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
						<p>Belum ada jadwal untuk hari ini.</p>
						<p class="sub-hint">Klik "Sinkron Bulan Ini" untuk mengambil data dari API.</p>
					</div>
				{/if}

				<!-- Progress bar sinkron setahun -->
				{#if syncingYear}
					<div class="year-bar">
						<div class="bar-track">
							<div class="bar-fill" style="width: {(syncYearProgress / 12) * 100}%"></div>
						</div>
						<div class="bar-months">
							{#each monthNames as name, i}
								<span class="bar-m" class:done={i + 1 < syncYearProgress} class:active={i + 1 === syncYearProgress}>
									{name}
								</span>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Sync buttons -->
				<div class="sync-row">
					{#if syncStatus}
						<span class="sync-msg">{syncStatus}</span>
					{/if}
					<div class="sync-btns">
						<button class="btn ghost" onclick={syncMonth} disabled={syncingYear}>
							<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><polyline points="21 3 21 8 16 8"/></svg>
							Bulan Ini
						</button>
						<button class="btn gold" onclick={syncYear} disabled={syncingYear}>
							{#if syncingYear}
								<span class="spin">⟳</span> {syncYearProgress}/12...
							{:else}
								<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><polyline points="21 3 21 8 16 8"/></svg>
								Sinkron Setahun {currentYear}
							{/if}
						</button>
					</div>
				</div>
			</section>

			<!-- Offset Iqamah dipindah ke menu Adzan & Iqamah -->
			<section class="card">
				<h3>Offset & Mode Iqamah</h3>
				<p class="card-sub">Pengaturan offset iqamah dan mode adzan otomatis tersedia di halaman khusus.</p>
				<a class="btn primary" href="/iqamah/{masjid.id}" style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; margin-top:8px;">
					⏱ Buka Pengaturan Adzan & Iqamah
				</a>
			</section>
		</div>

		<!-- ── KOLOM KANAN ── -->
		<div class="col-right">

			<!-- Running Text -->
			<section class="card">
				<h3>Running Text / Pengumuman</h3>
				<p class="card-sub">Teks berjalan di bagian bawah display TV.</p>

				<form method="POST" action="?/addAnnouncement" use:enhance style="margin-top: 14px;">
					<div class="field">
						<label for="ann-text">Teks baru</label>
						<textarea id="ann-text" class="textarea" name="text" rows="3" placeholder="Kajian rutin setiap Sabtu ba'da Maghrib..."></textarea>
					</div>
					<button class="btn gold" type="submit" style="width:100%;">+ Tambah Pengumuman</button>
				</form>

				<div class="ann-list">
					{#each announcementList as ann}
						<div class="ann-item">
							<p>{ann.text}</p>
							<div class="ann-actions">
								<form method="POST" action="?/deleteAnnouncement" use:enhance>
									<input type="hidden" name="id" value={ann.id} />
									<button class="icon-btn" type="submit" title="Hapus" onclick={(e) => !confirm('Hapus pengumuman ini?') && e.preventDefault()}>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
									</button>
								</form>
							</div>
						</div>
					{:else}
						<p class="empty-ann">Belum ada pengumuman. Tambahkan di atas.</p>
					{/each}
				</div>

				<form method="POST" action="?/updateMarqueeSpeed" use:enhance style="margin-top:16px; display:flex; align-items:center; gap:10px;">
					<label for="marquee-speed" style="font-size:13px; font-weight:500; white-space:nowrap;">Kecepatan teks:</label>
					<select id="marquee-speed" class="input" name="marqueeSpeed" bind:value={marqueeSpeed} style="flex:1;">
						<option value={120}>Sangat Lambat</option>
						<option value={80}>Lambat</option>
						<option value={50}>Sedang</option>
						<option value={30}>Cepat</option>
						<option value={15}>Sangat Cepat</option>
					</select>
					<button class="btn ghost" type="submit">Simpan</button>
				</form>
			</section>

			<!-- Identitas Masjid -->
			<section class="card">
				<h3>Identitas & Konfigurasi API</h3>
				<p class="card-sub">Data masjid dan sumber jadwal sholat otomatis.</p>

				<form method="POST" action="?/updateMasjid" use:enhance style="margin-top: 14px;">
					<div class="field">
						<label for="m-name">Nama Masjid</label>
						<input id="m-name" class="input" name="name" value={masjid.name} />
					</div>
					<div class="field">
						<label for="m-addr">Alamat</label>
						<input id="m-addr" class="input" name="address" value={masjid.address} />
					</div>
					<div class="field">
						<label for="m-phone">Telepon</label>
						<input id="m-phone" class="input" name="phone" value={masjid.phone} />
					</div>
					<div class="field" style="position:relative;">
						<label for="m-city-search">Cari Kota (MyQuran)</label>
						<div style="display:flex; gap:8px;">
							<input id="m-city-search" class="input" bind:value={searchCityQuery} placeholder="Ketik nama kota... misal: Depok" onkeydown={e => e.key === 'Enter' && (e.preventDefault(), searchCity())} />
							<button type="button" class="btn ghost" onclick={searchCity} disabled={searchingCity} style="flex-shrink:0;">
								{searchingCity ? 'Mencari...' : 'Cari'}
							</button>
						</div>
						{#if searchCityResults.length > 0}
							<div class="search-results">
								{#each searchCityResults as c}
									<button type="button" class="city-item" onclick={() => selectCity(c)}>
										<span class="c-id">{c.id}</span>
										<span class="c-loc">{c.lokasi}</span>
									</button>
								{/each}
								<button type="button" class="city-close" onclick={() => searchCityResults = []}>Tutup</button>
							</div>
						{/if}
					</div>

					<div class="split" style="margin-top: 12px;">
						<div class="field">
							<label for="m-city-id">Kode Kota (API)</label>
							<input id="m-city-id" class="input" name="cityApiId" bind:value={formCityApiId} placeholder="0314" />
						</div>
						<div class="field">
							<label for="m-city-name">Nama Kota</label>
							<input id="m-city-name" class="input" name="cityName" bind:value={formCityName} />
						</div>
					</div>
					<div class="split">
						<div class="field">
							<label for="m-provider">Provider</label>
							<select id="m-provider" name="apiProvider" bind:value={formProvider}>
								<option value="myquran">MyQuran</option>
								<option value="aladhan">AlAdhan</option>
								<option value="manual">Manual</option>
							</select>
						</div>
						<div class="field">
							<label for="m-method">Metode Kalkulasi</label>
							{#if formProvider === 'aladhan'}
								<select id="m-method" name="apiMethod" bind:value={formMethod}>
									<option value="20">Kemenag RI (20)</option>
									<option value="11">MUIS Singapura (11)</option>
									<option value="3">Muslim World League (3)</option>
									<option value="2">ISNA (2)</option>
									<option value="1">Karachi (1)</option>
									<option value="4">Umm Al-Qura (4)</option>
									<option value="5">Egyptian (5)</option>
								</select>
							{:else if formProvider === 'myquran'}
								<input id="m-method" class="input" name="apiMethod" value="Kemenag (Bawaan MyQuran)" disabled />
								<input type="hidden" name="apiMethod" value="kemenag" />
							{:else}
								<input id="m-method" class="input" name="apiMethod" bind:value={formMethod} />
							{/if}
						</div>
					</div>
					{#if error}
						<p class="error">{error}</p>
					{/if}
					<button class="btn primary" type="submit">Simpan Identitas</button>
				</form>
			</section>
		</div>
	</div>
</section>

<style>
	.admin { display: grid; gap: 24px; }

	/* Header */
	.header-btns { display: flex; gap: 8px; flex-wrap: wrap; }

	/* Grid layout */
	.main-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		align-items: start;
	}

	.col-left, .col-right {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	/* Cards */
	.card h3 {
		font-size: 16px;
		font-weight: 700;
		margin-bottom: 4px;
	}

	.card-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 16px;
	}

	.card-sub {
		font-size: 12px;
		color: var(--muted);
		margin-top: 2px;
	}


	.provider-badge {
		font-size: 11px;
		font-weight: 600;
		padding: 4px 10px;
		border-radius: 999px;
		background: rgba(243, 205, 134, 0.12);
		border: 1px solid rgba(243, 205, 134, 0.3);
		color: var(--gold-300);
	}

	/* Prayer table */
	.prayer-grid {
		display: grid;
		gap: 6px;
		margin-bottom: 16px;
	}

	.prayer-row {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: 12px;
		align-items: center;
		padding: 9px 12px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 8px;
	}

	.prayer-name {
		font-size: 14px;
		font-weight: 600;
	}

	.prayer-time {
		font-family: 'Inter', monospace;
		font-weight: 700;
		font-size: 16px;
		font-variant-numeric: tabular-nums;
		color: var(--gold-300);
	}

	.iqamah-time {
		font-size: 11px;
		color: var(--muted);
		background: rgba(255,255,255,.05);
		padding: 2px 8px;
		border-radius: 999px;
	}

	/* No schedule state */
	.no-schedule {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 24px;
		text-align: center;
		color: var(--muted);
		margin-bottom: 16px;
	}

	.no-schedule p { font-size: 14px; margin: 0; }
	.sub-hint { font-size: 12px !important; }

	/* Sync controls */
	.sync-row {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-top: 14px;
		border-top: 1px solid var(--border);
	}

	.sync-btns {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.sync-msg {
		font-size: 13px;
		color: #4ade80;
		font-weight: 600;
	}

	/* Year progress bar */
	.year-bar {
		margin: 12px 0;
		padding: 12px;
		background: rgba(255,255,255,.03);
		border: 1px solid var(--border);
		border-radius: 10px;
	}

	.bar-track {
		height: 6px;
		background: rgba(255,255,255,.08);
		border-radius: 999px;
		overflow: hidden;
		margin-bottom: 10px;
	}

	.bar-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--gold-300), var(--gold-400));
		border-radius: 999px;
		transition: width .4s ease;
	}

	.bar-months {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 2px;
		text-align: center;
	}

	.bar-m {
		font-size: 9px;
		font-weight: 600;
		color: var(--muted);
		padding: 3px 1px;
		border-radius: 4px;
		transition: all .2s;
	}

	.bar-m.done { color: #4ade80; background: rgba(74, 222, 128, 0.1); }
	.bar-m.active { color: var(--gold-300); background: rgba(240, 205, 134, 0.15); font-weight: 800; }

	@keyframes spin { to { transform: rotate(360deg); } }
	.spin { display: inline-block; animation: spin 1s linear infinite; }



	/* Announcements */
	.ann-list {
		margin-top: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.ann-item {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
		padding: 12px 14px;
		background: rgba(255,255,255,.03);
		border: 1px solid rgba(255,255,255,.07);
		border-radius: 10px;
		transition: border-color .15s;
	}

	.ann-item:hover { border-color: rgba(255,255,255,.14); }

	.ann-item p {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
		flex: 1;
	}

	.ann-actions { flex-shrink: 0; }

	.empty-ann {
		text-align: center;
		color: var(--muted);
		font-size: 13px;
		padding: 20px;
	}

	/* City Search */
	.search-results {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		background: var(--panel-2);
		border: 1px solid var(--border);
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.5);
		z-index: 10;
		max-height: 200px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	.city-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
		background: transparent;
		border: none;
		border-bottom: 1px solid rgba(255,255,255,.04);
		color: #fff;
		text-align: left;
		cursor: pointer;
	}
	.city-item:hover {
		background: rgba(255,255,255,.05);
	}
	.city-item .c-id {
		font-size: 11px;
		color: var(--gold-300);
		font-family: monospace;
		background: rgba(240, 205, 134, 0.15);
		padding: 2px 6px;
		border-radius: 4px;
	}
	.city-item .c-loc {
		font-size: 13px;
	}
	.city-close {
		padding: 8px;
		font-size: 11px;
		color: var(--muted);
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: center;
	}
	.city-close:hover { color: #fff; }

	@media (max-width: 900px) {
		.main-grid { grid-template-columns: 1fr; }
	}
</style>
