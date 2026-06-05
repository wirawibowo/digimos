<script lang="ts">
    import PrayerIcon from '$lib/components/PrayerIcon.svelte';
    import { APP_VERSION, APP_NAME } from '$lib/version';
    let { masjid, settings, schedules, nextPrayer, nextSecs, timeStr, dateStrMasehi, dateStrHijri, dayName, activeWallpaper, formatSecs, timeNow } = $props();

    const nameShort = $derived(masjid?.name?.replace(/^Masjid\s+/i, '') || '');

    let hr  = $derived((timeNow.getHours() % 12) + timeNow.getMinutes() / 60);
    let min = $derived(timeNow.getMinutes() + timeNow.getSeconds() / 60);
    let sec = $derived(timeNow.getSeconds());
</script>

<div class="theme-wrapper">

    <!-- mosque photo bg -->
    <div class="bg-photo" style="background-image: url({activeWallpaper || '/assets/masjid-bg.png'});"></div>

    <!-- LEFT BLUE SIDEBAR -->
    <aside class="sidebar">
      {#each schedules as p}
      <div class="prayer" class:active={nextPrayer?.key === p.key} data-prayer={p.key}>
        <div class="icon"><PrayerIcon icon={p.key} /></div>
        <div class="body">
          <div class="name">{p.name}</div>
          <div class="time">{p.time}</div>
        </div>
      </div>
      {/each}
    </aside>

    <!-- HEADER GRAY BAR -->
    <header class="header-bar">
      <div>
        <div class="name"><span class="accent">Masjid</span> {nameShort}</div>
        <div class="addr">{masjid?.address || ''}{masjid?.phone ? ' · Telp. ' + masjid.phone : ''}</div>
      </div>
      {#if settings?.showLogo}
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3l1 2-1 2-1-2 1-2Z" fill="currentColor"/>
          <path d="M5 21V14a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v7"/>
          <path d="M9 21v-4a3 3 0 0 1 6 0v4"/>
          <path d="M5 21h14"/>
        </svg>
      </div>
      {/if}
    </header>

    <!-- DATE PILL -->
    <div class="date-pill">
      <span class="dot"></span>
      <span>{dateStrMasehi}</span>
      {#if settings?.showHijri}
        <span class="sep">/</span>
        <span>{dateStrHijri}</span>
      {/if}
    </div>

    <!-- BLUE ANALOG CLOCK -->
    <div class="clock-area">
      <div class="clock">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          {#each Array(60) as _, i}
            {@const angle = (i * 6) * Math.PI / 180}
            {@const isHour = i % 5 === 0}
            {@const r1 = isHour ? 80 : 87}
            {@const x1 = 100 + Math.sin(angle) * r1}
            {@const y1 = 100 - Math.cos(angle) * r1}
            {@const x2 = 100 + Math.sin(angle) * 92}
            {@const y2 = 100 - Math.cos(angle) * 92}
            <line {x1} {y1} {x2} {y2} stroke="#ffffff" stroke-width={isHour ? '3' : '1'} stroke-linecap="round" opacity={isHour ? '1' : '.55'} />
          {/each}
          <g font-family="Inter, sans-serif" font-weight="800" font-size="15" fill="#ffffff" text-anchor="middle" dominant-baseline="central">
            <text x="100" y="22">12</text><text x="138" y="32">1</text><text x="166" y="60">2</text>
            <text x="178" y="100">3</text><text x="166" y="140">4</text><text x="138" y="168">5</text>
            <text x="100" y="178">6</text><text x="62" y="168">7</text><text x="34" y="140">8</text>
            <text x="22" y="100">9</text><text x="34" y="60">10</text><text x="62" y="32">11</text>
          </g>
          <line transform="rotate({hr * 30} 100 100)" x1="100" y1="100" x2="100" y2="62" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
          <line transform="rotate({min * 6} 100 100)" x1="100" y1="100" x2="100" y2="35" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round"/>
          <line transform="rotate({sec * 6} 100 100)" x1="100" y1="108" x2="100" y2="28" stroke="#ff3b3b" stroke-width="1.6" stroke-linecap="round"/>
          <circle cx="100" cy="100" r="5" fill="#0a1f4d" stroke="#fff" stroke-width="1.5"/>
        </svg>
        <div class="clock-brand">
          <div class="b">{APP_NAME}</div>
          <div class="v">v{APP_VERSION}</div>
        </div>
      </div>
    </div>

    <!-- COUNTDOWN -->
    <div class="countdown">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      <span class="lbl">{nextPrayer?.name || ''}</span>
      <span class="val">{formatSecs(nextSecs)}</span>
    </div>

</div>

<style>
  .theme-wrapper { position: absolute; inset: 0; }

  .bg-photo{ position:absolute; inset:0; background-size:cover; background-position:center 30%; z-index:0; }
  .bg-photo::after{ content:""; position:absolute; inset:0; background:linear-gradient(180deg, rgba(6,18,46,.25) 0%, transparent 30%, transparent 75%, rgba(6,18,46,.6) 100%); }

  .sidebar{ position:absolute; left:0; top:0; bottom:6vh; width:28vw; background:linear-gradient(180deg,#1f5dd6 0%,#1748b8 100%); border-right:2px solid rgba(243,205,134,.35); display:flex; flex-direction:column; z-index:3; box-shadow:6px 0 24px rgba(0,0,0,.4); }
  .prayer{ flex:1; display:grid; grid-template-columns:5vw 1fr; align-items:center; gap:1vw; padding:.4vh 1vw .4vh 1.4vw; border-bottom:1px solid rgba(255,255,255,.18); }
  .prayer:last-child{ border-bottom:none; }
  .prayer .icon{ width:4.6vw; height:4.6vw; max-width:90px; max-height:90px; display:grid; place-items:center; color:#fff; }
  .prayer .icon :global(svg){ width:100%; height:100%; filter:drop-shadow(0 2px 4px rgba(0,0,0,.3)); }
  .prayer .body{ min-width:0; }
  .prayer .name{ font-weight:600; font-size:clamp(18px,1.8vw,36px); line-height:1; color:rgba(255,255,255,.95); letter-spacing:.3px; }
  .prayer .time{ font-family:'Inter',sans-serif; font-weight:800; font-size:clamp(38px,3.8vw,78px); line-height:1; margin-top:.6vh; letter-spacing:-2px; color:#fff; font-variant-numeric:tabular-nums; }
  .prayer.active .time{ color:var(--yellow); text-shadow:0 0 22px rgba(255,217,61,.6); }
  .prayer.active .name{ color:var(--yellow); }

  .header-bar{ position:absolute; left:28vw; right:0; top:0; height:10vh; background:linear-gradient(180deg, rgba(80,90,110,.78) 0%, rgba(40,50,70,.78) 100%); border-bottom:1px solid rgba(255,255,255,.1); display:flex; align-items:center; justify-content:space-between; padding:0 1.6vw 0 2.4vw; z-index:4; backdrop-filter:blur(8px); }
  .header-bar .name{ font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:clamp(28px,3.2vw,64px); line-height:1; letter-spacing:-1px; text-shadow:0 2px 10px rgba(0,0,0,.5); }
  .header-bar .accent{ color:var(--gold-300); }
  .header-bar .addr{ font-size:clamp(12px,.95vw,18px); color:rgba(255,255,255,.85); margin-top:.8vh; font-weight:500; letter-spacing:.2px; }
  .logo{ width:clamp(56px,5vw,100px); height:clamp(56px,5vw,100px); border-radius:14px; background:transparent; border:2px solid rgba(255,255,255,.5); display:grid; place-items:center; color:#fff; }
  .logo :global(svg){ width:60%; height:60%; }

  .date-pill{ position:absolute; left:29vw; top:10vh; margin-top:1vh; z-index:4; background:linear-gradient(180deg,#2575e8,#1748b8); padding:.9vh 1.6vw; border-radius:10px; border:1px solid rgba(243,205,134,.45); display:flex; align-items:center; gap:.7vw; font-size:clamp(14px,1.4vw,28px); font-weight:700; color:#fff; box-shadow:0 8px 20px rgba(0,0,0,.35); }
  .date-pill .dot{ width:.7vw; height:.7vw; max-width:14px; max-height:14px; border-radius:50%; background:#7bff9c; box-shadow:0 0 10px #7bff9c; }
  .date-pill .sep{ opacity:.5; padding:0 .25vw; }

  .clock-area{ position:absolute; right:1.6vw; top:12vh; z-index:5; }
  .clock{ width:clamp(180px,18vw,340px); aspect-ratio:1/1; border-radius:50%; background:radial-gradient(circle at 50% 50%, #2c7ff0 0%, #1f5dd6 60%, #133f9c 100%); border:6px solid rgba(255,255,255,.18); box-shadow:0 24px 60px rgba(0,0,0,.55), 0 0 0 10px rgba(20,69,168,.35), inset 0 0 0 1px rgba(255,255,255,.2); position:relative; }
  .clock :global(svg){ width:100%; height:100%; position:relative; z-index:1; }
  .clock-brand{ position:absolute; left:50%; top:60%; transform:translate(-50%,0); text-align:center; color:rgba(255,255,255,.7); pointer-events:none; z-index:0; }
  .clock-brand .b{ font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:clamp(13px,1.2vw,24px); letter-spacing:3px; }
  .clock-brand .v{ font-size:clamp(8px,.7vw,13px); letter-spacing:1.5px; color:rgba(255,255,255,.6); font-weight:600; margin-top:2px; }

  .countdown{ position:absolute; right:1.4vw; bottom:8vh; z-index:5; background:linear-gradient(180deg,#ffffff,#e9eefb); color:#0a1f4d; padding:1vh 1.4vw; border-radius:999px; display:flex; align-items:center; gap:.8vw; box-shadow:0 12px 30px rgba(0,0,0,.5), inset 0 1px 0 #fff; border:1.5px solid rgba(243,205,134,.7); }
  .countdown :global(svg){ width:clamp(20px,1.8vw,36px); height:clamp(20px,1.8vw,36px); color:var(--navy-600); }
  .countdown .lbl{ font-weight:700; font-size:clamp(16px,1.5vw,30px); }
  .countdown .val{ font-family:'Inter',sans-serif; font-weight:800; font-size:clamp(20px,1.9vw,38px); color:#0a3d8f; letter-spacing:-.5px; font-variant-numeric:tabular-nums; }
</style>
