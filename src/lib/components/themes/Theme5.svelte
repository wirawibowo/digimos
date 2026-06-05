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
  <div class="gold-frame"></div>
  <div class="inner">

    <!-- mosque photo (above bar) -->
    <div class="bg-photo" style="background-image: url({activeWallpaper || '/assets/masjid-bg.png'});"></div>

    <!-- TOP-LEFT BLUE PILL -->
    <div class="header-pill">
      {#if settings?.showLogo}
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3l1 2-1 2-1-2 1-2Z" fill="currentColor"/>
          <path d="M5 21V14a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v7"/>
          <path d="M9 21v-4a3 3 0 0 1 6 0v4"/>
          <path d="M5 21h14"/>
        </svg>
      </div>
      {/if}
      <div>
        <div class="name"><span class="accent">Masjid</span> {nameShort}</div>
        <div class="addr">{masjid?.address || ''}{masjid?.phone ? ' · Telp. ' + masjid.phone : ''}</div>
      </div>
    </div>

    <!-- TOP-RIGHT DATE + COUNTDOWN -->
    <div class="top-right">
      <div class="date-strip">
        <span class="dot"></span>
        <span>{dateStrMasehi}</span>
        {#if settings?.showHijri}
          <span class="sep">/</span>
          <span>{dateStrHijri}</span>
        {/if}
      </div>
      <div class="countdown">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <span class="lbl">{nextPrayer?.name || ''}</span>
        <span class="val">{formatSecs(nextSecs)}</span>
      </div>
    </div>

    <!-- ANALOG CLOCK bottom-left -->
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

    <!-- BOTTOM PRAYER BAR -->
    <div class="bar">
      {#each schedules as p}
      <div class="c" class:active={nextPrayer?.key === p.key} data-prayer={p.key}>
        <div class="n">{p.name}</div>
        <div class="t">{p.time}</div>
      </div>
      {/each}
    </div>

  </div>
</div>

<style>
  .theme-wrapper { position: absolute; inset: 0; }

  .gold-frame{ position:absolute; inset:0; padding:.9vh; background:linear-gradient(135deg,#3a2810 0%,#c89a45 14%,#f7e1a8 24%,#c89a45 36%,#6b4a1a 52%,#c89a45 68%,#f7e1a8 80%,#a37a2a 100%); z-index:1; pointer-events:none; }
  .gold-frame::before{ content:""; position:absolute; inset:.9vh; background:#000; }
  .inner{ position:absolute; inset:.9vh; z-index:2; overflow:hidden; }

  .bg-photo{ position:absolute; inset:0; background-size:cover; background-position:center 60%; z-index:0; }
  .bg-photo::after{ content:""; position:absolute; inset:0; background:linear-gradient(180deg, rgba(6,18,46,.25) 0%, transparent 20%, transparent 60%, rgba(6,18,46,.5) 100%); }

  .header-pill{ position:absolute; left:0; top:0; z-index:4; background:linear-gradient(180deg,#2168d6 0%,#1748b8 100%); padding:1.6vh 6vw 1.6vh 2vw; border-radius:0 0 6vw 0; display:flex; align-items:center; gap:1.2vw; box-shadow:6px 6px 24px rgba(0,0,0,.4); max-width:42vw; }
  .logo{ width:clamp(48px,4.4vw,90px); height:clamp(48px,4.4vw,90px); border-radius:50%; background:linear-gradient(135deg, rgba(255,255,255,.18), rgba(255,255,255,.05)); border:2px solid rgba(255,255,255,.4); display:grid; place-items:center; flex:none; color:#fff; }
  .logo :global(svg){ width:62%; height:62%; }
  .header-pill .name{ font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:clamp(28px,3.2vw,62px); line-height:1; letter-spacing:-1px; }
  .header-pill .accent{ color:var(--gold-300); }
  .header-pill .addr{ margin-top:.8vh; font-size:clamp(12px,1vw,20px); color:rgba(255,255,255,.85); letter-spacing:.3px; font-weight:500; }

  .top-right{ position:absolute; right:1.6vw; top:2vh; z-index:4; text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:1vh; }
  .date-strip{ color:#fff; font-size:clamp(15px,1.5vw,30px); font-weight:700; display:flex; align-items:center; gap:.6vw; text-shadow:0 2px 10px rgba(0,0,0,.6); }
  .date-strip .dot{ width:.7vw; height:.7vw; max-width:14px; max-height:14px; border-radius:50%; background:#7bff9c; box-shadow:0 0 10px #7bff9c; }
  .date-strip .sep{ opacity:.55; padding:0 .2vw; }
  .countdown{ background:linear-gradient(180deg,#ffffff,#e9eefb); color:#0a1f4d; padding:.9vh 1.4vw; border-radius:999px; display:flex; align-items:center; gap:.7vw; box-shadow:0 10px 24px rgba(0,0,0,.45), inset 0 1px 0 #fff; border:1.5px solid rgba(243,205,134,.6); }
  .countdown :global(svg){ width:clamp(18px,1.6vw,32px); height:clamp(18px,1.6vw,32px); color:var(--navy-600); }
  .countdown .lbl{ font-weight:700; font-size:clamp(15px,1.4vw,28px); }
  .countdown .val{ font-family:'Inter',sans-serif; font-weight:800; font-size:clamp(18px,1.7vw,34px); color:#0a3d8f; letter-spacing:-.5px; font-variant-numeric:tabular-nums; }

  .clock-area{ position:absolute; left:1.4vw; bottom:7vh; z-index:5; }
  .clock{ width:clamp(180px,18vw,340px); aspect-ratio:1/1; border-radius:50%; background:radial-gradient(circle at 50% 50%, #2c7ff0 0%, #1f5dd6 60%, #133f9c 100%); border:5px solid rgba(255,255,255,.18); box-shadow:0 20px 50px rgba(0,0,0,.55), 0 0 0 8px rgba(20,69,168,.4), inset 0 0 0 1px rgba(255,255,255,.2); position:relative; }
  .clock :global(svg){ width:100%; height:100%; position:relative; z-index:1; }
  .clock-brand{ position:absolute; left:50%; top:60%; transform:translate(-50%,0); text-align:center; color:rgba(255,255,255,.7); z-index:0; pointer-events:none; }
  .clock-brand .b{ font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:clamp(10px,1vw,18px); letter-spacing:2.5px; }
  .clock-brand .v{ font-size:clamp(7px,.65vw,12px); letter-spacing:1.4px; color:rgba(255,255,255,.55); font-weight:600; margin-top:2px; }

  .bar{ position:absolute; left:0; right:0; bottom:6vh; height:12vh; background:linear-gradient(180deg,#2168d6 0%,#1748b8 100%); z-index:4; display:flex; align-items:center; padding:0 1.2vw 0 20vw; border-top:2px solid rgba(243,205,134,.4); border-bottom:2px solid rgba(243,205,134,.3); }
  .bar .c{ flex:1; text-align:center; color:#fff; }
  .bar .c .n{ font-size:clamp(18px,1.8vw,36px); font-weight:700; letter-spacing:.3px; line-height:1; }
  .bar .c .t{ font-family:'Inter',sans-serif; font-weight:800; font-size:clamp(36px,3.6vw,72px); line-height:1; margin-top:.5vh; letter-spacing:-1.5px; font-variant-numeric:tabular-nums; }
  .bar .c.active .t{ color:var(--yellow); text-shadow:0 0 18px rgba(255,217,61,.55); }
</style>
