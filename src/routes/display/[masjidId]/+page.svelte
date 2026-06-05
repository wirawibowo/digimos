<script lang="ts">
	import { page } from '$app/state';
	import { onMount, onDestroy } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	
	import Theme1 from '$lib/components/themes/Theme1.svelte';
	import Theme2 from '$lib/components/themes/Theme2.svelte';
	import Theme3 from '$lib/components/themes/Theme3.svelte';
	import Theme4 from '$lib/components/themes/Theme4.svelte';
	import Theme5 from '$lib/components/themes/Theme5.svelte';
	import Theme6 from '$lib/components/themes/Theme6.svelte';

	const masjid = $derived(page.data.masjid);
	const settings = $derived(page.data.settings);
	const announcements = $derived(page.data.announcements);
	const iqamahOffsets = $derived(page.data.iqamah || {
		shubuh: 10, dzuhur: 10, ashar: 10, maghrib: 10, isya: 10, syuruqRange: '06:10'
	});
	const activeWallpaper = $derived(page.data.activeWallpaper);

	let timeStr = $state({ h: '12', m: '00', s: '00' });
	let dateStrMasehi = $state('');
	let dateStrHijri = $state('');
	let dayName = $state('');
	let timeNow = $state(new Date());

	let schedules = $state<any[]>([]);
	let nextPrayer = $state<any>(null);
	let nextSecs = $state(0);

	let currentMode = $state('normal');
	let adzanTarget = $state<any>(null);
	let iqamahCountdown = $state(0);

	// Anti-retrigger: track which prayers already triggered today
	let triggeredToday = new Set<string>();
	let lastTriggeredDate = '';

	let timer: any;
	let fetchInterval: any;
	let settingsInterval: any;

	const DAY_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	const DAY_ID = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
	const MON_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	const MON_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

	function pad(n: number) { return String(n).padStart(2, '0'); }

	async function fetchJadwal() {
		try {
			const d = new Date();
			const dateParam = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
			const res = await fetch(`/api/jadwal?masjid_id=${masjid.id}&date=${dateParam}`);
			const result = await res.json();
			if (result.data) {
				const s = result.data;
				const isFri = d.getDay() === 5;
				schedules = [
					{ key: 'shubuh',  name: 'Shubuh',                     time: s.shubuh,  short: 'SHUBUH'  },
					{ key: 'syuruq',  name: 'Syuruq',                     time: s.syuruq,  short: 'SYURUQ'  },
					{ key: 'dzuhur',  name: isFri ? "Jumu'ah" : 'Dzuhur',   time: s.dzuhur,  short: isFri ? "JUMU'AH" : 'DZUHUR' },
					{ key: 'ashar',   name: 'Ashar',                      time: s.ashar,   short: 'ASHAR'     },
					{ key: 'maghrib', name: 'Maghrib',                    time: s.maghrib, short: 'MAGHRIB' },
					{ key: 'isya',    name: 'Isya',                       time: s.isya,    short: 'ISYA'    }
				];
			}
		} catch (e) {
			console.error('Failed to fetch jadwal:', e);
		}
	}

	function addMinutes(hhmm: string, mins: number): string {
		if (!hhmm) return '--:--';
		const [h, m] = hhmm.split(':').map(Number);
		const total = h * 60 + m + Number(mins || 0);
		const nh = ((total / 60) | 0) % 24;
		const nm = total % 60;
		return `${pad(nh)}:${pad(nm)}`;
	}

	function tick() {
		const d = new Date();
		timeNow = d;
		timeStr = { h: pad(d.getHours()), m: pad(d.getMinutes()), s: pad(d.getSeconds()) };
		
		dayName = DAY_ID[d.getDay()];
		dateStrMasehi = `${d.getDate()} ${MON_ID[d.getMonth()]} ${d.getFullYear()}`;
		dateStrHijri = new Intl.DateTimeFormat('id-TN-u-ca-islamic', {
			day: 'numeric', month: 'long', year: 'numeric'
		}).format(d).replace(' AH', ' H').replace(' H', ' H');

		updateNext(d);

		if (currentMode === 'iqamah' && iqamahCountdown > 0) {
			iqamahCountdown--;
			if (iqamahCountdown <= 0) currentMode = 'normal';
		}
	}

	function updateNext(d: Date) {
		if (schedules.length === 0) return;
		const ns = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
		let next = null;
		let minDiff = Infinity;

		for (const p of schedules) {
			if (p.key === 'syuruq') continue;
			const [h, m] = p.time.split(':').map(Number);
			let s = h * 3600 + m * 60;
			if (s <= ns) s += 24 * 3600;
			const diff = s - ns;
			if (diff < minDiff) { minDiff = diff; next = p; }
		}
		nextPrayer = next;
		nextSecs = minDiff;

		// Reset tracker tiap hari baru
		const today = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
		if (today !== lastTriggeredDate) {
			triggeredToday = new Set<string>();
			lastTriggeredDate = today;
		}

		if (!isPreview && settings.adzanAuto && currentMode === 'normal'
			&& nextSecs === 0 && nextPrayer
			&& !triggeredToday.has(nextPrayer.key)) {
			triggeredToday.add(nextPrayer.key);
			startAdzan(nextPrayer);
		}
	}

	function startAdzan(prayer: any) {
		adzanTarget = prayer;
		currentMode = 'adzan';
		// adzanDuration tersimpan dalam DETIK (default 180 = 3 menit)
		const durSecs = settings.adzanDuration || 180;
		setTimeout(() => {
			if (settings.iqamahAuto && currentMode === 'adzan') startIqamah(prayer);
			else if (currentMode === 'adzan') currentMode = 'normal';
		}, durSecs * 1000);
	}

	function startIqamah(prayer: any) {
		adzanTarget = prayer;
		currentMode = 'iqamah';
		const offsetMins = (iqamahOffsets as any)[prayer.key] || 10;
		iqamahCountdown = Number(offsetMins) * 60;
	}

	onMount(() => {
		fetchJadwal();
		fetchInterval = setInterval(fetchJadwal, 60 * 60 * 1000);
		timer = setInterval(tick, 1000);
		settingsInterval = setInterval(() => invalidateAll(), 30 * 1000);
		tick();
	});

	onDestroy(() => {
		clearInterval(timer);
		clearInterval(fetchInterval);
		clearInterval(settingsInterval);
	});

	function formatSecs(secs: number) {
		const hh = Math.floor(secs / 3600);
		const mm = Math.floor((secs % 3600) / 60);
		const ss = secs % 60;
		return `-${pad(hh)}:${pad(mm)}:${pad(ss)}`;
	}

	function formatIq(secs: number) {
		const mm = Math.floor(secs / 60);
		const ss = secs % 60;
		return { m: pad(mm), s: pad(ss) };
	}

	const urlTheme = $derived(page.url.searchParams.get('theme'));
	const isPreview = $derived(page.url.searchParams.get('preview') === '1');
	const theme = $derived(urlTheme || settings.theme || 't1');
	const showFrame = $derived(!isPreview && settings.showFrame === 1);
	
	function iqamahFor(key: string, time: string): string {
		if (key === 'syuruq') {
			const range = (iqamahOffsets as any).syuruqRange || '';
			return range ? `${time} - ${range}` : '—';
		}
		const off = (iqamahOffsets as any)[key] ?? 10;
		return addMinutes(time, off);
	}

	let commonProps = $derived({
		masjid, settings, schedules, nextPrayer, nextSecs, timeStr, dateStrMasehi, dateStrHijri,
		dayName, announcements, activeWallpaper, formatSecs, timeNow, iqamahOffsets, iqamahFor
	});
