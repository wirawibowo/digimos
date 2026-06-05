<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';

	const masjid = $derived(page.data.masjid);
	const iqamah = $derived(page.data.iqamah);
	const form = $derived(page.form);

	let adzanDuration = $state(page.data.adzanDuration ?? 180);
	let adzanAuto = $state(page.data.adzanAuto === 1);
	let iqamahAuto = $state(page.data.iqamahAuto === 1);

	$effect(() => {
		adzanDuration = page.data.adzanDuration ?? 180;
		adzanAuto = page.data.adzanAuto === 1;
		iqamahAuto = page.data.iqamahAuto === 1;
	});

	const durationMinutes = $derived(Math.round(adzanDuration / 60 * 10) / 10);
</script>

<div class="wrap">
	<header class="page-header">
		<div>
			<h1>Pengaturan Adzan & Iqamah</h1>
			<p class="sub">Atur durasi adzan otomatis dan offset iqamah per waktu sholat untuk <b>{masjid.name}</b>.</p>
		</div>
		<a class="btn ghost" href={`/display/${masjid.id}`} target="_blank">Preview Display</a>
	</header>


	<!-- ADZAN AUTO SETTINGS -->
	<div class="card">
		<h2>Mode Adzan Otomatis</h2>
		<p class="card-desc">Ketika waktu sholat masuk, overlay adzan akan muncul otomatis di display. Setelah durasi selesai, countdown iqamah akan muncul (jika diaktifkan).</p>

		<form method="POST" action="?/saveAdzan" use:enhance>
			<div class="flow-diagram">
				<div class="flow-step" class:active={adzanAuto}>
					<div class="step-icon">🕌</div>
					<div class="step-label">Waktu Sholat Masuk</div>
				</div>
				<div class="flow-arrow">→</div>
				<div class="flow-step" class:active={adzanAuto}>
					<div class="step-icon">🎙️</div>
					<div class="step-label">Overlay Adzan</div>
					<div class="step-sub">{adzanDuration}s ({durationMinutes} menit)</div>
				</div>
				<div class="flow-arrow">→</div>
				<div class="flow-step" class:active={iqamahAuto}>
					<div class="step-icon">⏱️</div>
					<div class="step-label">Countdown Iqamah</div>
					<div class="step-sub">per setting di bawah</div>
				</div>
				<div class="flow-arrow">→</div>
				<div class="flow-step active">
					<div class="step-icon">🕋</div>
					<div class="step-label">Tampilan Normal</div>
				</div>
			</div>

			<div class="opts">
				<div class="opt">
					<div>
						<div class="l">Adzan Otomatis</div>
						<div class="d">Overlay adzan muncul saat waktu sholat masuk</div>
					</div>
					<label class="toggle-switch">
						<input type="checkbox" name="adzanAuto" bind:checked={adzanAuto} />
						<span class="slot"></span>
					</label>
				</div>
				<div class="opt">
					<div>
						<div class="l">Iqamah Otomatis</div>
						<div class="d">Countdown iqamah muncul setelah overlay adzan selesai</div>
					</div>
					<label class="toggle-switch">
						<input type="checkbox" name="iqamahAuto" bind:checked={iqamahAuto} />
						<span class="slot"></span>
					</label>
				</div>
				<div class="opt">
					<div>
						<div class="l">Durasi Adzan</div>
						<div class="d">Berapa lama overlay adzan ditampilkan (dalam detik)</div>
					</div>
					<div class="dur-input">
						<input type="number" class="input" name="adzanDuration"
							bind:value={adzanDuration} min="30" max="3600" step="10" />
						<span class="dur-hint">= {durationMinutes} menit</span>
					</div>
				</div>
			</div>

			{#if form?.error}<div class="error-msg">{form.error}</div>{/if}
			{#if form?.success}<div class="success-msg">Pengaturan berhasil disimpan.</div>{/if}

			<div class="actions">
				<button class="btn primary" type="submit">Simpan Pengaturan Adzan</button>
			</div>
		</form>
	</div>

	<!-- IQAMAH OFFSET SETTINGS -->
	<div class="card">
		<h2>Offset Waktu Iqamah</h2>
		<p class="card-desc">Berapa menit setelah adzan berkumandang, iqamah dikumandangkan untuk setiap waktu sholat.</p>

		<form method="POST" action="?/saveIqamah" use:enhance>
			<div class="iqamah-grid">
				{#each [
					{ key: 'shubuh',  label: '🌅 Shubuh',  name: 'shubuh',  val: iqamah.shubuh },
					{ key: 'dzuhur',  label: '☀ Dzuhur / Jumu\'ah', name: 'dzuhur', val: iqamah.dzuhur },
					{ key: 'ashar',   label: '🌤 Ashar',   name: 'ashar',   val: iqamah.ashar },
					{ key: 'maghrib', label: '🌇 Maghrib', name: 'maghrib', val: iqamah.maghrib },
					{ key: 'isya',    label: '🌙 Isya',    name: 'isya',    val: iqamah.isya }
				] as p}
					<div class="iq-row">
						<span class="iq-label">{p.label}</span>
						<div class="iq-input-wrap">
							<input type="number" class="input iq-input" name={p.name}
								value={p.val} min="1" max="60" />
							<span class="iq-unit">menit setelah adzan</span>
						</div>
					</div>
				{/each}

				<div class="iq-row">
					<span class="iq-label">☀ Rentang Syuruq</span>
					<div class="iq-input-wrap">
						<input type="text" class="input" name="syuruqRange"
							value={iqamah.syuruqRange} placeholder="06:10 - 06:30" style="width:140px" />
						<span class="iq-unit">format HH:MM - HH:MM</span>
					</div>
				</div>
			</div>

			{#if form?.success}<div class="success-msg">Offset iqamah berhasil disimpan.</div>{/if}

			<div class="actions">
				<button class="btn primary" type="submit">Simpan Offset Iqamah</button>
			</div>
		</form>
	</div>
</div>

<style>
	.wrap{ max-width:860px; margin:0 auto; }
	.page-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
	h1{ font-size:28px; font-weight:800; letter-spacing:-.5px; margin:0; color:#fff; }
	.sub{ color:rgba(255,255,255,.65); margin-top:4px; font-size:15px; }
	.card{ background:#fff; border-radius:16px; border:1px solid #e2e8f0; padding:28px; margin-bottom:24px; color:#0f172a; }
	.card h2{ font-size:18px; font-weight:700; margin:0 0 6px; color:#0f172a; }
	.card-desc{ font-size:14px; color:#64748b; margin:0 0 24px; }

	/* Flow diagram */
	.flow-diagram{ display:flex; align-items:center; gap:8px; margin-bottom:28px; padding:20px; background:#f8fafc; border-radius:12px; flex-wrap:wrap; }
	.flow-step{ display:flex; flex-direction:column; align-items:center; gap:4px; padding:12px 16px; border-radius:10px; background:#e2e8f0; opacity:.4; transition:.2s; min-width:100px; text-align:center; }
	.flow-step.active{ background:linear-gradient(135deg,#0a1f4d,#1545a8); color:#fff; opacity:1; }
	.step-icon{ font-size:28px; }
	.step-label{ font-size:12px; font-weight:700; }
	.step-sub{ font-size:11px; opacity:.8; }
	.flow-arrow{ font-size:20px; color:#94a3b8; flex-shrink:0; }

	/* Options */
	.opts{ display:flex; flex-direction:column; }
	.opt{ display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-bottom:1px solid #e2e8f0; }
	.opt:last-child{ border-bottom:none; }
	.l{ font-size:14px; font-weight:600; color:#0f172a; }
	.d{ font-size:12px; color:#64748b; margin-top:2px; }
	.dur-input{ display:flex; align-items:center; gap:8px; }
	.dur-hint{ font-size:13px; color:#64748b; white-space:nowrap; }
	.input{ border:1px solid #cbd5e1; border-radius:8px; padding:8px 12px; font-size:14px; font-family:inherit; outline:none; color:#0f172a; background:#fff; }
	.input:focus{ border-color:#1545a8; box-shadow:0 0 0 3px rgba(21,69,168,.1); }

	/* Iqamah grid */
	.iqamah-grid{ display:flex; flex-direction:column; gap:12px; margin-bottom:20px; }
	.iq-row{ display:flex; align-items:center; gap:16px; padding:10px 0; border-bottom:1px solid #f1f5f9; }
	.iq-row:last-child{ border-bottom:none; }
	.iq-label{ font-size:15px; font-weight:600; width:200px; flex-shrink:0; color:#0f172a; }
	.iq-input-wrap{ display:flex; align-items:center; gap:10px; }
	.iq-input{ width:80px; text-align:center; font-variant-numeric:tabular-nums; color:#0f172a; background:#fff; }
	.iq-unit{ font-size:13px; color:#64748b; }

	/* Toggle */
	.toggle-switch{ position:relative; display:inline-block; width:42px; height:24px; }
	.toggle-switch input{ display:none; }
	.slot{ position:absolute; inset:0; background:#cbd5e1; border-radius:999px; cursor:pointer; transition:.2s; }
	.slot::after{ content:""; position:absolute; left:2px; top:2px; width:20px; height:20px; background:#fff; border-radius:50%; transition:.2s; box-shadow:0 1px 3px rgba(0,0,0,.1); }
	input:checked + .slot{ background:#1545a8; }
	input:checked + .slot::after{ left:20px; }

	.actions{ margin-top:20px; display:flex; justify-content:flex-end; }
	.error-msg{ background:#fef2f2; border:1px solid #fecaca; color:#dc2626; padding:10px 14px; border-radius:8px; font-size:14px; margin-top:12px; }
	.success-msg{ background:#f0fdf4; border:1px solid #bbf7d0; color:#16a34a; padding:10px 14px; border-radius:8px; font-size:14px; margin-top:12px; }
	.btn{ display:inline-flex; align-items:center; gap:8px; padding:10px 20px; border-radius:10px; font-size:14px; font-weight:600; border:none; cursor:pointer; text-decoration:none; font-family:inherit; }
	.btn.primary{ background:linear-gradient(180deg,#1545a8,#0a3d8f); color:#fff; }
	.btn.ghost{ background:#f1f5f9; color:#0f172a; border:1px solid #e2e8f0; }
</style>
