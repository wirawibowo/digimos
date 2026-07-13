<script lang="ts">
    import PrayerIcon from '$lib/components/PrayerIcon.svelte';
    let { masjid, settings, schedules, nextPrayer, nextSecs, timeStr, dateStrMasehi, dateStrHijri, dayName, activeWallpaper, formatSecs, timeNow } = $props();

    const nameShort = $derived(masjid?.name?.replace(/^Masjid\s+/i, '') || '');
</script>

<div class="theme-wrapper">
  <div class="gold-frame"></div>
  <div class="inner">

    <!-- bg-photo only over right/photo area -->
    <div class="bg-photo" style="background-image: url({activeWallpaper || '/assets/masjid-bg.png'});"></div>

    <!-- LEFT 6 CARDS -->
    <div class="cards">
      {#each schedules as p}
      <div class="card" class:active={nextPrayer?.key === p.key} data-prayer={p.key}>
        <div class="icon"><PrayerIcon icon={p.key} /></div>
        <div class="body">
          <div class="name">{p.name}</div>
          <div class="time">{p.time}</div>
        </div>
      </div>
      {/each}
    </div>

    <!-- TOP-RIGHT CLOCK + DATE -->
    <div class="top-info">
      <div class="time"><span>{timeStr.h}</span>:<span>{timeStr.m}</span></div>
      <div class="date">
        <span class="dot"></span>
        <span>{dateStrMasehi}</span>
      </div>
      {#if settings?.showHijri}<div class="hijri">{dateStrHijri}</div>{/if}
    </div>

    <!-- COUNTDOWN -->
    <div class="countdown">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      <span class="lbl">{nextPrayer?.name || ''}</span>
      <span class="val">{formatSecs(nextSecs)}</span>
    </div>

    <!-- BOTTOM PANEL (masjid name) -->
    <div class="bottom-panel">
      <div>
        <div class="name"><span class="accent">Masjid</span> {nameShort}</div>
        <div class="addr">{masjid?.address || ''}{masjid?.phone ? ' · Telp. ' + masjid.phone : ''}</div>
      </div>
      {#if settings?.showLogo}
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.4 0 .8.2 1 .6l1.2 2c.2.4.2.8 0 1.2L12.8 8.4c-.1.2-.2.4-.2.6V11h3.3a3 3 0 0 1 3 3v7H5V14a3 3 0 0 1 3-3h3.3V9a1 1 0 0 0-.2-.6L9.8 5.8a1 1 0 0 1 0-1.2l1.2-2c.2-.4.6-.6 1-.6Z"/></svg>
      </div>
      {/if}
    </div>

  </div>
</div>

<style>
  .theme-wrapper { position: absolute; inset: 0; }

  .gold-frame{ position:absolute; inset:0; pointer-events:none; padding:.9vh; background:linear-gradient(135deg,#3a2810 0%,#c89a45 14%,#f7e1a8 24%,#c89a45 36%,#6b4a1a 52%,#c89a45 68%,#f7e1a8 80%,#a37a2a 100%); z-index:1; }
  .gold-frame::before{ content:""; position:absolute; inset:.9vh; background:#06122e; }
  .inner{ position:absolute; inset:.9vh; z-index:2; overflow:hidden; }

  .bg-photo{ position:absolute; left:23vw; right:0; top:0; bottom:18vh; background-size:cover; background-position:center 30%; z-index:0; }
  .bg-photo::after{ content:""; position:absolute; inset:0; background:linear-gradient(180deg, rgba(6,18,46,.15) 0%, transparent 50%, rgba(6,18,46,.35) 100%); }

  .cards{ position:absolute; left:0; top:0; bottom:6vh; width:23vw; padding:1vh 1vw; display:flex; flex-direction:column; gap:.8vh; z-index:3; }
  .card{ flex:1; background:linear-gradient(180deg,#2c80f0 0%,#1e63d0 100%); border-radius:1.4vw; padding:.6vh 1.4vw; display:grid; grid-template-columns:4.5vw 1fr; align-items:center; gap:1vw; box-shadow:0 6px 18px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.1); }
  .card .icon{ width:4vw; height:4vw; max-width:76px; max-height:76px; display:grid; place-items:center; color:#fff; }
  .card .icon :global(svg){ width:100%; height:100%; filter:drop-shadow(0 2px 4px rgba(0,0,0,.3)); }
  .card .body{ min-width:0; }
  .card .name{ font-weight:600; font-size:clamp(18px,1.8vw,36px); line-height:1; color:#fff; letter-spacing:.3px; }
  .card .time{ font-family:'Inter',sans-serif; font-weight:800; font-size:clamp(38px,4vw,80px); line-height:1; margin-top:.7vh; letter-spacing:-2px; color:#fff; font-variant-numeric:tabular-nums; }
  .card.active{ background:linear-gradient(180deg,#0e3392 0%,#082b78 100%); border:1.5px solid rgba(255,255,255,.4); box-shadow:0 10px 26px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.2); }
  .card.active .time{ color:var(--yellow); text-shadow:0 0 20px rgba(255,217,61,.55); }

  .top-info{ position:absolute; right:1.4vw; top:2vh; z-index:4; text-align:right; color:#fff; }
  .top-info .time{ font-family:'Inter',sans-serif; font-weight:800; font-size:clamp(60px,6.5vw,130px); line-height:1; letter-spacing:-3px; color:#fff; text-shadow:0 4px 18px rgba(0,0,0,.6); font-variant-numeric:tabular-nums; }
  .top-info .date{ margin-top:.6vh; font-size:clamp(18px,1.7vw,32px); display:flex; align-items:center; justify-content:flex-end; gap:.6vw; text-shadow:0 2px 10px rgba(0,0,0,.6); }
  .top-info .date .dot{ width:.7vw; height:.7vw; max-width:14px; max-height:14px; border-radius:50%; background:#7bff9c; box-shadow:0 0 10px #7bff9c; }
  .top-info .hijri{ margin-top:.4vh; font-size:clamp(15px,1.4vw,28px); color:rgba(255,255,255,.85); font-weight:500; text-shadow:0 2px 10px rgba(0,0,0,.6); }

  .countdown{ position:absolute; right:1.4vw; bottom:21vh; z-index:4; background:linear-gradient(180deg,#ffffff,#e9eefb); color:#0a1f4d; padding:1vh 1.4vw; border-radius:999px; display:flex; align-items:center; gap:.8vw; box-shadow:0 12px 30px rgba(0,0,0,.5), inset 0 1px 0 #fff; border:1.5px solid rgba(243,205,134,.7); }
  .countdown :global(svg){ width:clamp(20px,1.8vw,36px); height:clamp(20px,1.8vw,36px); color:var(--navy-600); }
  .countdown .lbl{ font-weight:700; font-size:clamp(16px,1.5vw,30px); }
  .countdown .val{ font-family:'Inter',sans-serif; font-weight:800; font-size:clamp(20px,1.9vw,38px); color:#0a3d8f; letter-spacing:-.5px; font-variant-numeric:tabular-nums; }

  .bottom-panel{
    position:absolute; left:23vw; right:0; bottom:6vh; height:12vh;
    background:
      radial-gradient(circle at 10px 10px, rgba(243,205,134,.08) 1px, transparent 2px) 0 0 / 20px 20px,
      radial-gradient(circle at 10px 10px, rgba(243,205,134,.08) 1px, transparent 2px) 10px 10px / 20px 20px,
      linear-gradient(180deg, #f4eddf 0%, #ebe3d2 100%);
    color:var(--navy-800);
    display:flex; align-items:center; justify-content:space-between;
    padding:0 2vw 0 3vw;
    z-index:5;
    border-top:1px solid rgba(243,205,134,.4);
    border-bottom:1px solid rgba(243,205,134,.4);
  }
  .bottom-panel .name{ font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:clamp(28px,3vw,60px); line-height:1; letter-spacing:-1px; }
  .bottom-panel .accent{ background:linear-gradient(180deg,#c89a45,#a37a2a); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .bottom-panel .addr{ font-size:clamp(12px,1vw,20px); margin-top:.7vh; color:rgba(10,31,77,.7); font-weight:500; }
  .logo{ width:clamp(56px,5vw,100px); height:clamp(56px,5vw,100px); border-radius:14px; background:linear-gradient(135deg,#c89a45,#f0cd86 50%,#a37a2a); border:2px solid rgba(255,235,180,.7); display:grid; place-items:center; box-shadow:0 6px 18px rgba(0,0,0,.25); }
  .logo :global(svg){ width:60%; height:60%; color:#0a1f4d; }
</style>