</script>

<svelte:head>
	<title>Digimos — Display {masjid.name}</title>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="stage" style="--accent: {settings.accentColor || '#c89a45'}; --marquee-speed: {settings.marqueeSpeed || 60}s;">
	<div class="canvas" style={showFrame ? 'padding: 18px;' : 'padding: 1vmin;'}>
		{#if showFrame}
			<div class="gold-frame"></div>
		{/if}

		{#if theme === 't1'}
		    <Theme1 {...commonProps} />
		{:else if theme === 't2'}
		    <Theme2 {...commonProps} />
		{:else if theme === 't3'}
		    <Theme3 {...commonProps} />
		{:else if theme === 't4'}
		    <Theme4 {...commonProps} />
		{:else if theme === 't5'}
		    <Theme5 {...commonProps} />
		{:else if theme === 't6'}
		    <Theme6 {...commonProps} />
		{/if}

		<!-- ADZAN OVERLAY -->
		<div class="overlay" class:show={currentMode === 'adzan'}>
			<div class="overlay-inner">
				<div class="label">WAKTU SHOLAT TELAH MASUK</div>
				<div class="arabic">حَيَّ عَلَى الصَّلَاة</div>
				<div class="prayer-name">{adzanTarget?.name?.toUpperCase() || ''}</div>
				<div class="place">{masjid.name}</div>
				<div class="clock-big">{timeStr.h}:{timeStr.m}:{timeStr.s}</div>
				<div class="pulse"><span class="pulse-dot"></span><span>Hentikan aktivitas dan segera tunaikan sholat</span></div>
			</div>
		</div>

		<!-- IQAMAH OVERLAY -->
		{#if currentMode === 'iqamah'}
		{@const iq = formatIq(iqamahCountdown)}
		<div class="overlay iqamah show">
			<div class="overlay-inner">
				<div class="label">IQAMAH DALAM</div>
				<div class="countdown-huge"><span>{iq.m}</span><span class="sep">:</span><span>{iq.s}</span></div>
				<div class="sub">Persiapkan diri untuk sholat <b>{adzanTarget?.name || ''}</b> berjamaah</div>
			</div>
		</div>
		{/if}
		
		<!-- MARQUEE (Global) -->
		<div class="marquee" class:light-marquee={['t2','t3','t4','t5'].includes(theme)}>
			<div class="track">
				{#each [...announcements, ...announcements] as item}
					<div class="item">{item.text}</div>
				{/each}
				{#if announcements.length === 0}
					<div class="item">Selamat datang di {masjid.name}</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	:global(:root) {
		--navy-900:#06122e; --navy-800:#0a1f4d; --navy-700:#0e2d72;
		--navy-600:#1545a8; --navy-500:#2563d4;
		--gold-600:#a37a2a; --gold-500:#c89a45; --gold-400:#e3b864;
		--gold-300:#f0cd86; --gold-200:#f7e1a8;
		--cream:#fff6df; --yellow:#ffd93d;
	}
	:global(body) { margin: 0; padding: 0; overflow: hidden; background: #000; font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }
	.stage { position: fixed; inset: 0; background: #000; overflow: hidden; }
	.canvas { position: absolute; inset: 0; width: 100vw; height: 100vh; overflow: hidden; }
	
	.gold-frame { position: absolute; inset: 0; pointer-events: none; z-index: 900; border: 18px solid transparent; border-image: linear-gradient(135deg, #3a2810, #c89a45, #f7e1a8, #c89a45) 1; }
	.gold-frame::before { content:""; position:absolute; inset:0; border:2px solid rgba(0,0,0,.5); }
	.gold-frame::after { content:""; position:absolute; inset:-12px; border:1px solid rgba(255,235,180,.4); }
	
	/* MARQUEE */
	.marquee{
		position:absolute; left:0; right:0; bottom:0; height:6vh;
		background:linear-gradient(180deg,#0a1f4d, #06122e);
		border-top:2px solid rgba(243,205,134,.55);
		display:flex; align-items:center; overflow:hidden; z-index:800;
	}
	.marquee::before, .marquee::after{ content:""; position:absolute; top:0; bottom:0; width:60px; z-index:2; pointer-events:none; }
	.marquee::before{ left:0; background:linear-gradient(90deg,#06122e, transparent); }
	.marquee::after{ right:0; background:linear-gradient(270deg,#06122e, transparent); }
	.track{ display:flex; white-space:nowrap; animation:scroll var(--marquee-speed) linear infinite; will-change:transform; }
	.item{ font-size:clamp(15px,1.4vw,28px); font-weight:500; color:var(--gold-300); padding:0 3vw; letter-spacing:.4px; display:flex; align-items:center; gap:1.8vw; }
	.item::before{ content:"◆"; color:var(--gold-400); font-size:.7em; }
	.light-marquee .item{ color:#fff; }
	.light-marquee .item::before{ content:"•"; font-size:1.4em; }
	@keyframes scroll{ from{transform:translateX(0);} to{transform:translateX(-50%);} }

	/* OVERLAYS */
	.overlay{
		position:absolute; inset:0; z-index:850;
		background:radial-gradient(120% 90% at 50% 30%, #0e2974 0%, #06122e 65%, #03091f 100%);
		display:none; align-items:center; justify-content:center; flex-direction:column; text-align:center; overflow:hidden;
	}
	.overlay.show{ display:flex; }
	.overlay::before{ content:""; position:absolute; inset:0; background:url('/default-bg.png') center/cover; opacity:.18; filter:blur(2px) saturate(1.1); }
	.overlay-inner{ position:relative; z-index:2; padding:40px;}
	.label{ font-size:clamp(20px,2.2vw,44px); letter-spacing:8px; color:#f0cd86; font-weight:600; }
	.arabic{ font-family:'Amiri',serif; font-size:clamp(60px,8vw,160px); line-height:1.2; margin:2vh 0 1vh; color:#fff; text-shadow:0 4px 30px rgba(0,0,0,.7); }
	.prayer-name{ font-size:clamp(70px,9vw,180px); font-weight:800; letter-spacing:-2px; background:linear-gradient(180deg,#fff,#f7e1a8 60%,#e3b864); -webkit-background-clip:text; background-clip:text; color:transparent; }
	.place{ margin-top:2vh; font-size:clamp(20px,2vw,40px); color:rgba(255,255,255,.85); }
	.clock-big{ margin-top:3vh; font-weight:800; font-size:clamp(70px,8vw,160px); color:#fff; font-variant-numeric:tabular-nums; letter-spacing:-4px; }
	.pulse{ margin-top:2vh; display:inline-flex; align-items:center; gap:14px; padding:1.4vh 2.4vw; background:rgba(255,255,255,.08); border:1px solid rgba(243,205,134,.4); border-radius:999px; color:#fff; font-size:clamp(15px,1.5vw,28px); backdrop-filter:blur(6px); }
	.pulse-dot{ width:14px; height:14px; border-radius:50%; background:#f0cd86; animation:pulse 1.6s infinite; }
	@keyframes pulse{ 0%{box-shadow:0 0 0 0 rgba(243,205,134,.6);} 70%{box-shadow:0 0 0 26px rgba(243,205,134,0);} 100%{box-shadow:0 0 0 0 rgba(243,205,134,0);} }
	
	.overlay.iqamah .label{ color:#7bff9c; }
	.countdown-huge{ font-size:clamp(180px,22vw,480px); font-weight:900; line-height:1; color:#fff; letter-spacing:-12px; font-variant-numeric:tabular-nums; text-shadow:0 10px 60px rgba(0,0,0,.6); margin-top:2vh; }
	.countdown-huge .sep{ color:#f0cd86; }
	.sub{ margin-top:3vh; font-size:clamp(22px,2.4vw,46px); color:rgba(255,255,255,.85); font-weight:500; }
</style>
