<script lang="ts">
    import PrayerIcon from '$lib/components/PrayerIcon.svelte';
    import { APP_VERSION, APP_NAME } from '$lib/version';
    let { masjid, settings, schedules, nextPrayer, nextSecs, timeStr, dateStrMasehi, dateStrHijri, dayName, activeWallpaper, formatSecs, timeNow, iqamahFor } = $props();

    const nameShort = $derived(masjid?.name?.replace(/^Masjid\s+/i, '') || '');

    let hr  = $derived((timeNow.getHours() % 12) + timeNow.getMinutes() / 60);
    let min = $derived(timeNow.getMinutes() + timeNow.getSeconds() / 60);
    let sec = $derived(timeNow.getSeconds());
</script>

<div class="theme-wrapper">

    <div class="bg-photo" style="background-image: url({activeWallpaper || '/assets/masjid-bg.png'});"></div>

    <!-- LEFT SIDEBAR -->
    <aside class="sidebar">
      {#each schedules as p}
      <div class="prayer" class:active={nextPrayer?.key === p.key} data-prayer={p.key}>
        <div class="icon"><PrayerIcon icon={p.key} /></div>
        <div class="body">
          <div class="name">{p.name}</div>
          <div class="time">{p.time}</div>
          <div class="iq">
            {#if p.key === 'syuruq'}
              <span>{iqamahFor ? iqamahFor(p.key, p.time) : ''}</span>
            {:else}
              IQAMAH <span>{iqamahFor ? iqamahFor(p.key, p.time) : ''}</span>
            {/if}
          </div>
        </div>
      </div>
      {/each}
    </aside>

    <!-- HEADER top-right -->
    <header class="header">
      <div class="text">
        <div class="name"><span class="accent">Masjid</span> {nameShort}</div>
        <div class="addr">{masjid?.address || ''}{masjid?.phone ? ' · Telp. ' + masjid.phone : ''}</div>
      </div>
      {#if settings?.showLogo}
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.4 0 .8.2 1 .6l1.2 2c.2.4.2.8 0 1.2L12.8 8.4c-.1.2-.2.4-.2.6V11h3.3a3 3 0 0 1 3 3v7H5V14a3 3 0 0 1 3-3h3.3V9a1 1 0 0 0-.2-.6L9.8 5.8a1 1 0 0 1 0-1.2l1.2-2c.2-.4.6-.6 1-.6Z"/></svg>
      </div>
      {/if}
    </header>

    <!-- ANALOG CLOCK (center-left) — dark dial, gold second hand (tema-6 style) -->
    <div class="clock-area">
      <div class="clock">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <g font-family="Inter, sans-serif" font-weight="700" font-size="13" fill="#ffffff" text-anchor="middle" dominant-baseline="central">
            <text x="100" y="22">12</text>
            <text x="138" y="32" fill="#f0cd86">1</text><text x="166" y="60">2</text>
            <text x="178" y="100" fill="#f0cd86">3</text><text x="166" y="140">4</text>
            <text x="138" y="168" fill="#f0cd86">5</text><text x="100" y="178">6</text>
            <text x="62" y="168" fill="#f0cd86">7</text><text x="34" y="140">8</text>
            <text x="22" y="100" fill="#f0cd86">9</text><text x="34" y="60">10</text>
            <text x="62" y="32" fill="#f0cd86">11</text>
          </g>
          {#each Array(60) as _, i}
            {@const angle = (i * 6) * Math.PI / 180}
            {@const isHour = i % 5 === 0}
            {@const r1 = isHour ? 86 : 89}
            {@const x1 = 100 + Math.sin(angle) * r1}
            {@const y1 = 100 - Math.cos(angle) * r1}
            {@const x2 = 100 + Math.sin(angle) * 92}
            {@const y2 = 100 - Math.cos(angle) * 92}
            <line {x1} {y1} {x2} {y2} stroke={isHour ? '#f0cd86' : 'rgba(255,255,255,.3)'} stroke-width={isHour ? '1.8' : '.8'} />
          {/each}
          <line transform="rotate({hr * 30} 100 100)" x1="100" y1="100" x2="100" y2="62" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/>
          <line transform="rotate({min * 6} 100 100)" x1="100" y1="100" x2="100" y2="35" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/>
          <line transform="rotate({sec * 6} 100 100)" x1="100" y1="105" x2="100" y2="30" stroke="#f0cd86" stroke-width="1.4" stroke-linecap="round"/>
          <circle cx="100" cy="100" r="4" fill="#f0cd86" stroke="#0a1f4d" stroke-width="1.5"/>
        </svg>
        <div class="clock-brand">
          <div class="b">{APP_NAME}</div>
          <div class="v">v{APP_VERSION}</div>
        </div>
      </div>
    </div>

    <!-- DATE STRIP -->
    <div class="date-strip">
      <span class="dot"></span>
      <span>{dateStrMasehi}</span>
      {#if settings?.showHijri}
        <span class="sep">/</span>
        <span>{dateStrHijri}</span>
      {/if}
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
  .bg-photo::after{
    content:""; position:absolute; inset:0;
    background:
      linear-gradient(90deg, rgba(8,25,66,.92) 0%, rgba(8,25,66,.55) 28%, transparent 45%, transparent 65%, rgba(6,18,46,.5) 100%),
      linear-gradient(180deg, rgba(6,18,46,.45) 0%, transparent 25%, transparent 75%, rgba(6,18,46,.7) 100%);
  }

  .sidebar{ position:absolute; left:0; top:0; bottom:0; width:30vw; padding:2.5vh 1.6vw 7vh 1.4vw; display:flex; flex-direction:column; justify-content:space-between; z-index:3; background:linear-gradient(180deg, rgba(8,18,46,.7) 0%, rgba(8,18,46,.5) 60%, rgba(8,18,46,0) 100%); }
  .prayer{ display:grid; grid-template-columns:5vw 1fr; align-items:center; gap:1.4vw; }
  .prayer .icon{ width:5vw; height:5vw; max-width:88px; max-height:88px; display:grid; place-items:center; color:var(--gold-400); }
  .prayer .icon :global(svg){ width:100%; height:100%; filter:drop-shadow(0 2px 6px rgba(0,0,0,.5)); }
  .prayer .body{ min-width:0; }
  .prayer .name{ font-weight:700; font-size:clamp(20px,2vw,42px); line-height:1; color:#fff; text-shadow:0 2px 8px rgba(0,0,0,.5); }
  .prayer .time{ font-family:'Inter',sans-serif; font-weight:800; font-size:clamp(42px,4.4vw,90px); line-height:1; margin-top:.6vh; color:var(--gold-300); letter-spacing:-1.5px; text-shadow:0 2px 12px rgba(0,0,0,.5); font-variant-numeric:tabular-nums; }
  .prayer .iq{ font-size:clamp(11px,.9vw,18px); color:rgba(255,255,255,.78); letter-spacing:1.6px; font-weight:600; margin-top:.4vh; }
  .prayer.active .name, .prayer.active .time{ color:var(--yellow); text-shadow:0 0 22px rgba(255,217,61,.6); }
  .prayer.active .icon{ color:var(--yellow); }

  .header{ position:absolute; right:1.4vw; top:2vh; z-index:4; display:flex; align-items:center; gap:1.2vw; text-align:right; }
  .header .text{ line-height:1; }
  .header .name{ font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:clamp(28px,3vw,60px); letter-spacing:-1px; text-shadow:0 2px 12px rgba(0,0,0,.6); }
  .header .accent{ color:var(--gold-300); }
  .header .addr{ margin-top:.8vh; font-size:clamp(11px,.95vw,18px); color:rgba(255,255,255,.85); letter-spacing:.3px; font-weight:500; }
  .logo{ width:clamp(56px,5vw,100px); height:clamp(56px,5vw,100px); border-radius:14px; background:linear-gradient(135deg,#c89a45,#f0cd86 50%,#a37a2a); border:2px solid rgba(255,235,180,.65); display:grid; place-items:center; box-shadow:0 8px 24px rgba(0,0,0,.45); flex:none; }
  .logo :global(svg){ width:60%; height:60%; color:#0a1f4d; }

  .clock-area{ position:absolute; left:24vw; top:50%; transform:translateY(-50%); z-index:5; }
  .clock{ width:clamp(220px,21vw,420px); aspect-ratio:1/1; background:radial-gradient(circle at 50% 50%, #0a0e1c 0%, #050913 70%, #02060f 100%); border-radius:50%; border:5px solid rgba(243,205,134,.4); box-shadow:0 30px 80px rgba(0,0,0,.6), 0 0 0 12px rgba(8,18,46,.5), inset 0 0 0 1px rgba(243,205,134,.18); position:relative; }
  .clock :global(svg){ width:100%; height:100%; position:relative; z-index:1; }
  .clock-brand{ position:absolute; left:50%; top:62%; transform:translate(-50%,0); text-align:center; color:rgba(255,255,255,.7); pointer-events:none; z-index:0; }
  .clock-brand .b{ font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:clamp(13px,1.2vw,22px); letter-spacing:3px; }
  .clock-brand .v{ font-size:clamp(8px,.7vw,12px); letter-spacing:1.5px; color:rgba(255,255,255,.45); font-weight:600; margin-top:2px; }

  .date-strip{ position:absolute; left:24vw; bottom:9.5vh; z-index:4; display:flex; align-items:center; gap:.8vw; color:#fff; font-size:clamp(14px,1.3vw,26px); font-weight:600; text-shadow:0 2px 10px rgba(0,0,0,.6); }
  .date-strip .dot{ width:.7vw; height:.7vw; max-width:14px; max-height:14px; border-radius:50%; background:var(--gold-300); box-shadow:0 0 12px var(--gold-300); }
  .date-strip .sep{ opacity:.5; padding:0 .3vw; }

  .countdown{ position:absolute; right:1.4vw; bottom:9.5vh; z-index:4; background:linear-gradient(180deg,#ffffff,#e9eefb); color:#0a1f4d; padding:1vh 1.4vw; border-radius:999px; display:flex; align-items:center; gap:.8vw; box-shadow:0 12px 32px rgba(0,0,0,.5), inset 0 1px 0 #fff; border:1.5px solid rgba(243,205,134,.7); }
  .countdown :global(svg){ width:clamp(20px,1.8vw,36px); height:clamp(20px,1.8vw,36px); color:var(--navy-600); }
  .countdown .lbl{ font-weight:700; font-size:clamp(16px,1.5vw,30px); }
  .countdown .val{ font-family:'Inter',sans-serif; font-weight:800; font-size:clamp(20px,1.9vw,38px); color:#0a3d8f; letter-spacing:-.5px; font-variant-numeric:tabular-nums; }
</style>
