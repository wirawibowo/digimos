<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	type PrayerTimes = {
		subuh: string;
		dzuhur: string;
		ashar: string;
		maghrib: string;
		isya: string;
		syuruq?: string;
	};

	type Config = {
		masjidName: string;
		cityName: string;
		cityApiId: string;
		apiProvider: 'myquran' | 'aladhan';
		announcements: string;
	};

	const PRAYER_NAMES: Record<keyof PrayerTimes, string> = {
		subuh: 'Subuh',
		syuruq: 'Syuruq',
		dzuhur: 'Dzuhur',
		ashar: 'Ashar',
		maghrib: 'Maghrib',
		isya: 'Isya'
	};

	const PRAYER_ORDER: (keyof PrayerTimes)[] = ['subuh', 'syuruq', 'dzuhur', 'ashar', 'maghrib', 'isya'];

	let config: Config | null = $state(null);
	let prayers: PrayerTimes | null = $state(null);
	let now = $state(new Date());
	let countdown = $state('');
	let nextPrayer = $state('');
	let marqueeText = $state('');
	let loading = $state(true);
	let error = $state('');

	let clockInterval: ReturnType<typeof setInterval>;
	let marqueeIndex = $state(0);
	let marqueeItems: string[] = $state([]);
	let marqueeInterval: ReturnType<typeof setInterval>;

	function toMinutes(time: string): number {
		const [h, m] = time.split(':').map(Number);
		return h * 60 + m;
	}

	function calcCountdown(p: PrayerTimes, d: Date): { name: string; countdown: string } {
		const currentMinutes = d.getHours() * 60 + d.getMinutes();
		const times = PRAYER_ORDER
			.filter(k => p[k])
			.map(k => ({ name: PRAYER_NAMES[k], minutes: toMinutes(p[k]!) }));

		const next = times.find(t => t.minutes > currentMinutes) ?? times[0];
		const diff = next.minutes > currentMinutes
			? next.minutes - currentMinutes
			: 24 * 60 - currentMinutes + next.minutes;

		const h = Math.floor(diff / 60);
		const m = diff % 60;
		return {
			name: next.name,
			countdown: h > 0 ? `${h} jam ${m} menit` : `${m} menit`
		};
	}

	async function fetchMyQuran(cityApiId: string): Promise<PrayerTimes> {
		const date = new Date();
		const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
		const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityApiId}/${dateStr}`);
		const json = await res.json();
		const j = json.data?.jadwal;
		if (!j) throw new Error('Data jadwal tidak ditemukan');
		return {
			subuh: j.subuh,
			syuruq: j.terbit,
			dzuhur: j.dzuhur,
			ashar: j.ashar,
			maghrib: j.maghrib,
			isya: j.isya
		};
	}

	async function fetchAlAdhan(cityName: string): Promise<PrayerTimes> {
		const date = new Date();
		const dateStr = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
		const [city, country = 'Indonesia'] = cityName.split(',').map(s => s.trim());
		const res = await fetch(`https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`);
		const json = await res.json();
		const t = json.data?.timings;
		if (!t) throw new Error('Data jadwal tidak ditemukan');
		return {
			subuh: t.Fajr,
			syuruq: t.Sunrise,
			dzuhur: t.Dhuhr,
			ashar: t.Asr,
			maghrib: t.Maghrib,
			isya: t.Isha
		};
	}

	onMount(async () => {
		if (!browser) return;

		const saved = localStorage.getItem('digimos-spa-config');
		if (!saved) { goto('/'); return; }

		config = JSON.parse(saved);
		marqueeItems = (config!.announcements ?? '').split('\n').filter(Boolean);
		marqueeText = marqueeItems[0] ?? '';

		try {
			prayers = config!.apiProvider === 'myquran'
				? await fetchMyQuran(config!.cityApiId)
				: await fetchAlAdhan(config!.cityName);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Gagal memuat jadwal sholat';
		} finally {
			loading = false;
		}

		clockInterval = setInterval(() => {
			now = new Date();
			if (prayers) {
				const result = calcCountdown(prayers, now);
				nextPrayer = result.name;
				countdown = result.countdown;
			}
		}, 1000);

		if (marqueeItems.length > 1) {
			marqueeInterval = setInterval(() => {
				marqueeIndex = (marqueeIndex + 1) % marqueeItems.length;
				marqueeText = marqueeItems[marqueeIndex];
			}, 8000);
		}
	});

	onDestroy(() => {
		clearInterval(clockInterval);
		clearInterval(marqueeInterval);
	});

	function formatTime(d: Date) {
		return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
	}

	function formatDate(d: Date) {
		return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
	}
</script>

{#if loading}
	<div class="center">
		<div class="spinner"></div>
		<p>Memuat jadwal sholat...</p>
	</div>
{:else if error}
	<div class="center">
		<p class="error">⚠️ {error}</p>
		<button onclick={() => goto('/')}>← Kembali</button>
	</div>
{:else if config && prayers}
<div class="display">
	<div class="header">
		<div class="masjid-name">{config.masjidName}</div>
		<div class="datetime">
			<div class="clock">{formatTime(now)}</div>
			<div class="date">{formatDate(now)}</div>
		</div>
	</div>

	<div class="prayer-grid">
		{#each PRAYER_ORDER.filter(k => prayers![k]) as key}
			<div class="prayer-card">
				<div class="prayer-name">{PRAYER_NAMES[key]}</div>
				<div class="prayer-time">{prayers![key]}</div>
			</div>
		{/each}
	</div>

	<div class="countdown-box">
		<div class="countdown-label">Menuju {nextPrayer}</div>
		<div class="countdown-value">{countdown}</div>
	</div>

	{#if marqueeText}
	<div class="marquee-bar">
		<span class="marquee-text">{marqueeText}</span>
	</div>
	{/if}

	<button class="back-btn" onclick={() => goto('/')}>⚙️</button>
</div>
{/if}

<style>
	.center {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		gap: 1rem;
		color: #aaa;
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid #333;
		border-top-color: #f0cd86;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin { to { transform: rotate(360deg); } }

	.error { color: #ff6b6b; font-size: 1.1rem; }

	.center button {
		padding: 0.6rem 1.5rem;
		background: #f0cd86;
		color: #111;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 700;
	}

	.display {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: linear-gradient(135deg, #0d1b2a 0%, #1a2f4a 100%);
		padding: 2rem;
		gap: 1.5rem;
		position: relative;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		border-bottom: 1px solid rgba(240,205,134,0.3);
		padding-bottom: 1rem;
	}

	.masjid-name {
		font-size: clamp(1.2rem, 3vw, 2rem);
		font-weight: 700;
		color: #f0cd86;
	}

	.datetime { text-align: right; }

	.clock {
		font-size: clamp(2rem, 6vw, 4rem);
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		color: #fff;
		line-height: 1;
	}

	.date {
		font-size: clamp(0.75rem, 1.5vw, 1rem);
		color: #aaa;
		margin-top: 0.25rem;
	}

	.prayer-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		flex: 1;
	}

	@media (min-width: 768px) {
		.prayer-grid { grid-template-columns: repeat(6, 1fr); }
	}

	.prayer-card {
		background: rgba(255,255,255,0.05);
		border: 1px solid rgba(240,205,134,0.2);
		border-radius: 12px;
		padding: 1.25rem 0.75rem;
		text-align: center;
	}

	.prayer-name {
		font-size: 0.8rem;
		color: #f0cd86;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 0.5rem;
	}

	.prayer-time {
		font-size: clamp(1.2rem, 2.5vw, 1.75rem);
		font-weight: 700;
		color: #fff;
		font-variant-numeric: tabular-nums;
	}

	.countdown-box {
		background: rgba(240,205,134,0.1);
		border: 1px solid rgba(240,205,134,0.4);
		border-radius: 12px;
		padding: 1.25rem 2rem;
		text-align: center;
	}

	.countdown-label {
		font-size: 0.85rem;
		color: #f0cd86;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin-bottom: 0.25rem;
	}

	.countdown-value {
		font-size: clamp(1.5rem, 4vw, 2.5rem);
		font-weight: 800;
		color: #fff;
	}

	.marquee-bar {
		background: rgba(240,205,134,0.15);
		border-radius: 8px;
		padding: 0.6rem 1.5rem;
		overflow: hidden;
		text-align: center;
	}

	.marquee-text {
		color: #f0cd86;
		font-size: clamp(0.85rem, 1.5vw, 1.1rem);
		animation: fadeIn 0.6s ease;
	}

	@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

	.back-btn {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		background: rgba(255,255,255,0.1);
		border: 1px solid #444;
		color: #aaa;
		border-radius: 8px;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		font-size: 1rem;
		transition: opacity 0.2s;
	}

	.back-btn:hover { opacity: 0.7; }
</style>
