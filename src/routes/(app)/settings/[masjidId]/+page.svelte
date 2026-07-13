<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';

	const masjid = $derived(page.data.masjid);
	const settings = $derived(page.data.settings);
	const wallpapers = $derived(page.data.wallpapers);
	const form = $derived(page.form);

	const themes = [
		{ id: 't1', name: 'Foto + Strip Bawah', desc: 'Foto masjid dominan, jam besar & 6 jadwal pada strip biru bawah.', tag1: 'Rekomendasi', tag2: '16:9' },
		{ id: 't2', name: 'Sidebar Biru Besar', desc: 'Jam besar + daftar jadwal vertikal di panel biru kiri.', tag1: '16:9', tag2: 'Info-first' },
		{ id: 't3', name: 'Jam Analog + Sidebar Emas', desc: 'Sidebar gelap-emas, jam analog besar di tengah foto.', tag1: '16:9', tag2: 'Klasik' },
		{ id: 't4', name: 'Kartu Jadwal Vertikal', desc: 'Kartu jadwal biru di kiri, jam digital besar di kanan.', tag1: '16:9', tag2: 'Modern' },
		{ id: 't5', name: 'Jam Analog + Bar Bawah', desc: 'Banner + jam analog kiri-bawah, strip jadwal di bawah.', tag1: '16:9', tag2: 'Sinematik' },
		{ id: 't6', name: 'Sidebar + Analog Tengah', desc: 'Sidebar jadwal biru, jam analog biru di tengah foto.', tag1: '16:9', tag2: 'Klasik' },
	];
	const accents = [
		{ val: '#f0cd86', bg: 'linear-gradient(135deg,#c89a45,#f0cd86)', name: 'Gold' },
		{ val: '#2563d4', bg: '#2563d4', name: 'Blue' },
		{ val: '#16a34a', bg: '#16a34a', name: 'Green' },
		{ val: '#dc2626', bg: '#dc2626', name: 'Red' },
		{ val: '#9333ea', bg: '#9333ea', name: 'Purple' }
	];
	const fonts = ['Inter', 'DSEG7', 'Orbitron'];
	const presetImages = ['masjid-bg.webp', 'masjid-1.webp', 'masjid-2.webp', 'masjid-3.webp'];

	let selectedTheme = $state('t1');
	let selectedAccent = $state('#f0cd86');
	let previewContainers = $state<(HTMLDivElement | null)[]>([]);

	$effect(() => {
		if (settings) {
			selectedTheme = settings.theme;
			selectedAccent = settings.accentColor;
		}
	});

	$effect(() => {
		// Scale each iframe to fill its container at a 1280px virtual viewport
		previewContainers.forEach(el => {
			if (!el) return;
			const iframe = el.querySelector('iframe') as HTMLIFrameElement | null;
			if (!iframe) return;
			const scale = el.offsetWidth / 1280;
			iframe.style.transform = `scale(${scale})`;
			iframe.style.transformOrigin = '0 0';
		});
	});
</script>

