<script lang="ts">
	import { page } from '$app/state';

	const masjid = $derived(page.data.masjid);
	let schedules = $state(page.data.schedules);
	const currentYear = $derived(page.data.year);
	const currentMonth = $derived(page.data.month);

	$effect(() => {
		schedules = page.data.schedules;
	});

	const monthNames = [
		'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
		'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
	];
	const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

	let syncStatus = $state('');
	let syncingYear = $state(false);
	let syncYearProgress = $state(0); // 0-12

	async function syncApi() {
		syncStatus = 'Menyinkronkan...';
		try {
			const res = await fetch('/api/jadwal/sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					masjid_id: masjid.id,
					month: currentMonth,
					year: currentYear
				})
			});
			const result = await res.json();
			if (result.success) {
				schedules = result.data;
				syncStatus = `✓ ${result.data.length} hari tersimpan`;
			} else {
				syncStatus = 'Gagal: ' + (result.error || 'Unknown error');
			}
		} catch (err: any) {
			syncStatus = 'Error: ' + err.message;
		}
		setTimeout(() => syncStatus = '', 4000);
	}

	async function syncYear() {
		if (!confirm(`Sinkronkan jadwal sholat seluruh tahun ${currentYear} dari API ${masjid.apiProvider}?\nProses ini memerlukan koneksi internet dan mungkin memakan waktu ~30 detik.`)) return;

		syncingYear = true;
		syncYearProgress = 0;
		let successCount = 0;
		let failCount = 0;

		for (let m = 1; m <= 12; m++) {
			syncYearProgress = m;
			try {
				const res = await fetch('/api/jadwal/sync', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ masjid_id: masjid.id, month: m, year: currentYear })
				});
				const result = await res.json();
				if (result.success) {
					successCount++;
					// Reload current month if it matches
					if (m === currentMonth) schedules = result.data;
				} else {
					failCount++;
				}
			} catch {
				failCount++;
			}
		}

		syncingYear = false;
		syncYearProgress = 0;
		if (failCount === 0) {
			syncStatus = `✓ Setahun berhasil! ${successCount} bulan (${successCount * 30} hari) tersimpan.`;
		} else {
			syncStatus = `Selesai: ${successCount} bulan berhasil, ${failCount} gagal.`;
		}
		setTimeout(() => syncStatus = '', 6000);
	}

	function changeMonth(delta: number) {
		let m = currentMonth + delta;
		let y = currentYear;
		if (m > 12) { m = 1; y++; }
		if (m < 1) { m = 12; y--; }
		window.location.href = `/jadwal/${masjid.id}?month=${m}&year=${y}`;
	}

	function timeToMinutes(timeStr: string) {
		if (!timeStr) return 0;
		const [h, m] = timeStr.split(':').map(Number);
		return h * 60 + m;
	}

	function minutesToTime(mins: number) {
		const h = Math.floor(mins / 60);
		const m = Math.floor(mins % 60);
		return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
	}

	let avgShubuh = $derived(() => {
		if (!schedules.length) return '-';
		const sum = schedules.reduce((acc: number, s: any) => acc + timeToMinutes(s.shubuh), 0);
		return minutesToTime(sum / schedules.length);
	});
	let avgSyuruq = $derived(() => {
		if (!schedules.length) return '-';
		const sum = schedules.reduce((acc: number, s: any) => acc + timeToMinutes(s.syuruq), 0);
		return minutesToTime(sum / schedules.length);
	});
	let avgDzuhur = $derived(() => {
		if (!schedules.length) return '-';
		const sum = schedules.reduce((acc: number, s: any) => acc + timeToMinutes(s.dzuhur), 0);
		return minutesToTime(sum / schedules.length);
	});

	let numJumat = $derived(() => {
		return schedules.filter((s: any) => {
			const d = new Date(s.date);
			return d.getDay() === 5;
		}).length;
	});

	function isToday(dateStr: string) {
		const today = new Date();
		const d = new Date(dateStr);
		return d.getDate() === today.getDate() && 
			   d.getMonth() === today.getMonth() && 
			   d.getFullYear() === today.getFullYear();
	}
	
	function getDayName(dateStr: string) {
		const wd = new Date(dateStr).getDay();
		return daysName[wd];
	}
	
	function isFriday(dateStr: string) {
		return new Date(dateStr).getDay() === 5;
	}
</script>

