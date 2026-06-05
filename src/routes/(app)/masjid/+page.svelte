<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';

	const masjidList = $derived(page.data.masjidList ?? []);
	const error = $derived(page.form?.error);
	let editMode = $state<any>(null);

	let formCityApiId = $state('');
	let formCityName = $state('');
	let formProvider = $state('myquran');
	let formMethod = $state('kemenag');
	let searchCityQuery = $state('');
	let searchCityResults = $state<{id: string, lokasi: string}[]>([]);
	let searchingCity = $state(false);

	$effect(() => {
		if (editMode) {
			formCityApiId = editMode.cityApiId || '';
			formCityName = editMode.cityName || '';
			formProvider = editMode.apiProvider || 'myquran';
			formMethod = editMode.apiMethod || '';
		} else {
			// When creating new masjid, reset or set defaults
			formCityApiId = '';
			formCityName = '';
			formProvider = 'myquran';
			formMethod = 'kemenag';
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
		formCityName = c.lokasi.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
		searchCityResults = [];
		searchCityQuery = '';
	}
</script>

<section class="masjid-page">
	<div class="section-header">
		<div>
			<h1>Kelola Masjid</h1>
			<p>Tambah, edit, dan atur data masjid yang terhubung ke sistem.</p>
		</div>
	</div>

	<div class="page-grid">
		<!-- Form tambah/edit -->
		<article class="card form-card">
			<h2>{editMode ? 'Edit Masjid' : 'Tambah Masjid Baru'}</h2>
			<p class="form-sub">Isi data masjid dan konfigurasi sumber jadwal sholat.</p>

			<form method="POST" use:enhance={() => {
				return async ({ update }) => {
					await update();
					if (!page.form?.error) editMode = null;
				};
			}} style="margin-top: 20px;">
				{#if editMode}
					<input type="hidden" name="id" value={editMode.id} />
				{/if}

				<div class="field">
					<label for="name">Nama Masjid</label>
					<input id="name" class="input" name="name" required value={editMode?.name ?? ''} placeholder="Masjid Nurul Himmah" />
				</div>
				<div class="field">
					<label for="address">Alamat</label>
					<input id="address" class="input" name="address" required value={editMode?.address ?? ''} placeholder="Jl. Contoh No. 1, Depok" />
				</div>
				<div class="field">
					<label for="phone">No. Telepon</label>
					<input id="phone" class="input" name="phone" value={editMode?.phone ?? ''} placeholder="021-xxxx" />
				</div>
				<div class="field" style="position:relative;">
					<label for="citySearch">Cari Kota (MyQuran)</label>
					<div style="display:flex; gap:8px;">
						<input id="citySearch" class="input" bind:value={searchCityQuery} placeholder="Ketik nama kota... misal: Depok" onkeydown={e => e.key === 'Enter' && (e.preventDefault(), searchCity())} />
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

				<div class="split" style="margin-top:12px;">
					<div class="field">
						<label for="cityApiId">Kode Kota (API)</label>
						<input id="cityApiId" class="input" name="cityApiId" required bind:value={formCityApiId} placeholder="0314" />
					</div>
					<div class="field">
						<label for="cityName">Nama Kota</label>
						<input id="cityName" class="input" name="cityName" required bind:value={formCityName} placeholder="Depok" />
					</div>
				</div>
				<div class="split">
					<div class="field">
						<label for="apiProvider">Provider</label>
						<select id="apiProvider" name="apiProvider" bind:value={formProvider}>
							<option value="myquran">MyQuran</option>
							<option value="aladhan">AlAdhan</option>
							<option value="manual">Manual</option>
						</select>
					</div>
					<div class="field">
						<label for="apiMethod">Metode Kalkulasi</label>
						{#if formProvider === 'aladhan'}
							<select id="apiMethod" name="apiMethod" bind:value={formMethod}>
								<option value="20">Kemenag RI (20)</option>
								<option value="11">MUIS Singapura (11)</option>
								<option value="3">Muslim World League (3)</option>
								<option value="2">ISNA (2)</option>
								<option value="1">Karachi (1)</option>
								<option value="4">Umm Al-Qura (4)</option>
								<option value="5">Egyptian (5)</option>
							</select>
						{:else if formProvider === 'myquran'}
							<input id="apiMethod" class="input" name="apiMethod" value="Kemenag (Bawaan MyQuran)" disabled />
							<input type="hidden" name="apiMethod" value="kemenag" />
						{:else}
							<input id="apiMethod" class="input" name="apiMethod" bind:value={formMethod} />
						{/if}
					</div>
				</div>

				{#if error}
					<p class="error">{error}</p>
				{/if}

				<div class="form-actions">
					<button class="btn gold" type="submit" formaction={editMode ? '?/update' : '?/create'}>
						{editMode ? 'Simpan Perubahan' : '+ Tambah Masjid'}
					</button>
					{#if editMode}
						<button class="btn ghost" type="button" onclick={() => editMode = null}>Batal</button>
					{/if}
				</div>
			</form>
		</article>

		<!-- Daftar masjid -->
		<article class="card list-card">
			<div class="list-header">
				<h2>Daftar Masjid</h2>
				<span class="count-badge">{masjidList.length}</span>
			</div>

			<div class="list-items">
				{#each masjidList as masjid}
					<div class="list-item">
						<div class="list-icon">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.4 0 .8.2 1 .6l1.2 2c.2.4.2.8 0 1.2L12.8 8.4c-.1.2-.2.4-.2.6V11h3.3a3 3 0 0 1 3 3v7H5V14a3 3 0 0 1 3-3h3.3V9a1 1 0 0 0-.2-.6L9.8 5.8a1 1 0 0 1 0-1.2l1.2-2c.2-.4.6-.6 1-.6Z"/></svg>
						</div>
						<div class="list-info">
							<h4>{masjid.name}</h4>
							<p>{masjid.address}</p>
							<span class="city-tag">{masjid.cityName} · {masjid.apiProvider}</span>
						</div>
						<div class="list-actions">
							<a class="btn ghost small" href="/admin/{masjid.id}">Kelola</a>
							<button class="btn ghost small" onclick={() => editMode = masjid}>Edit</button>
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="id" value={masjid.id} />
								<button
									class="btn small"
									style="background:rgba(255,80,80,.15); border:1px solid rgba(255,80,80,.4); color:#ff9696;"
									onclick={(e) => !confirm(`Hapus ${masjid.name}? Semua data terkait akan terhapus.`) && e.preventDefault()}
								>Hapus</button>
							</form>
						</div>
					</div>
				{:else}
					<div class="list-empty">
						<p>Belum ada masjid. Isi form di sebelah untuk menambahkan.</p>
					</div>
				{/each}
			</div>
		</article>
	</div>
</section>

<style>
	.masjid-page {
		display: grid;
		gap: 28px;
	}

	.page-grid {
		display: grid;
		grid-template-columns: minmax(360px, 1fr) minmax(360px, 1fr);
		gap: 20px;
		align-items: start;
	}

	.form-card h2,
	.list-card h2 {
		font-size: 18px;
		font-weight: 700;
		letter-spacing: -0.2px;
	}

	.form-sub {
		font-size: 13px;
		color: var(--muted);
		margin-top: 4px;
	}

	.form-actions {
		display: flex;
		gap: 10px;
		margin-top: 4px;
	}

	/* List */
	.list-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 16px;
	}

	.count-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 24px;
		height: 24px;
		padding: 0 8px;
		border-radius: 999px;
		background: rgba(243, 205, 134, 0.15);
		border: 1px solid rgba(243, 205, 134, 0.3);
		color: var(--gold-300);
		font-size: 12px;
		font-weight: 700;
	}

	.list-items {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.list-item {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 14px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 12px;
		transition: border-color 0.15s;
	}

	.list-item:hover {
		border-color: rgba(255, 255, 255, 0.15);
	}

	.list-icon {
		width: 38px;
		height: 38px;
		border-radius: 10px;
		background: rgba(243, 205, 134, 0.1);
		border: 1px solid rgba(243, 205, 134, 0.2);
		display: grid;
		place-items: center;
		color: var(--gold-300);
		flex-shrink: 0;
	}

	.list-info {
		flex: 1;
		min-width: 0;
	}

	.list-info h4 {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 3px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.list-info p {
		font-size: 12px;
		color: var(--muted);
		margin-bottom: 4px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.city-tag {
		font-size: 11px;
		color: var(--gold-300);
		opacity: 0.8;
	}

	.list-actions {
		display: flex;
		gap: 6px;
		flex-shrink: 0;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.list-empty {
		text-align: center;
		padding: 32px;
		color: var(--muted);
		font-size: 14px;
	}

	/* City Search UI */
	.search-results {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		background: var(--panel);
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
		.page-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