<div class="wrap">
	<header class="page-header">
		<div>
			<h1>Pengaturan Tema Display</h1>
			<p class="sub">Pilih layout dan personalisasi tampilan TV masjid. Perubahan langsung diterapkan ke semua display.</p>
		</div>
		<a class="btn ghost" href={`/display/${masjid.id}`} target="_blank">Preview Display</a>
	</header>

	<form method="POST" action="?/updateSettings" use:enhance>
		<div class="themes" id="themes">
			{#each themes as t, i}
				<label class="theme {selectedTheme === t.id ? 'selected' : ''}">
					<input type="radio" name="theme" value={t.id} bind:group={selectedTheme} style="display:none;" />
					<div class="check">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
					</div>
					<div class="preview" bind:this={previewContainers[i]}>
						<iframe
							class="live-preview"
							title={`Preview ${t.name}`}
							src={`/display/${masjid.id}?theme=${t.id}&preview=1`}
							loading="lazy"
							tabindex="-1"
							scrolling="no"
						></iframe>
						<div class="preview-block"></div>
					</div>
					<div class="meta">
						<h3>{t.name}</h3>
						<div class="desc">{t.desc}</div>
						<div class="tags">
							<span class="tag {t.tag1 === 'Rekomendasi' ? 'gold' : ''}">{t.tag1}</span>
							<span class="tag">{t.tag2}</span>
						</div>
					</div>
				</label>
			{/each}
		</div>

		<div class="settings-grid">
			<div class="card">
				<h2>Personalisasi Visual</h2>
				<div class="opt">
					<div>
						<div class="l">Warna Aksen</div>
						<div class="d">Warna highlight sholat aktif</div>
					</div>
					<div class="swatch-row">
						{#each accents as acc}
							<label class="sw {selectedAccent === acc.val ? 'sel' : ''}" style="background:{acc.bg}" title={acc.name}>
								<input type="radio" name="accentColor" value={acc.val} bind:group={selectedAccent} style="display:none;" />
							</label>
						{/each}
					</div>
				</div>
				<div class="opt">
					<div>
						<div class="l">Background Mode</div>
						<div class="d">Tampilan latar utama display</div>
					</div>
					<select class="input" name="bgMode" style="width: auto;">
						<option value="wallpaper" selected={settings.bgMode === 'wallpaper'}>Gambar Wallpaper</option>
						<option value="youtube" selected={settings.bgMode === 'youtube'}>Streaming YouTube</option>
					</select>
				</div>
				<div class="opt">
					<div>
						<div class="l">Foto Latar / Wallpaper</div>
						<div class="d">Pilih dari preset atau upload</div>
					</div>
					<select class="input" name="bgImage" style="width: auto;">
						<optgroup label="Preset">
							{#each presetImages as img}
								<option value={img} selected={settings.bgImage === img}>{img}</option>
							{/each}
						</optgroup>
						{#if wallpapers.length > 0}
							<optgroup label="Uploads">
								{#each wallpapers as wp}
									<option value={`/uploads/${masjid.id}/${wp.filename}`} selected={settings.bgImage === `/uploads/${masjid.id}/${wp.filename}`}>
										{wp.originalName}
									</option>
								{/each}
							</optgroup>
						{/if}
					</select>
				</div>
				<div class="opt">
					<div>
						<div class="l">YouTube URL</div>
						<div class="d">Link streaming jika mode YouTube</div>
					</div>
					<input type="text" class="input" name="youtubeUrl" value={settings.youtubeUrl || ''} placeholder="https://youtube.com/watch?v=..." style="width:200px" />
				</div>
				<div class="opt">
					<div>
						<div class="l">Font Jam Digital</div>
						<div class="d">Tampilan angka jam besar</div>
					</div>
					<select class="input" name="clockFont" style="width: auto;">
						{#each fonts as font}
							<option value={font} selected={settings.clockFont === font}>{font}</option>
						{/each}
					</select>
				</div>
				<div class="opt">
					<div>
						<div class="l">Kecepatan Running Text</div>
						<div class="d">Seberapa cepat teks pengumuman berjalan</div>
					</div>
					<select class="input" name="marqueeSpeed" style="width:auto">
						<option value="60" selected={settings.marqueeSpeed >= 50}>Sangat Lambat</option>
						<option value="40" selected={settings.marqueeSpeed >= 32 && settings.marqueeSpeed < 50}>Lambat</option>
						<option value="25" selected={settings.marqueeSpeed >= 18 && settings.marqueeSpeed < 32}>Sedang</option>
						<option value="15" selected={settings.marqueeSpeed >= 10 && settings.marqueeSpeed < 18}>Cepat</option>
						<option value="8"  selected={settings.marqueeSpeed < 10}>Sangat Cepat</option>
					</select>
				</div>
			</div>

			<div class="card">
				<h2>Mode &amp; Notifikasi</h2>
				<div class="opt">
					<div>
						<div class="l">Mode Adzan Otomatis</div>
						<div class="d">Layar penuh saat waktu adzan</div>
					</div>
					<label class="toggle-switch"><input type="checkbox" name="adzanAuto" checked={settings.adzanAuto === 1} /><span class="slot"></span></label>
				</div>
				<div class="opt">
					<div>
						<div class="l">Mode Iqamah</div>
						<div class="d">Countdown setelah adzan</div>
					</div>
					<label class="toggle-switch"><input type="checkbox" name="iqamahAuto" checked={settings.iqamahAuto === 1} /><span class="slot"></span></label>
				</div>
				<div class="opt">
					<div>
						<div class="l">Durasi Adzan (detik)</div>
						<div class="d">Lama overlay adzan tampil · 180 = 3 menit, 240 = 4 menit</div>
					</div>
					<input type="number" class="input" name="adzanDuration" value={settings.adzanDuration} min="30" max="3600" step="10" style="width:90px" />
				</div>
				<div class="opt">
					<div>
						<div class="l">Tampilkan Tanggal Hijriah</div>
						<div class="d">Kalender Hijriah di header</div>
					</div>
					<label class="toggle-switch"><input type="checkbox" name="showHijri" checked={settings.showHijri === 1} /><span class="slot"></span></label>
				</div>
				<div class="opt">
					<div>
						<div class="l">Tampilkan Logo Masjid</div>
						<div class="d">Logo di pojok kiri atas</div>
					</div>
					<label class="toggle-switch"><input type="checkbox" name="showLogo" checked={settings.showLogo === 1} /><span class="slot"></span></label>
				</div>
				<div class="opt">
					<div>
						<div class="l">Frame Emas (Ornamental)</div>
						<div class="d">Garis pinggir layar</div>
					</div>
					<label class="toggle-switch"><input type="checkbox" name="showFrame" checked={settings.showFrame === 1} /><span class="slot"></span></label>
				</div>
			</div>
		</div>

		{#if form?.error}
			<div class="error-msg">{form.error}</div>
		{/if}
		{#if form?.success}
			<div class="success-msg">Pengaturan berhasil disimpan.</div>
		{/if}

		<div class="actions">
			<button class="btn primary" type="submit">Simpan Pengaturan</button>
		</div>
	</form>

	<div class="gallery-section">
		<h2>Gallery Wallpaper Upload</h2>
		<p class="sub">Upload gambar kustom untuk dipakai sebagai latar belakang.</p>
		
		{#if form?.uploadError}
			<div class="error-msg">{form.uploadError}</div>
		{/if}
		{#if form?.uploadSuccess}
			<div class="success-msg">Wallpaper berhasil diupload.</div>
		{/if}
		{#if form?.deleteSuccess}
			<div class="success-msg">Wallpaper berhasil dihapus.</div>
		{/if}
		{#if form?.deleteError}
			<div class="error-msg">{form.deleteError}</div>
		{/if}

		<div class="upload-box">
			<form method="POST" action="?/uploadWallpaper" enctype="multipart/form-data" use:enhance>
				<input type="file" name="wallpaper" accept="image/*" required />
				<button type="submit" class="btn primary">Upload</button>
			</form>
		</div>

		<div class="wallpapers-grid">
			{#each wallpapers as wp}
				<div class="wp-card">
					<img src={`/uploads/${masjid.id}/${wp.filename}`} alt={wp.originalName} />
					<div class="wp-info">
						<div class="wp-name" title={wp.originalName}>{wp.originalName}</div>
						<form method="POST" action="?/deleteWallpaper" use:enhance>
							<input type="hidden" name="id" value={wp.id} />
							<button type="submit" class="btn-del">Hapus</button>
						</form>
					</div>
				</div>
			{/each}
			{#if wallpapers.length === 0}
				<div class="empty-wp">Belum ada wallpaper yang diupload.</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.wrap{ max-width:1280px; margin:0 auto; }
	.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
	h1{ font-size:32px; font-weight:800; letter-spacing:-.5px; margin: 0; }
	.sub{ color: #64748b; margin-top:4px; font-size:15px; }
	
	/* theme grid */
	.themes{
		display:grid;
		grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));
		gap:18px;
		margin-top:28px;
		margin-bottom: 36px;
	}
	.theme{
		background: #fff;
		border:1px solid #e2e8f0;
		border-radius:16px;
		overflow:hidden;
		cursor:pointer;
		transition:transform .2s, border-color .2s;
		position:relative;
	}
	.theme:hover{ transform:translateY(-2px); }
	.theme.selected{
		border:2px solid var(--gold-500);
		box-shadow:0 0 0 4px rgba(240,205,134,.18), 0 14px 36px rgba(0,0,0,.08);
	}
	.theme .check{
		position:absolute; top:12px; right:12px;
		width:30px; height:30px; border-radius:50%;
		background:var(--gold-500); color:#0a1f4d;
		display:none; place-items:center; font-weight:700;
		z-index:2;
	}
	.theme.selected .check{ display:grid; }
	.theme .check svg{ width:18px; height:18px;}

	.preview{
		aspect-ratio:16/9;
		background:#000;
		position:relative;
		overflow:hidden;
	}
	/* Live preview — iframe renders at 1280×720 then is CSS-scaled down to container */
	.live-preview{
		position:absolute; top:0; left:0;
		width:1280px; height:720px;
		border:0; display:block;
		pointer-events:none;
		background:#06122e;
		/* transform is set by $effect based on container width */
		transform-origin:0 0;
	}
	/* transparent layer so clicking the card selects the theme instead of the iframe */
	.preview-block{ position:absolute; inset:0; z-index:1; }
	.theme.selected .preview{ box-shadow: inset 0 0 0 3px var(--gold-500); }

	.theme .meta{ padding:14px 16px; color: #0f172a; }
	.theme .meta h3{ font-size:15px; font-weight:700; margin: 0; }
	.theme .meta .desc{ font-size:12px; color:#64748b; margin-top:3px;}
	.theme .tags{ display:flex; gap:5px; margin-top:8px;}
	.theme .tag{
		font-size:10px; padding:3px 8px; border-radius:6px;
		background:#f1f5f9; color:#475569;
		font-weight:600; letter-spacing:.3px;
	}
	.theme .tag.gold{ background:rgba(240,205,134,.2); color:#b45309;}

	/* settings */
	.settings-grid{
		display:grid; grid-template-columns:repeat(auto-fit, minmax(400px, 1fr));
		gap:18px;
	}
	.card h2{font-size:18px; font-weight:700; margin: 0 0 16px 0;}
	.opt{
		display:flex; align-items:center; justify-content:space-between;
		padding:14px 0; border-bottom:1px solid #e2e8f0;
	}
	.opt:last-child{border-bottom:none;}
	.opt .l{ font-size:14px; font-weight:600;}
	.opt .d{font-size:12px; color:#64748b; margin-top:2px;}
	
	.swatch-row{ display:flex; gap:8px;}
	.sw{ width:32px; height:32px; border-radius:8px; cursor:pointer; border:2px solid transparent;}
	.sw.sel{ border-color:#0f172a; box-shadow:0 0 0 2px rgba(240,205,134,.6);}
	
	.toggle-switch{ position:relative; display:inline-block; width:42px; height:24px;}
	.toggle-switch input{display:none;}
	.toggle-switch .slot{position:absolute; inset:0; background:#cbd5e1; border-radius:999px; cursor:pointer; transition:.2s;}
	.toggle-switch .slot::after{content:""; position:absolute; left:2px; top:2px; width:20px; height:20px; background:#fff; border-radius:50%; transition:.2s; box-shadow:0 1px 3px rgba(0,0,0,.1);}
	.toggle-switch input:checked + .slot{background:var(--gold-500);}
	.toggle-switch input:checked + .slot::after{left:20px;}
	
	.actions{ margin-top:28px; display:flex; gap:10px; justify-content:flex-end;}

	.gallery-section {
		margin-top: 48px;
		padding-top: 24px;
		border-top: 1px solid #e2e8f0;
	}
	.upload-box {
		margin-top: 16px;
		padding: 16px;
		background: #fff;
		border-radius: 12px;
		border: 1px dashed #cbd5e1;
	}
	.wallpapers-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 16px;
		margin-top: 16px;
	}
	.wp-card {
		background: #fff;
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid #e2e8f0;
	}
	.wp-card img {
		width: 100%;
		height: 120px;
		object-fit: cover;
	}
	.wp-info {
		padding: 12px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.wp-name {
		font-size: 13px;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 120px;
	}
	.btn-del {
		background: #fee2e2;
		color: #ef4444;
		border: none;
		padding: 4px 8px;
		border-radius: 6px;
		font-size: 12px;
		cursor: pointer;
		font-weight: 600;
	}
	.empty-wp {
		grid-column: 1 / -1;
		padding: 24px;
		text-align: center;
		color: #64748b;
		background: #f8fafc;
		border-radius: 12px;
	}
	.error-msg {
		color: #ef4444;
		background: #fee2e2;
		padding: 12px;
		border-radius: 8px;
		margin-top: 16px;
	}
	.success-msg {
		color: #16a34a;
		background: #dcfce7;
		padding: 12px;
		border-radius: 8px;
		margin-top: 16px;
	}
</style>