<div class="wrap">
	<header class="page-header">
		<div>
			<h1>Jadwal Sholat Bulanan</h1>
			<p class="sub">Data dari <strong>{masjid.apiProvider}</strong> untuk kota <strong>{masjid.cityName}</strong>.</p>
		</div>

		<div class="header-actions">
			<button class="btn gold" onclick={syncYear} disabled={syncingYear}>
				{#if syncingYear}
					<span class="spin">⟳</span> Bulan {syncYearProgress}/12...
				{:else}
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><polyline points="21 3 21 8 16 8"/></svg>
					Sinkron Setahun {currentYear}
				{/if}
			</button>
		</div>
	</header>


	{#if syncingYear}
		<div class="year-progress-bar">
			<div class="bar-track">
				<div class="bar-fill" style="width: {(syncYearProgress / 12) * 100}%"></div>
			</div>
			<div class="bar-labels">
				{#each Array.from({length: 12}, (_, i) => i + 1) as m}
					<span class="bar-month" class:done={m < syncYearProgress} class:active={m === syncYearProgress}>
						{monthNames[m-1].slice(0,3)}
					</span>
				{/each}
			</div>
		</div>
	{/if}

	<div class="summary">
		<div class="sum"><div class="l">SHUBUH RATA²</div><div class="v">{avgShubuh()}</div></div>
		<div class="sum"><div class="l">SYURUQ RATA²</div><div class="v">{avgSyuruq()}</div></div>
		<div class="sum"><div class="l">DZUHUR RATA²</div><div class="v">{avgDzuhur()}</div></div>
		<div class="sum gold"><div class="l">JUMAT</div><div class="v">{numJumat()} hari</div></div>
		<div class="sum"><div class="l">TOTAL HARI</div><div class="v">{schedules.length}</div></div>
	</div>

	<div class="controls">
		<div class="month-nav">
			<button class="navbtn" onclick={() => changeMonth(-1)} title="Prev">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
			</button>
			<div class="label">
				{monthNames[currentMonth - 1]} {currentYear}
			</div>
			<button class="navbtn" onclick={() => changeMonth(1)} title="Next">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
			</button>
		</div>
		<div class="right">
			{#if syncStatus}
				<span class="status-msg">{syncStatus}</span>
			{/if}
			<button class="btn ghost" onclick={syncApi} disabled={syncingYear}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><polyline points="21 3 21 8 16 8"/></svg>
				Bulan Ini
			</button>
		</div>
	</div>

	<div class="tablewrap">
		<table class="sched">
			<thead>
				<tr>
					<th class="day">HARI</th>
					<th>SHUBUH</th>
					<th>SYURUQ</th>
					<th class="gold">DZUHUR</th>
					<th>ASHAR</th>
					<th>MAGHRIB</th>
					<th>ISYA</th>
				</tr>
			</thead>
			<tbody>
				{#each schedules as s}
					{@const today = isToday(s.date)}
					{@const jumat = isFriday(s.date)}
					{@const dayNum = s.date.split('-')[2]}
					<tr class="{today ? 'today' : ''} {jumat ? 'friday' : ''}">
						<td class="day">
							<span class="num">{dayNum}</span>
							<span class="name">{getDayName(s.date)}{jumat ? ' (Jumat)' : ''}</span>
						</td>
						<td>{s.shubuh}</td>
						<td>{s.syuruq}</td>
						<td style="color:var(--gold-500);">{s.dzuhur}</td>
						<td>{s.ashar}</td>
						<td>{s.maghrib}</td>
						<td>{s.isya}</td>
					</tr>
				{/each}
				{#if schedules.length === 0}
					<tr>
						<td colspan="7" class="empty-state">Data jadwal kosong. Silakan klik Sinkron API.</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>

	<div class="legend">
		<span><span class="dot today"></span>Hari ini</span>
		<span><span class="dot friday"></span>Jumat (Sholat Jumat)</span>
		<span><span class="dot normal"></span>Hari biasa</span>
		<span style="margin-left:auto;">Sumber: {masjid.apiProvider}</span>
	</div>
</div>

<style>
	.wrap { max-width: 1200px; margin: 0 auto; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
	.header-actions { flex-shrink: 0; }
	h1 { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }

	/* Year progress bar */
	.year-progress-bar {
		background: linear-gradient(180deg, var(--panel), var(--panel-2));
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 16px 20px;
		margin-bottom: 20px;
	}
	.bar-track {
		height: 8px;
		background: rgba(255,255,255,.08);
		border-radius: 999px;
		overflow: hidden;
		margin-bottom: 12px;
	}
	.bar-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--gold-300), var(--gold-400));
		border-radius: 999px;
		transition: width .4s ease;
	}
	.bar-labels {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 4px;
		text-align: center;
	}
	.bar-month {
		font-size: 11px;
		font-weight: 600;
		color: var(--muted);
		padding: 4px 2px;
		border-radius: 6px;
		transition: all .2s;
	}
	.bar-month.done {
		color: #4ade80;
		background: rgba(74, 222, 128, 0.1);
	}
	.bar-month.active {
		color: var(--gold-300);
		background: rgba(240, 205, 134, 0.15);
		font-weight: 800;
	}

	@keyframes spin { to { transform: rotate(360deg); } }
	.spin { display: inline-block; animation: spin 1s linear infinite; }
	.sub { color: var(--muted); margin-top: 4px; font-size: 15px; }

	.summary {
		display: grid; 
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
		gap: 12px;
		margin-top: 16px;
	}
	.sum {
		background: linear-gradient(180deg, var(--panel), var(--panel-2));
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 14px;
		text-align: center;
	}
	.sum .l { font-size: 11px; letter-spacing: 1.5px; color: var(--muted); font-weight: 600; }
	.sum .v { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 24px; margin-top: 6px; font-variant-numeric: tabular-nums; color: #fff; }
	.sum.gold .v { color: var(--gold-300); }

	.controls {
		display: flex; align-items: center; justify-content: space-between;
		margin-top: 24px; flex-wrap: wrap; gap: 14px;
	}
	.month-nav {
		display: flex; align-items: center; gap: 14px;
		background: linear-gradient(180deg, var(--panel), var(--panel-2));
		border: 1px solid var(--border);
		padding: 8px 12px;
		border-radius: 12px;
	}
	.month-nav .navbtn {
		width: 36px; height: 36px; border-radius: 8px;
		background: rgba(255,255,255,.06);
		border: 1px solid rgba(255,255,255,.1);
		color: #fff;
		display: grid; place-items: center;
		cursor: pointer;
	}
	.month-nav .navbtn:hover { background: rgba(255,255,255,.12); }
	.month-nav .navbtn svg { width: 18px; height: 18px; }
	.month-nav .label {
		min-width: 180px; text-align: center;
		font-weight: 700; font-size: 18px; color: #fff;
	}
	.controls .right { display: flex; gap: 10px; align-items: center; }
	
	.btn { display: inline-flex; align-items: center; gap: 6px; }
	.btn svg { width: 15px; height: 15px; }

	.tablewrap {
		margin-top: 20px;
		background: linear-gradient(180deg, var(--panel), var(--panel-2));
		border: 1px solid var(--border);
		border-radius: 16px;
		overflow: hidden;
	}
	table.sched { width: 100%; border-collapse: collapse; }
	table.sched th {
		background: rgba(255,255,255,.03);
		text-align: center;
		font-size: 11px; font-weight: 700; letter-spacing: 1.2px;
		color: var(--muted);
		padding: 14px 8px;
		border-bottom: 1px solid var(--border);
	}
	table.sched th.day { text-align: left; padding-left: 20px; }
	table.sched th.gold { color: var(--gold-300); }
	table.sched td {
		padding: 10px 8px;
		text-align: center;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 15px;
		font-variant-numeric: tabular-nums;
		border-bottom: 1px solid rgba(255,255,255,.04);
		color: #fff;
	}
	table.sched td.day { text-align: left; padding-left: 20px; font-weight: 600; }
	table.sched td.day .num {
		display: inline-block;
		width: 30px; height: 30px; line-height: 30px;
		text-align: center;
		font-family: 'Plus Jakarta Sans', sans-serif;
		font-weight: 700; font-size: 14px;
		border-radius: 8px;
		background: rgba(255,255,255,.07);
		margin-right: 10px;
	}
	table.sched td.day .name { font-size: 14px; }
	
	table.sched tr.today td { background: rgba(240,205,134,.07); }
	table.sched tr.today td.day .num {
		background: linear-gradient(135deg, var(--gold-300), var(--gold-400));
		color: #0a1f4d;
	}
	table.sched tr.today td.day .name { color: var(--gold-300); }
	table.sched tr.friday td.day .name { color: #4ade80; }
	table.sched tr:hover td { background: rgba(255,255,255,.03); }

	.empty-state {
		padding: 40px !important;
		color: #64748b;
		font-weight: 400 !important;
	}

	.legend {
		margin-top: 16px; display: flex; gap: 18px; flex-wrap: wrap;
		font-size: 13px; color: var(--muted);
	}
	.legend .dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; vertical-align: middle; margin-right: 6px; }
	.legend .dot.today { background: var(--gold-300); }
	.legend .dot.friday { background: #4ade80; }
	.legend .dot.normal { background: rgba(255,255,255,.2); }
	.status-msg { font-size: 13px; color: #4ade80; font-weight: 500; }
</style>
